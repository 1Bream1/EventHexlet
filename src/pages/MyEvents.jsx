import { useEffect, useState } from "react";
import { supabase, isPast } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import EventCard from "../components/EventCard";
import { Loading, Empty } from "../components/ui";

export default function MyEvents() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState(null);

  const load = async () => {
    const { data: regs } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("user_id", user.id);
    const ids = (regs ?? []).map((r) => r.event_id);
    if (!ids.length) return setEvents([]);
    const { data } = await supabase
      .from("events_with_counts")
      .select("*")
      .in("id", ids)
      .order("date");
    setEvents(data ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", id)
      .eq("user_id", user.id);
    if (error) return toast(error.message, "err");
    toast("Регистрация отменена");
    load();
  };
  if (!events) return <Loading />;
  const upcoming = events.filter((e) => !isPast(e));
  const past = events.filter(isPast);

  return (
    <div className="container section">
      <h1>Мои мероприятия</h1>
      {events.length === 0 && (
        <Empty
          title="Вы пока ни на что не записались"
          text="Найдите интересное событие и присоединяйтесь к нему"
          to="/events"
          action="Посмотреть мероприятия"
        />
      )}
      {upcoming.length > 0 && (
        <>
          <h2>Предстоящие</h2>
          <div className="grid">
            {upcoming.map((e, i) => (
              <div key={e.id}>
                <EventCard event={e} index={i} registered />
                <button className="btn ghost wide" onClick={() => cancel(e.id)}>
                  Отменить регистрацию
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {past.length > 0 && (
        <>
          <h2>Прошедшие</h2>
          <div className="grid">
            {past.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} registered />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
