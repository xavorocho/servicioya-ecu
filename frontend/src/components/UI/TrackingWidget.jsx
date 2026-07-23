import { useState, useEffect } from "react";
import api from "../../api/client";
import { Icon } from "./helpers";

const STATUS_CONFIG = {
  pendiente_cotizacion: { label: "Esperando cotización", icon: "clock", color: "text-amber-500", bg: "bg-amber-50", pulse: true },
  cotizacion_enviada: { label: "Cotización enviada", icon: "clipboard-list", color: "text-blue-500", bg: "bg-blue-50", pulse: true },
  hora_propuesta_cliente: { label: "Negociando horario", icon: "clock", color: "text-purple-500", bg: "bg-purple-50", pulse: true },
  confirmada: { label: "Confirmada, pendiente pago", icon: "check-circle", color: "text-indigo-500", bg: "bg-indigo-50", pulse: false },
  confirmada_pagada: { label: "Pagada, lista para iniciar", icon: "dollar-sign", color: "text-emerald-500", bg: "bg-emerald-50", pulse: false },
  en_proceso: { label: "Trabajo en proceso", icon: "wrench", color: "text-cyan-500", bg: "bg-cyan-50", pulse: true },
  completada: { label: "Trabajo completado", icon: "check-double", color: "text-green-500", bg: "bg-green-50", pulse: false },
  calificada: { label: "Servicio calificado", icon: "award", color: "text-amber-500", bg: "bg-amber-50", pulse: false },
  cancelada: { label: "Cancelada", icon: "ban", color: "text-red-500", bg: "bg-red-50", pulse: false },
};

export default function TrackingWidget({ requestId, compact = false }) {
  const [status, setStatus] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/requests");
        const req = data.find(r => r.id === requestId);
        if (req) {
          setStatus(req.status);
          setUpdatedAt(req.updatedAt);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [requestId]);

  if (!status) return null;
  const config = STATUS_CONFIG[status] || { label: status, icon: "info-circle", color: "text-gray-500", bg: "bg-gray-50", pulse: false };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.color} text-xs font-bold`}>
        <span className={`w-2 h-2 rounded-full ${config.pulse ? "bg-current animate-pulse" : "bg-current opacity-50"}`} />
        {config.label}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-100 p-4 ${config.bg} shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center ${config.color} ${config.pulse ? "animate-pulse" : ""}`}>
          <Icon name={config.icon} className="text-xl" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">{config.label}</p>
          {updatedAt && (
            <p className="text-xs text-gray-500">
              Última actualización: {new Date(updatedAt).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        {config.pulse && (
          <div className="w-3 h-3">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.bg.replace("bg-", "bg-")}`} style={{backgroundColor: "currentColor"}} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${config.color}`} style={{backgroundColor: "currentColor"}} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
