import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase, CATEGORIES } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loading } from "../components/ui";

const empty = {
  title: "",
  short_description: "",
  description: "",
  category: "Лекция",
  date: "",
  time: "",
  location: "",
  image_url: "",
  max_participants: 30,
};

export default function EventForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [f, setF] = useState(id ? null : empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (id)
      supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => setF({ ...data, time: data.time.slice(0, 5) }));
  }, [id]);
  if (!f) return <Loading />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    setError("");
    if (!f.title.trim() || !f.date || !f.time || !f.location.trim())
      return setError("Заполните название, дату, время и место");
    if (Number(f.max_participants) < 1)
      return setError("Участников должно быть минимум 1");
    setBusy(true);
    const row = {
      title: f.title,
      short_description: f.short_description,
      description: f.description,
      category: f.category,
      date: f.date,
      time: f.time,
      location: f.location,
      image_url: f.image_url,
      max_participants: Number(f.max_participants),
    };
    const { error } = id
      ? await supabase
          .from("events")
          .update({ ...row, updated_at: new Date().toISOString() })
          .eq("id", id)
      : await supabase.from("events").insert({ ...row, created_by: user.id });
    setBusy(false);
    if (error) return setError(error.message);
    toast(id ? "Изменения сохранены" : "Мероприятие успешно создано");
    navigate("/admin");
  };

  return (
    <div className="container section narrow">
      <form className="panel" onSubmit={submit}>
        <h1>{id ? "Редактирование мероприятия" : "Новое мероприятие"}</h1>
        <label>
          Название
          <input value={f.title} onChange={set("title")} />
        </label>
        <label>
          Краткое описание
          <input
            value={f.short_description ?? ""}
            onChange={set("short_description")}
          />
        </label>
        <label>
          Полное описание
          <textarea
            rows="5"
            value={f.description ?? ""}
            onChange={set("description")}
          />
        </label>
        <label>
          Категория
          <select value={f.category} onChange={set("category")}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="two">
          <label>
            Дата
            <input type="date" value={f.date} onChange={set("date")} />
          </label>
          <label>
            Время
            <input type="time" value={f.time} onChange={set("time")} />
          </label>
        </div>
        <label>
          Место
          <input value={f.location ?? ""} onChange={set("location")} />
        </label>
        <label>
          Ссылка на изображение
          <input
            value={f.image_url ?? ""}
            onChange={set("image_url")}
            placeholder="https://…"
          />
        </label>
        <label>
          Максимум участников
          <input
            type="number"
            min="1"
            value={f.max_participants}
            onChange={set("max_participants")}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="row">
          <button className="btn" disabled={busy}>
            {busy ? "Сохраняем…" : id ? "Сохранить" : "Создать"}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => navigate("/admin")}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
