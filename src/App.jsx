import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import { Footer, Protected } from "./components/ui";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import { Login, Register } from "./pages/AuthPages";
import MyEvents from "./pages/MyEvents";
import Admin from "./pages/Admin";
import EventForm from "./pages/EventForm";
import AdminUsers from "./pages/AdminUsers";

export default function App() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/my-events"
                element={
                  <Protected>
                    <MyEvents />
                  </Protected>
                }
              />
              <Route
                path="/admin"
                element={
                  <Protected admin>
                    <Admin />
                  </Protected>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <Protected admin>
                    <AdminUsers />
                  </Protected>
                }
              />
              <Route
                path="/admin/events/new"
                element={
                  <Protected admin>
                    <EventForm />
                  </Protected>
                }
              />
              <Route
                path="/admin/events/:id/edit"
                element={
                  <Protected admin>
                    <EventForm />
                  </Protected>
                }
              />
              <Route
                path="*"
                element={
                  <div className="container section">
                    <h1>Страница не найдена</h1>
                  </div>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
