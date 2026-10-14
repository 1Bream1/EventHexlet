import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
export const CATEGORIES = [
  "Лекция",
  "Мастер-класс",
  "Хакатон",
  "Встреча",
  "Спорт",
  "Карьера",
  "Другое",
];
export const fmtDate = (d) =>
  new Date(d + "T00:00").toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
export const today = () => new Date().toLocaleDateString("sv-SE");
export const isPast = (e) => e.date < today();
export const spotsLeft = (e) => e.max_participants - (e.registered_count ?? 0);
export function status(e, registered) {
  const left = spotsLeft(e);
  if (registered) return { text: "Вы записаны", cls: "mine" };
  if (left <= 0) return { text: "Мест нет", cls: "full" };
  if (left <= e.max_participants * 0.2)
    return { text: "Почти заполнено", cls: "low" };
  return { text: "Свободные места", cls: "free" };
}
