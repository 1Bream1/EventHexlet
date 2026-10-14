import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase, today, fmtDate } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import { Loading, Empty } from "../components/ui";

export default function Home() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState(null);
  useEffect(() => {
    supabase
      .from("events_with_counts")
      .select("*")
      .gte("date", today())
      .order("date")
      .order("time")
      .limit(6)
      .then(({ data }) => setEvents(data ?? []));
  }, []);
  const now = events?.filter((e) => e.date === today()) ?? [];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>Афиша Хекслет</h1>
            <p className="lead">
              События, встречи и возможности, которые происходят в нашем
              колледже.
            </p>
            <div className="row">
              <Link to="/events" className="btn">
                Смотреть мероприятия
              </Link>
              {isAdmin && (
                <Link to="/admin/events/new" className="btn ghost">
                  Создать мероприятие
                </Link>
              )}
            </div>
          </motion.div>
          <motion.aside
            className="today"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Сегодня в Хекслет</h3>
            {now.length ? (
              now.map((e) => (
                <Link key={e.id} to={`/events/${e.id}`} className="today-item">
                  <b>{e.time.slice(0, 5)}</b> {e.title}
                </Link>
              ))
            ) : (
              <p className="muted">
                Сегодня без мероприятий. Ближайшие события — ниже.
              </p>
            )}
            <small className="muted">{fmtDate(today())}</small>
          </motion.aside>
        </div>
      </section>
      <section className="container section">
        <h2>Ближайшие мероприятия</h2>
        {!events ? (
          <Loading />
        ) : events.length === 0 ? (
          <Empty
            title="Пока нет мероприятий"
            text="Скоро здесь появятся новые события."
          />
        ) : (
          <div className="grid">
            {events.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
