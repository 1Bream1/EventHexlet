import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { supabase, fmtDate, spotsLeft, isPast } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loading } from "../components/ui";

export default function EventDetails() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [e, setE] = useState(null);
  const [reg, setReg] = useState(false);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("events_with_counts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!data) return setMissing(true);
    setE(data);
    if (user) {
      const r = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      setReg(!!r.data);
    }
  };
  useEffect(() => {
    load();
  }, [id, user?.id]);

  const toggle = async () => {
    if (!user) return navigate("/login");
    setBusy(true);
    const { error } = reg
      ? await supabase
          .from("event_registrations")
          .delete()
          .eq("event_id", id)
          .eq("user_id", user.id)
      : await supabase
          .from("event_registrations")
          .insert({ event_id: id, user_id: user.id });
    setBusy(false);
    if (error)
      toast(
        error.message.includes("duplicate") ? "Вы уже записаны" : error.message,
        "err"
      );
    else
      toast(
        reg ? "Регистрация отменена" : "Вы успешно записались на мероприятие"
      );
    load();
  };

  if (missing)
    return (
      <div className="container section">
        <h1>Мероприятие не найдено</h1>
        <Link to="/events" className="btn">
          К списку
        </Link>
      </div>
    );
  if (!e) return <Loading />;
  const left = spotsLeft(e);
  const pct = Math.min(100, (e.registered_count / e.max_participants) * 100);

  return (
    <div className="container section details">
      <div
        className="cover"
        style={{ backgroundImage: `url(${e.image_url})` }}
      />
      <span className="chip static">{e.category}</span>
      <h1>{e.title}</h1>
      <ul className="meta big">
        <li>
          <Calendar size={18} /> {fmtDate(e.date)}
        </li>
        <li>
          <Clock size={18} /> {e.time.slice(0, 5)}
        </li>
        <li>
          <MapPin size={18} /> {e.location}
        </li>
        <li>
          <User size={18} /> Организатор: администрация Хекслет
        </li>
      </ul>
      <p className="desc">{e.description}</p>
      <div className="panel">
        <p>
          <b>
            {e.registered_count} / {e.max_participants} участников
          </b>{" "}
          · свободно {Math.max(left, 0)}
        </p>
        <div className="progress">
          <div style={{ width: `${pct}%` }} />
        </div>
        {isAdmin ? (
          <Link to={`/admin/events/${e.id}/edit`} className="btn">
            Редактировать
          </Link>
        ) : isPast(e) ? (
          <p className="muted">Мероприятие уже прошло</p>
        ) : reg ? (
          <div className="row">
            <span className="badge mine">Вы записаны ✓</span>
            <button className="btn ghost" disabled={busy} onClick={toggle}>
              Отменить регистрацию
            </button>
          </div>
        ) : left <= 0 ? (
          <button className="btn" disabled>
            Мест больше нет
          </button>
        ) : (
          <button className="btn" disabled={busy} onClick={toggle}>
            {busy ? "Записываем…" : "Записаться на мероприятие"}
          </button>
        )}
      </div>
    </div>
  );
}
