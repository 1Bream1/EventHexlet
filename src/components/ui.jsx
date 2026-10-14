import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Loading = () => (
  <div className="loading">
    <div className="spinner" />
  </div>
);

export const Empty = ({ title, text, to, action }) => (
  <div className="empty">
    <h3>{title}</h3>
    <p className="muted">{text}</p>
    {to && (
      <Link to={to} className="btn">
        {action}
      </Link>
    )}
  </div>
);

export function Modal({ title, text, onConfirm, onCancel, busy }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="muted">{text}</p>
        <div className="row">
          <button className="btn danger" disabled={busy} onClick={onConfirm}>
            {busy ? "Удаляем…" : "Удалить"}
          </button>
          <button className="btn ghost" onClick={onCancel}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

export function Protected({ children, admin }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export const Footer = () => (
  <footer className="footer">
    <div className="container">
      © {new Date().getFullYear()} Колледж Хекслет · Учебный проект
    </div>
  </footer>
);
