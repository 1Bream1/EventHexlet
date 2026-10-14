import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);
  const logout = async () => {
    await signOut();
    close();
    navigate("/");
  };

  const links = (
    <>
      <NavLink to="/" end onClick={close}>
        Главная
      </NavLink>
      <NavLink to="/events" onClick={close}>
        Мероприятия
      </NavLink>
      {user && !isAdmin && (
        <NavLink to="/my-events" onClick={close}>
          Мои мероприятия
        </NavLink>
      )}
      {isAdmin && (
        <NavLink to="/admin" onClick={close}>
          Панель администратора
        </NavLink>
      )}
      {user ? (
        <>
          <span className="who">{profile?.full_name}</span>
          <button className="btn ghost small" onClick={logout}>
            Выйти
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" onClick={close}>
            Войти
          </NavLink>
          <Link to="/register" className="btn small" onClick={close}>
            Регистрация
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <GraduationCap size={22} /> Хекслет Events
        </Link>
        <nav className="nav-links">{links}</nav>
        <button
          className="burger"
          aria-label="Меню"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {links}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
