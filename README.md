# Хекслет Events

Афиша мероприятий колледжа: студенты смотрят события и записываются, администратор управляет событиями и ролями.
**Стек:** React 18, Vite, React Router, Supabase (Auth + Postgres + RLS), Lucide React, Framer Motion, обычный CSS.

## Запуск
1. `npm install`
2. Создайте проект на [supabase.com](https://supabase.com) → **Project Settings → API**: скопируйте *Project URL* и *anon public key*.
3. Скопируйте `.env.example` в `.env` и вставьте значения (service_role ключ НЕ нужен и никогда не кладётся во frontend):
   ```env
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```
4. В Supabase откройте **SQL Editor**, вставьте весь файл `supabase/schema.sql` и нажмите Run. Он создаёт таблицы `profiles`, `events`, `event_registrations`, индексы, триггеры, RLS-политики и 6 тестовых мероприятий.
5. Для разработки отключите подтверждение почты: **Authentication → Providers → Email → Confirm email = off** (иначе после регистрации нужно перейти по ссылке из письма).
6. `npm run dev` → http://localhost:5173

## Первый администратор
Зарегистрируйтесь на сайте как обычный студент, затем в SQL Editor выполните:
```sql
update profiles set role = 'admin' where email = 'ваш@email.com';
```
Перезайдите на сайт — появится «Панель администратора». Выбрать admin при регистрации нельзя: форма роль не передаёт, а триггер `handle_new_user` всегда создаёт `student`.

## Как это работает
- **Авторизация:** Supabase Auth (email + пароль). `AuthContext` хранит сессию и строку из `profiles` (там роль).
- **Роли:** `student` (по умолчанию) и `admin`. Frontend скрывает лишние ссылки и защищает маршруты (`Protected`), но настоящая защита — в базе.
- **RLS (Row Level Security):** к каждой строке применяются политики, которые проверяют `auth.uid()` (кто делает запрос) и функцию `is_admin()`:
  - `events` — читают все; создаёт/меняет/удаляет только админ.
  - `event_registrations` — студент видит, создаёт и удаляет только **свои** записи (`user_id = auth.uid()`); админ видит все.
  - `profiles` — студент видит только свой профиль; админ видит всех и единственный может менять роли.
  - Даже если студент вызовет API напрямую, база отклонит запрос.
- **Лимит мест и дубли:** `unique (event_id, user_id)` запрещает повторную запись; триггер `check_capacity` не пускает сверх `max_participants`.
- **Счётчики мест:** студент не видит чужих записей, поэтому счётчик берётся из view `events_with_counts`.

## Структура
`src/components` (Navbar, EventCard, ui), `src/pages`, `src/context` (Auth, Toast), `src/lib/supabase.js`, `supabase/schema.sql`.

## Что не сделано
Блокировка пользователей, избранное, календарь — для простоты опущены.
