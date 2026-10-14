create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text, full_name text, avatar_url text,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null, short_description text, description text,
  category text not null default 'Другое'
    check (category in ('Лекция','Мастер-класс','Хакатон','Встреча','Спорт','Карьера','Другое')),
  date date not null, time time not null, location text, image_url text,
  max_participants int not null default 30 check (max_participants > 0),
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  registered_at timestamptz not null default now(),
  unique (event_id, user_id)
);
create index on events (date);
create index on event_registrations (user_id);
create index on event_registrations (event_id);

create view events_with_counts as
  select e.*, (select count(*) from event_registrations r where r.event_id = e.id)::int as registered_count
  from events e;
grant select on events_with_counts to anon, authenticated;

create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function is_admin() returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

create function check_capacity() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from event_registrations where event_id = new.event_id)
     >= (select max_participants from events where id = new.event_id) then
    raise exception 'Мест больше нет';
  end if;
  return new;
end $$;
create trigger registrations_capacity before insert on event_registrations for each row execute function check_capacity();

alter table profiles enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;

create policy "profiles: свой или админ" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles: админ меняет роли" on profiles for update using (is_admin()) with check (is_admin());

create policy "events: читают все" on events for select using (true);
create policy "events: админ создаёт" on events for insert with check (is_admin());
create policy "events: админ правит" on events for update using (is_admin());
create policy "events: админ удаляет" on events for delete using (is_admin());

create policy "regs: свои или админ" on event_registrations for select using (user_id = auth.uid() or is_admin());
create policy "regs: запись только за себя" on event_registrations for insert with check (user_id = auth.uid());
create policy "regs: отмена только своей" on event_registrations for delete using (user_id = auth.uid());

insert into events (title, short_description, description, category, date, time, location, image_url, max_participants) values
('Frontend-разработка с React','Практическая лекция: компоненты, хуки и состояние.','Разберём, как устроен React, напишем небольшое приложение и обсудим типичные ошибки новичков.','Лекция', current_date+3,'15:00','Ауд. 204','https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',40),
('Встреча с разработчиками','Профессионалы рассказывают, как попасть в IT.','Разработчики из местных компаний расскажут о своём пути, ответят на вопросы и дадут советы по стажировкам.','Встреча', current_date+6,'17:30','Актовый зал','https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',80),
('Хакатон Хекслет','24 часа, команды по 4 человека, один продукт.','Соберите команду, придумайте идею и покажите рабочий прототип жюри. Призы и менторы на площадке.','Хакатон', current_date+14,'10:00','Коворкинг, 2 этаж','https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',60),
('Мастер-класс по Git','Ветки, merge и pull request без страха.','Практика на реальном репозитории: конфликты, rebase и командная работа через GitHub.','Мастер-класс', current_date+2,'14:00','Компьютерный класс 3','https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800',20),
('Карьерный день','Компании, вакансии и разбор резюме.','Представители компаний проведут мини-собеседования и проверят ваши резюме и портфолио.','Карьера', current_date+20,'11:00','Холл 1 этажа','https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',100),
('Настольный вечер студентов','Неформальный вечер с играми и чаем.','Приносите любимые настолки или играйте в наши. Отличный повод познакомиться с ребятами с других курсов.','Другое', current_date,'18:00','Студенческая гостиная','https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800',25);

