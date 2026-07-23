import { useState, useEffect } from "react";
import api from "../../api/client";
import { Icon, StatCard, Breadcrumb, EmptyState } from "../../components/UI/helpers";

const STATUS_COLORS = {
  pendiente_cotizacion: "bg-amber-50 text-amber-700 border-amber-200",
  cotizacion_enviada: "bg-blue-50 text-blue-700 border-blue-200",
  hora_propuesta_cliente: "bg-purple-50 text-purple-700 border-purple-200",
  confirmada: "bg-indigo-50 text-indigo-700 border-indigo-200",
  confirmada_pagada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  en_proceso: "bg-cyan-50 text-cyan-700 border-cyan-200",
  completada: "bg-green-50 text-green-700 border-green-200",
  calificada: "bg-amber-50 text-amber-700 border-amber-200",
  cancelada: "bg-red-50 text-red-700 border-red-200",
  rechazada: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS = {
  pendiente_cotizacion: "Pendiente cotización",
  cotizacion_enviada: "Cotización enviada",
  hora_propuesta_cliente: "Hora propuesta",
  confirmada: "Confirmada",
  confirmada_pagada: "Confirmada pagada",
  en_proceso: "En proceso",
  completada: "Completada",
  calificada: "Calificada",
  cancelada: "Cancelada",
  rechazada: "Rechazada",
};

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/requests")
      .then(({ data }) => setRequests(data))
      .finally(() => setLoading(false));
  }, []);

  const cities = [...new Set(requests.map((r) => r.city).filter(Boolean))].sort();

  const filtered = requests.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (cityFilter && r.city !== cityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = r.client?.toLowerCase().includes(q);
      const matchId = r.displayId?.toLowerCase().includes(q);
      const matchProvider = r.providerName?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchProvider) return false;
    }
    return true;
  });

  const total = requests.length;
  const pendientes = requests.filter((r) => r.status === "pendiente_cotizacion" || r.status === "cotizacion_enviada" || r.status === "hora_propuesta_cliente").length;
  const enProceso = requests.filter((r) => r.status === "confirmada" || r.status === "confirmada_pagada" || r.status === "en_proceso").length;
  const completadas = requests.filter((r) => r.status === "completada" || r.status === "calificada").length;
  const canceladas = requests.filter((r) => r.status === "cancelada" || r.status === "rechazada").length;

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Icon name="spinner" /> Cargando solicitudes...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin/inicio" }, { label: "Solicitudes" }]} />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Gestión de solicitudes</h1>
      <p className="text-gray-500 mt-1 mb-6">Consulta, filtra y administra todas las solicitudes de servicio de la plataforma.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard value={total} label="Total" icon="clipboard-list" color="blue" />
        <StatCard value={pendientes} label="Pendientes" icon="clock" color="orange" />
        <StatCard value={enProceso} label="En proceso" icon="spinner" color="purple" />
        <StatCard value={completadas} label="Completadas" icon="check-double" color="green" />
        <StatCard value={canceladas} label="Canceladas" icon="ban" color="red" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Buscar por cliente, ID o proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition min-w-[180px]"
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition min-w-[160px]"
          >
            <option value="">Todas las ciudades</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {(statusFilter || cityFilter || search) && (
            <button
              onClick={() => { setStatusFilter(""); setCityFilter(""); setSearch(""); }}
              className="btn btn-outline btn-small whitespace-nowrap"
            >
              <Icon name="xmark" /> Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((r) => (
            <article
              key={r.id}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-extrabold flex-shrink-0">
                    {r.displayId}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm text-gray-900">{r.service}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border ${STATUS_COLORS[r.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                        {STATUS_LABELS[r.status] || r.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-semibold">
                      <span className="flex items-center gap-1"><Icon name="user" className="text-[0.7rem]" /> {r.client}</span>
                      <span className="flex items-center gap-1"><Icon name="toolbox" className="text-[0.7rem]" /> {r.providerName}</span>
                      {r.city && <span className="flex items-center gap-1"><Icon name="location-dot" className="text-[0.7rem]" /> {r.city}</span>}
                      <span className="flex items-center gap-1"><Icon name="clock" className="text-[0.7rem]" /> {formatDate(r.createdAt || r.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 sm:ml-4">
                  <a
                    href={`/admin/solicitudes/${r.id}`}
                    className="btn btn-outline btn-small"
                  >
                    <Icon name="circle-info" /> Ver detalle
                  </a>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            icon="clipboard-list"
            title="No se encontraron solicitudes"
            message={
              statusFilter || cityFilter || search
                ? "No hay resultados para los filtros aplicados. Prueba con otros criterios de búsqueda."
                : "Aún no existen solicitudes en la plataforma."
            }
            action={
              (statusFilter || cityFilter || search) && (
                <button
                  onClick={() => { setStatusFilter(""); setCityFilter(""); setSearch(""); }}
                  className="btn btn-primary btn-small"
                >
                  <Icon name="rotate-left" /> Limpiar filtros
                </button>
              )
            }
          />
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400 font-semibold mt-6">
          Mostrando {filtered.length} de {total} solicitudes
        </p>
      )}
    </div>
  );
}
