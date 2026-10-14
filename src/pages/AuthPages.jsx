import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function AuthForm({ register }) {
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", repeat: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    setError("");
    if (register && !f.name.trim()) return setError("Введите имя");
    if (!/^\S+@\S+\.\S+$/.test(f.email))
      return setError("Введите корректный email");
    if (f.password.length < 6) return setError("Пароль — минимум 6 символов");
    if (register && f.password !== f.repeat)
      return setError("Пароли не совпадают");
    setBusy(true);
    const { data, error } = register
      ? await signUp(f.email, f.password, f.name.trim())
      : await signIn(f.email, f.password);
    setBusy(false);
    if (error)
      return setError(
        error.message.includes("Invalid login")
          ? "Неверный email или пароль"
          : error.message
      );
    if (register && !data.session) {
      toast("Подтвердите email — письмо отправлено");
      return navigate("/login");
    }
    toast(register ? "Аккаунт создан" : "С возвращением!");
    navigate("/");
  };

  return (
    <div className="container auth">
      <form className="panel" onSubmit={submit} noValidate>
        <h1>{register ? "Регистрация" : "Вход"}</h1>
        {register && (
          <label>
            Имя
            <input value={f.name} onChange={set("name")} autoComplete="name" />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={f.email}
            onChange={set("email")}
            autoComplete="email"
          />
        </label>
        <label>
          Пароль
          <span className="pw">
            <input
              type={show ? "text" : "password"}
              value={f.password}
              onChange={set("password")}
              autoComplete={register ? "new-password" : "current-password"}
            />
            <button
              type="button"
              aria-label="Показать пароль"
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        {register && (
          <label>
            Повторите пароль
            <input
              type={show ? "text" : "password"}
              value={f.repeat}
              onChange={set("repeat")}
              autoComplete="new-password"
            />
          </label>
        )}
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? "Подождите…" : register ? "Создать аккаунт" : "Войти"}
        </button>
        <p className="muted">
          {register ? (
            <>
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </>
          ) : (
            <>
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
export const Login = () => <AuthForm />;
export const Register = () => <AuthForm register />;
