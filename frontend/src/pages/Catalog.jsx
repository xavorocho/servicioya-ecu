import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Icon, StatusBadge, EmptyState } from "../components/UI/helpers";

const CATEGORIES = [
  { id: "plomeria", name: "Plomería" }, { id: "electricidad", name: "Electricidad" },
  { id: "limpieza", name: "Limpieza" }, { id: "pintura", name: "Pintura" },
  { id: "carpinteria", name: "Carpintería" }, { id: "jardineria", name: "Jardinería" },
  { id: "electrodomesticos", name: "Electrodomésticos" }, { id: "mudanzas", name: "Mudanzas" },
  { id: "cerrajeria", name: "Cerrajería" }, { id: "cuidado", name: "Cuidado del hogar" },
];
const CITIES = ["Quito", "Latacunga", "Ambato", "Pelileo", "Sangolquí", "Riobamba"];

function ProviderCard({ provider, role }) {
  const canRequest = role === "cliente" && provider.available;
  return (
    <article className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold flex-shrink-0">
          {provider.name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-sm">{provider.name}</h3>
            {provider.verified && <StatusBadge status="Aprobado" />}
          </div>
          <p className="text-xs text-gray-500 mt-0.5"><Icon name={provider.categoryIcon || "wrench"} className="mr-1" />{provider.categoryName} · <Icon name="location-dot" className="mr-1" />{provider.city}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">{provider.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[0.65rem] font-semibold"><Icon name="briefcase" className="text-blue-600 text-[0.55rem]" /> {provider.experience}</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[0.65rem] font-semibold"><Icon name="star" className="text-blue-600 text-[0.55rem]" /> {provider.rating || "Nuevo"} ({provider.reviews})</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[0.65rem] font-semibold"><Icon name="dollar-sign" className="text-blue-600 text-[0.55rem]" /> ${provider.price}/h</span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-semibold ${provider.available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          <Icon name={provider.available ? "circle-check" : "circle-xmark"} className="text-[0.5rem]" /> {provider.available ? "Disponible" : "No disponible"}
        </span>
      </div>
      <div className="flex gap-2 mt-auto">
        <Link to={`/perfil/${provider.id}`} className="btn btn-primary btn-small flex-1 text-center"><Icon name="user" /> Ver perfil</Link>
        {canRequest ? (
          <Link to={`/cliente/solicitar/${provider.id}`} className="btn btn-secondary btn-small flex-1 text-center"><Icon name="paper-plane" /> Solicitar</Link>
        ) : role === "cliente" ? (
          <button className="btn btn-outline btn-small flex-1 is-disabled" disabled><Icon name="paper-plane" /> No disponible</button>
        ) : null}
      </div>
    </article>
  );
}

export default function Catalog() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "todos",
    city: searchParams.get("city") || "todos",
    rating: "0",
    available: false,
  });
  const [sort, setSort] = useState("rating");

  useEffect(() => {
    api.get("/providers").then(({ data }) => setProviders(data)).catch(() => {});
  }, []);

  const filtered = providers
    .filter((p) => {
      const s = filters.q.toLowerCase();
      return (!s || p.name.toLowerCase().includes(s) || p.categoryName.toLowerCase().includes(s) || p.city.toLowerCase().includes(s) || p.description.toLowerCase().includes(s))
        && (filters.category === "todos" || p.category === filters.category)
        && (filters.city === "todos" || p.city === filters.city)
        && (Number(p.rating || 0) >= Number(filters.rating))
        && (!filters.available || p.available);
    })
    .sort((a, b) => {
      if (sort === "price") return a.price - b.price;
      if (sort === "reviews") return b.reviews - a.reviews;
      return Number(b.rating || 0) - Number(a.rating || 0);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="grid lg:grid-cols-[280px_1fr] gap-6 items-start">
        <aside className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4 lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900"><Icon name="sliders" /> Filtros</h2>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block"><Icon name="magnifying-glass" className="mr-1" /> Buscar</label>
            <input type="search" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Nombre o palabra clave" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block"><Icon name="tags" className="mr-1" /> Categoría</label>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
              <option value="todos">Todas</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block"><Icon name="location-dot" className="mr-1" /> Ciudad</label>
            <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
              <option value="todos">Todas</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block"><Icon name="star" className="mr-1" /> Calificación mínima</label>
            <select value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
              <option value="0">Todas</option>
              <option value="4">4 estrellas o más</option>
              <option value="4.5">4.5 estrellas o más</option>
              <option value="4.8">4.8 estrellas o más</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <input type="checkbox" checked={filters.available} onChange={(e) => setFilters({ ...filters, available: e.target.checked })} className="w-4 h-4 accent-blue-600" />
            <Icon name="circle-check" className="text-blue-600" /> Solo disponibles hoy
          </label>
          <button onClick={() => setFilters({ q: "", category: "todos", city: "todos", rating: "0", available: false })} className="btn btn-outline btn-small btn-full"><Icon name="rotate-left" /> Limpiar filtros</button>
        </aside>

        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[0.65rem] font-bold uppercase tracking-wide"><Icon name="list" /> Resultados</span>
              <h2 className="text-lg font-extrabold text-gray-900 mt-1">{filtered.length} proveedor(es) encontrado(s)</h2>
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full sm:w-auto h-10 px-3 rounded-lg border border-gray-200 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
              <option value="rating">Mejor calificación</option>
              <option value="price">Menor precio</option>
              <option value="reviews">Más opiniones</option>
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {filtered.length ? filtered.map((p) => <ProviderCard key={p.id} provider={p} role={user?.role} />) : (
              <div className="sm:col-span-2">
                <EmptyState icon="magnifying-glass" title="Sin resultados" message="No se encontraron proveedores con esos filtros." />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
