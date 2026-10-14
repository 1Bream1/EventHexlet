import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, today, fmtDate } from "../lib/supabase";
import { useToast } from "../context/ToastContext";
import { Loading, Modal } from "../components/ui";

export default function Admin() {
  const toast = useToast();
  const [events, setEvents] = useState(null);
  const [stats, setStats] = useState({ students: 0, regs: 0 });
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [ev, st, rg] = await Promise.all([
      supabase
        .from("events_with_counts")
        .select("*")
        .order("date", { ascending: false }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("event_registrations")
        .select("id", { count: "exact", head: true }),
    ]);
    setEvents(ev.data ?? []);
    setStats({ students: st.count ?? 0, regs: rg.count ?? 0 });
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.from("events").delete().eq("id", del.id);
    setBusy(false);
    setDel(null);
    if (error) return toast(error.message, "err");
    toast("Мероприятие удалено");
    load();
  };
  if (!events) return <Loading />;
  const cards = [
    ["Всего мероприятий", events.length],
    ["Предстоящих", events.filter((e) => e.date >= today()).length],
    ["Всего студентов", stats.students],
    ["Всего регистраций", stats.regs],
  ];

  return (
    <div className="container section">
      <div className="between">
        <h1>Панель администратора</h1>
        <div className="row">
          <Link to="/admin/users" className="btn ghost">
            Пользователи
          </Link>
          <Link to="/admin/events/new" className="btn">
            + Создать мероприятие
          </Link>
        </div>
      </div>
      <div className="stats">
        {cards.map(([l, v]) => (
          <div className="panel stat" key={l}>
            <b>{v}</b>
            <span className="muted">{l}</span>
          </div>
        ))}
      </div>
      <h2>Управление мероприятиями</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Мероприятие</th>
              <th>Дата</th>
              <th>Категория</th>
              <th>Участники</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link to={`/events/${e.id}`}>{e.title}</Link>
                </td>
                <td>{fmtDate(e.date)}</td>
                <td>{e.category}</td>
                <td>
                  {e.registered_count} / {e.max_participants}
                </td>
                <td className="row">
                  <Link
                    to={`/admin/events/${e.id}/edit`}
                    className="btn small ghost"
                  >
                    Редактировать
                  </Link>
                  <button
                    className="btn small danger"
                    onClick={() => setDel(e)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {del && (
        <Modal
          title="Удалить мероприятие?"
          text={`«${del.title}» и все регистрации на него будут удалены.`}
          busy={busy}
          onConfirm={remove}
          onCancel={() => setDel(null)}
        />
      )}
    </div>
  );
}
