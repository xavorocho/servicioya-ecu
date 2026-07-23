import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { Icon } from "./helpers";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const load = () => api.get("/notifications").then(({ data }) => setItems(data)).catch(() => {});
  useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer); }, []);
  const unread = items.filter((item) => !item.read).length;
  const openItem = async (item) => { if (!item.read) await api.put(`/notifications/${item.id}/read`); setOpen(false); if (item.link) navigate(item.link); load(); };
  const readAll = async () => { await api.put("/notifications/mark-all"); load(); };
  return <div className="relative"><button type="button" onClick={() => setOpen(!open)} className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-blue-50" aria-label="Notificaciones"><Icon name="bell" />{unread > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[0.65rem] font-bold flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}</button>{open && <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl border shadow-xl z-[60]"><div className="p-3 border-b flex justify-between"><strong className="text-sm">Notificaciones</strong>{unread > 0 && <button type="button" onClick={readAll} className="text-xs text-blue-600 font-bold">Marcar leídas</button>}</div>{items.length ? items.map((item) => <button key={item.id} type="button" onClick={() => openItem(item)} className={`w-full text-left p-3 border-b hover:bg-gray-50 ${item.read ? "opacity-70" : "bg-blue-50/60"}`}><strong className="text-xs block">{item.title}</strong><span className="text-xs text-gray-600 block mt-1">{item.message}</span><time className="text-[0.65rem] text-gray-400">{new Date(item.createdAt).toLocaleString("es-EC")}</time></button>) : <p className="p-6 text-center text-sm text-gray-500">Sin notificaciones</p>}</div>}</div>;
}
