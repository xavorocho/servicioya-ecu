import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { Icon } from "../components/UI/helpers";

const CATEGORIES = [
  { id: "plomeria", name: "Plomería", icon: "wrench", desc: "Fugas, tuberías, grifería y mantenimiento.", color: "from-blue-500 to-cyan-500" },
  { id: "electricidad", name: "Electricidad", icon: "bolt", desc: "Instalaciones, tomacorrientes y fallas eléctricas.", color: "from-amber-500 to-yellow-500" },
  { id: "limpieza", name: "Limpieza", icon: "broom", desc: "Limpieza general, profunda y por horas.", color: "from-emerald-500 to-teal-500" },
  { id: "pintura", name: "Pintura", icon: "paint-roller", desc: "Pintura interior, exterior y retoques.", color: "from-purple-500 to-pink-500" },
  { id: "carpinteria", name: "Carpintería", icon: "hammer", desc: "Muebles, puertas, repisas y reparaciones.", color: "from-orange-500 to-red-500" },
  { id: "jardineria", name: "Jardinería", icon: "seedling", desc: "Poda, césped y mantenimiento de jardines.", color: "from-green-500 to-emerald-500" },
  { id: "electrodomesticos", name: "Electrodomésticos", icon: "plug", desc: "Diagnóstico y reparación de equipos.", color: "from-slate-500 to-gray-500" },
  { id: "mudanzas", name: "Mudanzas", icon: "truck", desc: "Carga, traslado y descarga de muebles.", color: "from-indigo-500 to-blue-500" },
  { id: "cerrajeria", name: "Cerrajería", icon: "key", desc: "Chapas, llaves y apertura de puertas.", color: "from-rose-500 to-pink-500" },
  { id: "cuidado", name: "Cuidado del hogar", icon: "house-user", desc: "Asistencia y apoyo en tareas del hogar.", color: "from-violet-500 to-purple-500" },
];

const CITIES = ["Quito", "Latacunga", "Ambato", "Pelileo", "Sangolquí", "Riobamba"];

