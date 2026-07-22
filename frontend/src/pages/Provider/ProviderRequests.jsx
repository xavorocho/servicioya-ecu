import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/UI/Toast";
import api from "../../api/client";
import { Icon, EmptyState } from "../../components/UI/helpers";

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

export default function ProviderRequests() {
  const { user } = useAuth();
  const showToast = useToast();
  const [requests, setRequests] = useState([]);

  const load = () => api.get("/requests").then(({ data }) => setRequests(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const startWork = async (id) => {
    try {
      await api.put(`/requests/${id}/start-work`);
      showToast("Trabajo iniciado");
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error", "error");
    }
  };

  const completeWork = async (id) => {
    try {
      await api.put(`/requests/${id}/complete`);
      showToast("Trabajo completado");
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error", "error");
    }
  };

  const pending = requests.filter((r) => r.status === "pendiente_cotizacion").length;
  const quoted = requests.filter((r) => ["cotizacion_enviada", "hora_propuesta_cliente"].includes(r.status)).length;
  const active = requests.filter((r) => ["confirmada", "confirmada_pagada", "en_proceso"].includes(r.status)).length;
  const completed = requests.filter((r) => ["completada", "calificada"].includes(r.status)).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Solicitudes recibidas</h1>
      <p className="text-gray-500 mt-1 mb-6">Revisa solicitudes, envía cotizaciones y gestiona tus trabajos.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { v: pending, l: "Pendientes", i: "clock", c: "bg-amber-50 text-amber-600" },
          { v: quoted, l: "Cotizadas", i: "file-shield", c: "bg-blue-50 text-blue-600" },
          { v: active, l: "Activas", i: "spinner", c: "bg-purple-50 text-purple-600" },
          { v: completed, l: "Completadas", i: "check-double", c: "bg-emerald-50 text-emerald-600" },
        ].map((s) => (
          <div key={s.l} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.c}`}><Icon name={s.i} /></div>
            <div><strong className="block text-xl font-extrabold text-gray-900">{s.v}</strong><span className="text-xs text-gray-500 font-semibold">{s.l}</span></div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {requests.length ? requests.map((r) => (
          <article key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{r.displayId} · {r.service}</h3>
                <p className="text-xs text-gray-500">{r.client} · {r.city} · {r.preferredDate || "Sin fecha"} · {r.preferredTimeRange || "Sin horario"}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{r.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[0.65rem] font-semibold border border-gray-100"><Icon name="user" /> {r.client}</span>
              {r.phone && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[0.65rem] font-semibold border border-gray-100"><Icon name="phone" /> {r.phone}</span>}
              {r.address && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[0.65rem] font-semibold border border-gray-100"><Icon name="location-dot" /> {r.address}</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              {r.status === "pendiente_cotizacion" && (
                <Link to={`/proveedor/cotizar/${r.id}`} className="btn btn-primary btn-small"><Icon name="file-shield" /> Crear cotización</Link>
              )}
              {["cotizacion_enviada", "hora_propuesta_cliente"].includes(r.status) && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200"><Icon name="clock" /> Esperando respuesta del cliente</span>
              )}
              {r.status === "confirmada" && (
                <button onClick={() => startWork(r.id)} className="btn btn-primary btn-small"><Icon name="spinner" /> Iniciar trabajo</button>
              )}
              {r.status === "confirmada_pagada" && (
                <button onClick={() => startWork(r.id)} className="btn btn-primary btn-small"><Icon name="spinner" /> Iniciar trabajo</button>
              )}
              {r.status === "en_proceso" && (
                <button onClick={() => completeWork(r.id)} className="btn btn-primary btn-small"><Icon name="check-double" /> Completar trabajo</button>
              )}
              {r.status === "completada" && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200"><Icon name="circle-check" /> Esperando calificación</span>
              )}
              {r.status === "calificada" && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200"><Icon name="award" /> Finalizado</span>
              )}
              {r.providerId && <Link to={`/perfil/${r.providerId}`} className="btn btn-outline btn-small"><Icon name="user" /> Ver perfil</Link>}
            </div>
          </article>
        )) : (
          <EmptyState icon="inbox" title="Sin solicitudes" message="Todavía no tienes solicitudes recibidas." />
        )}
      </div>
    </div>
  );
}
