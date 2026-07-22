import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { Icon, StatCard, Breadcrumb } from "../../components/UI/helpers";

const CITIES = ["Quito", "Latacunga", "Ambato", "Pelileo", "Sangolquí", "Riobamba"];

export default function ClientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("todos");

  useEffect(() => {
    api.get("/requests").then(({ data }) => setRequests(data)).catch(() => {});
    api.get("/providers").then(({ data }) => setFeatured(data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Panel cliente" }]} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Hola, {user?.name} <Icon name="hand-sparkles" /></h1>
          <p className="text-gray-500 mt-1">Busca proveedores verificados, solicita servicios y revisa el estado de tus solicitudes.</p>
        </div>
        <Link to="/cliente/catalogo" className="btn btn-primary"><Icon name="magnifying-glass" /> Buscar servicio</Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard value={requests.length} label="Mis solicitudes" icon="clipboard-list" color="teal" />
        <StatCard value={requests.filter((r) => r.status === "Pendiente").length} label="Pendientes" icon="clock" color="orange" />
        <StatCard value={requests.filter((r) => r.status === "Confirmada").length} label="Confirmadas" icon="circle-check" color="blue" />
        <StatCard value={requests.filter((r) => r.status === "Completada").length} label="Completadas" icon="check-double" color="green" />
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900"><Icon name="bolt" className="text-blue-600 mr-1.5" /> Buscar servicio rápido</h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[0.6rem] font-bold border border-emerald-200"><Icon name="user" /> Cliente</span>
        </div>
        <div className="grid sm:grid-cols-[1fr_180px_auto] gap-3 items-end">
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ej: plomero, limpieza, electricista..." className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
            <option value="todos">Todas las ciudades</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => { const p = new URLSearchParams(); if (search) p.set("q", search); if (city !== "todos") p.set("city", city); navigate(`/cliente/catalogo?${p.toString()}`); }} className="btn btn-primary whitespace-nowrap"><Icon name="magnifying-glass" /> Buscar</button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">Proveedores recomendados</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {featured.map((p) => (
            <article key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {p.name?.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
                </span>
                <div><h3 className="font-bold text-gray-900 text-sm">{p.name}</h3><p className="text-xs text-gray-500">{p.categoryName} · {p.city}</p></div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.description}</p>
              <div className="flex gap-2">
                <Link to={`/perfil/${p.id}`} className="btn btn-primary btn-small flex-1 text-center"><Icon name="user" /> Ver perfil</Link>
                {p.available && <Link to={`/cliente/solicitar/${p.id}`} className="btn btn-secondary btn-small flex-1 text-center"><Icon name="paper-plane" /> Solicitar</Link>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