function ProviderCard({ provider, index }) {
  return (
    <article
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col gap-3 animate-fade-in-up opacity-0"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-500/20 animate-icon-pop">
          {provider.name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-sm">{provider.name}</h3>
            {provider.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[0.6rem] font-bold border border-emerald-200 animate-bounce-subtle">
                <Icon name="shield-halved" className="text-[0.5rem]" /> Verificado
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            <span className="inline-flex items-center gap-0.5">
              <Icon name={provider.category} className="text-[0.65rem]" />
              {provider.categoryName}
            </span>
            {" · "}
            <span className="inline-flex items-center gap-0.5">
              <Icon name="location-dot" className="text-[0.65rem]" />
              {provider.city}
            </span>
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{provider.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {[
          { i: "briefcase", v: provider.experience, c: "text-blue-500" },
          { i: "star", v: `${provider.rating} (${provider.reviews})`, c: "text-amber-500" },
          { i: "dollar-sign", v: `$${provider.price}/h`, c: "text-emerald-500" },
        ].map((x) => (
          <span key={x.i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[0.65rem] font-semibold border border-gray-100">
            <Icon name={x.i} className={`${x.c} text-[0.55rem]"`} /> {x.v}
          </span>
        ))}
      </div>
      <div className="flex gap-2 mt-auto pt-1">
        <Link to={`/perfil/${provider.id}`} className="btn btn-primary btn-small flex-1 text-center">
          <Icon name="user" /> Ver perfil
        </Link>
        <Link to={`/perfil/${provider.id}`} className="btn btn-secondary btn-small flex-1 text-center">
          <Icon name="paper-plane" /> Solicitar
        </Link>
      </div>
    </article>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("todos");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/providers").then(({ data }) => setFeatured(data.slice(0, 3))).catch(() => {});
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city !== "todos") params.set("city", city);
    navigate(`/catalogo?${params.toString()}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="grid lg:grid-cols-[1.5fr_0.85fr] gap-6 items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 p-6 sm:p-10 bg-white shadow-xl shadow-blue-500/5">
            {/* Decorative gradient blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-[0.65rem] font-bold uppercase tracking-wide mb-4 border border-blue-100 animate-fade-in-left">
                <Icon name="map-location-dot" /> Plataforma ecuatoriana
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-2xl animate-fade-in-up">
                Encuentra servicios
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> confiables </span>
                para tu hogar
              </h1>
              <p className="text-gray-500 mt-3 max-w-lg text-sm sm:text-base leading-relaxed animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "forwards", opacity: 0 }}>
                Conectamos clientes con proveedores verificados para trabajos de plomería, electricidad, limpieza, pintura y más.
              </p>

              <div className="flex flex-wrap gap-5 mt-5 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "forwards", opacity: 0 }}>
                {[
                  { v: `${featured.length}+`, l: "Proveedores verificados", i: "users", c: "text-blue-600 bg-blue-50" },
                  { v: CATEGORIES.length, l: "Categorías de servicio", i: "layer-group", c: "text-indigo-600 bg-indigo-50" },
                  { v: CITIES.length, l: "Ciudades disponibles", i: "location-dot", c: "text-cyan-600 bg-cyan-50" },
                ].map((x) => (
                  <div key={x.i} className="flex items-center gap-2.5 group">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${x.c}`}>
                      <Icon name={x.i} />
                    </span>
                    <div className="leading-tight">
                      <strong className="block text-sm text-gray-900">{x.v}</strong>
                      <small className="text-[0.65rem] text-gray-500 font-semibold">{x.l}</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 grid sm:grid-cols-[1fr_180px_auto] gap-3 items-end animate-fade-in-up" style={{ animationDelay: "300ms", animationFillMode: "forwards", opacity: 0 }}>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Servicio que necesitas</label>
                  <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej: plomero, limpieza, electricista..." className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Ciudad</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
                    <option value="todos">Todas las ciudades</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={handleSearch} className="btn btn-primary whitespace-nowrap h-11">
                  <Icon name="magnifying-glass" /> Buscar servicio
                </button>
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xl shadow-blue-500/5 flex flex-col gap-4 animate-fade-in-right">
            <div className="flex items-center justify-between">
              <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 animate-glow">
                <Icon name="shield-halved" />
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[0.6rem] font-bold border border-emerald-200">
                <Icon name="circle-check" /> Avance funcional
              </span>
            </div>
            <h2 className="font-extrabold text-gray-900 text-lg leading-tight">Contrata con más confianza</h2>
            <p className="text-sm text-gray-500 leading-relaxed">Los proveedores se registran, suben documentos de validación y esperan aprobación administrativa.</p>
            <ul className="space-y-2.5 text-sm font-semibold text-gray-700">
              {["Identidad verificada", "Antecedentes revisados", "Calificaciones visibles"].map((t, i) => (
                <li key={t} className="flex items-center gap-2.5 animate-fade-in-left" style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: "forwards", opacity: 0 }}>
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                    <Icon name="check" className="text-[0.55rem]" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link to="/registro" className="btn btn-primary btn-full mt-auto text-center">
              <Icon name="user-plus" /> Crear cuenta gratis
            </Link>
          </aside>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-[0.65rem] font-bold uppercase tracking-wide mb-3 border border-blue-100">
            <Icon name="tags" /> Categorías
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Servicios disponibles</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 stagger-children">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalogo?category=${cat.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:-translate-y-2 hover:border-blue-200 transition-all duration-300 cursor-pointer group animate-fade-in-up opacity-0"
            >
              <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Icon name={cat.icon} />
              </span>
              <strong className="block text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{cat.name}</strong>
              <small className="text-[0.7rem] text-gray-500 mt-1 leading-tight block">{cat.desc}</small>
            </Link>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-[0.65rem] font-bold uppercase tracking-wide mb-3 border border-blue-100">
            <Icon name="route" /> Proceso
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">¿Cómo funciona?</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 stagger-children">
          {[
            { n: "1", i: "magnifying-glass", t: "Busca un servicio", d: "Filtra por categoría, ciudad, calificación y disponibilidad.", color: "from-blue-600 to-blue-400" },
            { n: "2", i: "user-check", t: "Revisa el proveedor", d: "Consulta perfil, experiencia, documentos verificados y comentarios.", color: "from-indigo-600 to-indigo-400" },
            { n: "3", i: "clipboard-check", t: "Solicita y da seguimiento", d: "Envía la solicitud y revisa su estado desde tu cuenta de cliente.", color: "from-cyan-600 to-cyan-400" },
          ].map((s) => (
            <article
              key={s.n}
              className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group animate-fade-in-up opacity-0"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.color} group-hover:h-1.5 transition-all`} />
              <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white font-extrabold text-lg mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {s.n}
              </span>
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Icon name={s.i} className="text-blue-600" />
                {s.t}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Proveedores destacados */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 text-[0.65rem] font-bold uppercase tracking-wide mb-3 border border-blue-100">
              <Icon name="award" /> Destacados
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Proveedores aprobados</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {featured.map((p, i) => <ProviderCard key={p.id} provider={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
