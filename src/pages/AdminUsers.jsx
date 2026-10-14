import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Loading } from "../components/ui";

export default function AdminUsers() {
  const { user } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState(null);
  const [counts, setCounts] = useState({});

  const load = async () => {
    const [p, r] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("event_registrations").select("user_id"),
    ]);
    const c = {};
    (r.data ?? []).forEach((x) => {
      c[x.user_id] = (c[x.user_id] || 0) + 1;
    });
    setCounts(c);
    setUsers(p.data ?? []);
  };
  useEffect(() => {
    load();
  }, []);

  const setRole = async (id, role) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", id);
    if (error) return toast(error.message, "err");
    toast("Роль изменена");
    load();
  };
  if (!users) return <Loading />;

  return (
    <div className="container section">
      <div className="between">
        <h1>Пользователи</h1>
        <Link to="/admin" className="btn ghost">
          ← К панели
        </Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Дата регистрации</th>
              <th>Записей</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    disabled={u.id === user.id}
                    onChange={(e) => setRole(u.id, e.target.value)}
                  >
                    <option value="student">student</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString("ru-RU")}</td>
                <td>{counts[u.id] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
