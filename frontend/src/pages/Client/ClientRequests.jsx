import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/UI/Toast";
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

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || "bg-gray-50 text-gray-700 border-gray-200";
  const label = status.replace(/_/g, " ");
  return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border capitalize ${colors}`}>{label}</span>;
}

export default function ClientRequests() {
  const { user } = useAuth();
  const showToast = useToast();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});

  const load = () => {
    api.get("/requests").then(({ data }) => setRequests(data)).catch(() => {});
    api.get("/requests/stats").then(({ data }) => setStats(data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const cancelRequest = async (id) => {
    if (!confirm("¿Cancelar esta solicitud?")) return;
    try {
      await api.put(`/requests/${id}/status`, { status: "cancelada" });
      showToast("Solicitud cancelada.");
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error", "error");
    }
  };

  const getActions = (r) => {
    switch (r.status) {
      case "cotizacion_enviada":
      case "hora_propuesta_cliente":
        return <Link to={`/cliente/cotizacion/${r.id}`} className="btn btn-primary btn-small"><Icon name="clipboard-check" /> Ver cotización</Link>;
      case "confirmada":
        return <Link to={`/cliente/cotizacion/${r.id}`} className="btn btn-primary btn-small"><Icon name="dollar-sign" /> Pagar reserva</Link>;
      case "confirmada_pagada":
      case "en_proceso":
        return <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200"><Icon name="spinner" /> En progreso</span>;
      case "completada":
        return <Link to={`/cliente/cotizacion/${r.id}`} className="btn btn-primary btn-small"><Icon name="award" /> Calificar</Link>;
      case "calificada":
        return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200"><Icon name="circle-check" /> Finalizado</span>;
      case "pendiente_cotizacion":
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200"><Icon name="clock" /> Esperando cotización</span>;
      case "cancelada":
      case "rechazada":
        return <span className="text-xs font-semibold text-red-600">Finalizado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Inicio", href: "/cliente/inicio" }, { label: "Mis solicitudes" }]} />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Mis solicitudes</h1>
      <p className="text-gray-500 mt-1 mb-6">Revisa el estado de tus servicios, paga reservas y califica servicios completados.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard value={stats.total || 0} label="Total" icon="clipboard-list" color="teal" />
        <StatCard value={(stats.pending || 0) + (stats.quoted || 0)} label="Pendientes" icon="clock" color="orange" />
        <StatCard value={(stats.confirmed || 0) + (stats.paid || 0) + (stats.inProgress || 0)} label="Activas" icon="spinner" color="blue" />
        <StatCard value={(stats.completed || 0) + (stats.rated || 0)} label="Completadas" icon="check-double" color="green" />
      </div>

      <div className="space-y-3">
        {requests.length ? requests.map((r) => (
          <article key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{r.displayId} · {r.service}</h3>
                <p className="text-xs text-gray-500">{r.providerName} · {r.city} · {r.preferredDate || "Sin fecha"} · {r.preferredTimeRange || "Sin horario"}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{r.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[0.65rem] font-semibold border border-gray-100"><Icon name="user" /> {r.client}</span>
              {r.phone && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[0.65rem] font-semibold border border-gray-100"><Icon name="phone" /> {r.phone}</span>}
              {r.address && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[0.65rem] font-semibold border border-gray-100"><Icon name="location-dot" /> {r.address}</span>}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {getActions(r)}
              <Link to={`/cliente/solicitud/${r.id}`} className="btn btn-outline btn-small"><Icon name="clipboard-list" /> Ver detalles</Link>
              <Link to={`/perfil/${r.providerId}`} className="btn btn-outline btn-small"><Icon name="user" /> Ver proveedor</Link>
              {["pendiente_cotizacion", "cotizacion_enviada", "confirmada"].includes(r.status) && (
                <button onClick={() => cancelRequest(r.id)} className="btn btn-danger btn-small ml-auto"><Icon name="ban" /> Cancelar</button>
              )}
            </div>
          </article>
        )) : (
          <EmptyState icon="inbox" title="Sin solicitudes" message="Todavía no has solicitado ningún servicio."
            action={<Link to="/cliente/catalogo" className="btn btn-primary"><Icon name="magnifying-glass" /> Buscar servicios</Link>} />
        )}
      </div>
    </div>
  );
}
