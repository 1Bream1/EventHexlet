import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { fmtDate, status, spotsLeft } from "../lib/supabase";

export default function EventCard({ event: e, registered, index = 0 }) {
  const s = status(e, registered);
  return (
    <motion.article
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <div
        className="card-img"
        style={{ backgroundImage: `url(${e.image_url})` }}
      >
        <span className="chip">{e.category}</span>
        <span className={`badge ${s.cls}`}>{s.text}</span>
      </div>
      <div className="card-body">
        <h3>{e.title}</h3>
        <p className="muted">{e.short_description}</p>
        <ul className="meta">
          <li>
            <Calendar size={15} /> {fmtDate(e.date)}
          </li>
          <li>
            <Clock size={15} /> {e.time.slice(0, 5)}
          </li>
          <li>
            <MapPin size={15} /> {e.location}
          </li>
        </ul>
        <div className="card-foot">
          <small>
            Свободно: {Math.max(spotsLeft(e), 0)} из {e.max_participants}
          </small>
          <Link to={`/events/${e.id}`} className="btn small">
            Подробнее
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
