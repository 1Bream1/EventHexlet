import { useEffect, useMemo, useState } from "react";
import { supabase, CATEGORIES } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import { Loading, Empty } from "../components/ui";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [mine, setMine] = useState([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("soon");

  useEffect(() => {
    supabase
      .from("events_with_counts")
      .select("*")
      .then(({ data, error }) =>
        error ? setError(error.message) : setEvents(data)
      );
    if (user)
      supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", user.id)
        .then(({ data }) => setMine((data ?? []).map((r) => r.event_id)));
  }, [user?.id]);

  const list = useMemo(() => {
    const l = (events ?? []).filter(
      (e) =>
        e.title.toLowerCase().includes(q.toLowerCase()) &&
        (!cat || e.category === cat) &&
        (!date || e.date === date)
    );
    const key = (e) => e.date + e.time;
    if (sort === "soon") l.sort((a, b) => key(a).localeCompare(key(b)));
    if (sort === "late") l.sort((a, b) => key(b).localeCompare(key(a)));
    if (sort === "popular")
      l.sort((a, b) => b.registered_count - a.registered_count);
    return l;
  }, [events, q, cat, date, sort]);

  return (
    <div className="container section">
      <h1>Мероприятия</h1>
      <div className="filters">
        <input
          placeholder="Поиск по названию"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Все категории</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="soon">Сначала ближайшие</option>
          <option value="late">Сначала поздние</option>
          <option value="popular">По популярности</option>
        </select>
      </div>
      {error ? (
        <p className="error">Не удалось загрузить: {error}</p>
      ) : !events ? (
        <Loading />
      ) : list.length === 0 ? (
        <Empty
          title="Ничего не найдено"
          text="Попробуйте изменить параметры поиска."
        />
      ) : (
        <div className="grid">
          {list.map((e, i) => (
            <EventCard
              key={e.id}
              event={e}
              index={i}
              registered={mine.includes(e.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
