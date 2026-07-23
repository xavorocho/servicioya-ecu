import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/client";
import { useToast } from "../../components/UI/Toast";
import { Icon, Breadcrumb } from "../../components/UI/helpers";

const STATUS_LABELS = {
  pendiente_cotizacion: "Pendiente de cotización",
  cotizacion_enviada: "Cotización recibida",
  hora_propuesta_cliente: "Hora propuesta",
  confirmada: "Cotización aceptada",
  confirmada_pagada: "Pago de reserva",
  en_proceso: "Trabajo en proceso",
  completada: "Trabajo finalizado",
  calificada: "Servicio calificado",
  cancelada: "Cancelada",
  rechazada: "Rechazada",
};

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

const TRACKING_STEPS = [
  { key: "pendiente_cotizacion", label: "Solicitud enviada", icon: "paper-plane" },
  { key: "cotizacion_enviada", label: "Cotización recibida", icon: "clipboard-list" },
  { key: "confirmada", label: "Cotización aceptada", icon: "circle-check" },
  { key: "confirmada_pagada", label: "Pago de reserva", icon: "dollar-sign" },
  { key: "en_proceso", label: "Trabajo en proceso", icon: "wrench" },
  { key: "completada", label: "Trabajo finalizado", icon: "check-double" },
  { key: "calificada", label: "Servicio calificado", icon: "award" },
];

const STATUS_ORDER = [
  "pendiente_cotizacion",
  "cotizacion_enviada",
  "hora_propuesta_cliente",
  "confirmada",
  "confirmada_pagada",
  "en_proceso",
  "completada",
  "calificada",
];

function TrackingLine({ status }) {
  if (status === "cancelada" || status === "rechazada") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <Icon name="ban" className="text-red-600 text-xl" />
          <div>
            <p className="font-bold text-red-800 text-sm">
              Solicitud {status === "cancelada" ? "cancelada" : "rechazada"}
            </p>
            <p className="text-xs text-red-600">Esta solicitud no continúa en proceso.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(status);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm mb-6">
      <h2 className="font-bold text-gray-900 mb-5 text-sm flex items-center gap-2">
        <Icon name="route" className="text-blue-600" /> Progreso del servicio
      </h2>

      <div className="hidden sm:flex items-start gap-0">
        {TRACKING_STEPS.map((step, i) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const isCompleted = stepIdx < currentIdx;
          const isCurrent = step.key === status || (step.key === "cotizacion_enviada" && status === "hora_propuesta_cliente");
          const isFuture = !isCompleted && !isCurrent;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <div className={`absolute top-4 right-1/2 w-full h-0.5 -z-0 ${isCompleted || isCurrent ? "bg-emerald-500" : "bg-gray-200"}`} />
              )}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : isCurrent
                  ? "bg-blue-600 border-blue-600 text-white animate-glow"
                  : "bg-white border-gray-200 text-gray-400"
              }`}>
                {isCompleted ? <Icon name="check" className="text-white" /> : <Icon name={step.icon} />}
              </div>
              <span className={`text-[0.65rem] font-semibold mt-2 text-center leading-tight max-w-[80px] ${
                isCompleted ? "text-emerald-700" : isCurrent ? "text-blue-700" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex sm:hidden flex-col gap-3">
        {TRACKING_STEPS.map((step, i) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const isCompleted = stepIdx < currentIdx;
          const isCurrent = step.key === status || (step.key === "cotizacion_enviada" && status === "hora_propuesta_cliente");
          const isFuture = !isCompleted && !isCurrent;

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.6rem] font-bold border-2 flex-shrink-0 ${
                isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : isCurrent
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-400"
              }`}>
                {isCompleted ? <Icon name="check" className="text-white" /> : <Icon name={step.icon} />}
              </div>
              <span className={`text-xs font-semibold ${isCompleted ? "text-emerald-700" : isCurrent ? "text-blue-700" : "text-gray-400"}`}>
                {step.label}
              </span>
              {i < TRACKING_STEPS.length - 1 && (
                <div className={`w-0.5 h-4 ml-0.5 ${isCompleted ? "bg-emerald-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, className = "" }) {
  if (!value && value !== 0) return null;
  return (
    <div className={`flex items-start gap-3 py-2.5 ${className}`}>
      <Icon name={icon} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function ClientRequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [request, setRequest] = useState(null);
  const [quote, setQuote] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/requests"),
      api.get(`/quotes/by-request/${requestId}`),
    ])
      .then(([reqsRes, quotesRes]) => {
        const req = reqsRes.data.find((r) => r.id === requestId);
        setRequest(req);
        if (quotesRes.data.length > 0) {
          setQuote(quotesRes.data[0]);
          if (quotesRes.data[0].review) {
            setReview(quotesRes.data[0].review);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [requestId]);

  const cancelRequest = async () => {
    if (!confirm("¿Estás seguro de cancelar esta solicitud?")) return;
    setCancelling(true);
    try {
      await api.put(`/requests/${requestId}/status`, { status: "cancelada" });
      showToast("Solicitud cancelada");
      setRequest({ ...request, status: "cancelada" });
    } catch (err) {
      showToast(err.response?.data?.error || "Error al cancelar", "error");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <Breadcrumb items={[{ label: "Inicio", href: "/cliente/inicio" }, { label: "Mis solicitudes", href: "/cliente/solicitudes" }, { label: "Detalle" }]} />
        <div className="text-center py-20 text-gray-500">Solicitud no encontrada</div>
      </div>
    );
  }

  const getAction = () => {
    switch (request.status) {
      case "cotizacion_enviada":
      case "hora_propuesta_cliente":
        return (
          <Link to={`/cliente/cotizacion/${request.id}`} className="btn btn-primary">
            <Icon name="clipboard-check" /> Ver y aceptar cotización
          </Link>
        );
      case "confirmada":
        return (
          <Link to={`/cliente/cotizacion/${request.id}`} className="btn btn-primary">
            <Icon name="dollar-sign" /> Pagar reserva
          </Link>
        );
      case "completada":
        return (
          <Link to={`/cliente/cotizacion/${request.id}`} className="btn btn-primary">
            <Icon name="award" /> Calificar servicio
          </Link>
        );
      case "pendiente_cotizacion":
        return (
          <button onClick={cancelRequest} disabled={cancelling} className="btn btn-danger">
            <Icon name="ban" /> Cancelar solicitud
          </button>
        );
      default:
        return null;
    }
  };

  const images = request.images || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Inicio", href: "/cliente/inicio" }, { label: "Mis solicitudes", href: "/cliente/solicitudes" }, { label: "Detalle" }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{request.displayId}</h1>
          <p className="text-gray-500 mt-1">Detalle completo de tu solicitud</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[request.status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
          {STATUS_LABELS[request.status] || request.status?.replace(/_/g, " ")}
        </span>
      </div>

      <TrackingLine status={request.status} />

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Icon name="clipboard-list" className="text-blue-600" /> Información de la solicitud
            </h2>
            <div className="divide-y divide-gray-100">
              <DetailRow icon="clipboard-list" label="Código de solicitud" value={request.displayId} />
              <DetailRow icon="user" label="Proveedor" value={request.providerName} />
              <DetailRow icon="wrench" label="Servicio" value={request.service} />
              <DetailRow icon="location-dot" label="Dirección" value={request.address} />
              <DetailRow icon="clock" label="Fecha preferida" value={request.preferredDate || "Sin preferencia"} />
              <DetailRow icon="clock" label="Rango horario" value={request.preferredTimeRange || "Sin preferencia"} />
              {quote?.providerExactTime && (
                <DetailRow icon="clock" label="Hora acordada" value={quote.providerExactTime} />
              )}
              <DetailRow icon="tags" label="Descripción" value={request.description} />
            </div>
          </div>

          {images.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <Icon name="file-shield" className="text-blue-600" /> Imágenes adjuntas
              </h2>
              <div className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={img} alt={`Adjunto ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {quote && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <Icon name="dollar-sign" className="text-blue-600" /> Cotización
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className={`rounded-xl p-4 border ${quote.selectedOption === "without_materials" ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200" : "bg-emerald-50 border-emerald-200"}`}>
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide mb-1">Opción B: Sin materiales</p>
                  <p className="text-2xl font-extrabold text-emerald-800">${Number(quote.totalWithoutMaterials || 0).toFixed(2)}</p>
                  <p className="text-xs text-emerald-600 mt-1">Mano de obra: ${Number(quote.laborPrice || 0).toFixed(2)}</p>
                  <p className="text-xs text-emerald-600">Tú compras los materiales</p>
                </div>
                <div className={`rounded-xl p-4 border ${quote.selectedOption === "with_materials" ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200" : "bg-blue-50 border-blue-200"}`}>
                  <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-1">Opción A: Con materiales</p>
                  <p className="text-2xl font-extrabold text-blue-800">${Number(quote.totalWithMaterials || 0).toFixed(2)}</p>
                  <p className="text-xs text-blue-600 mt-1">Mano de obra: ${Number(quote.laborPrice || 0).toFixed(2)} + Materiales: ${Number(quote.materialsPrice || 0).toFixed(2)}</p>
                  <p className="text-xs text-blue-600">El proveedor compra todo</p>
                </div>
              </div>

              {quote.materialsDetail && (
                <div className="bg-gray-50 rounded-xl p-4 mb-3 border border-gray-100">
                  <p className="text-xs font-bold text-gray-700 mb-1">Detalle de materiales:</p>
                  <p className="text-sm text-gray-600">{quote.materialsDetail}</p>
                </div>
              )}

              {quote.selectedOption && (
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200 flex items-center gap-2">
                  <Icon name="circle-check" className="text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-700">
                    Opción elegida: {quote.selectedOption === "with_materials" ? "Con materiales" : "Sin materiales"}
                  </span>
                </div>
              )}

              {quote.providerNote && (
                <div className="bg-amber-50 rounded-xl p-4 mt-3 border border-amber-200">
                  <p className="text-xs font-bold text-amber-700 mb-1">Nota del proveedor:</p>
                  <p className="text-sm text-amber-800">{quote.providerNote}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Icon name="circle-info" className="text-blue-600" /> Estado
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Estado actual</p>
                <p className="text-sm font-bold text-gray-900 capitalize">{(STATUS_LABELS[request.status] || request.status || "").replace(/_/g, " ")}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Estado de pago</p>
                <p className="text-sm font-bold text-gray-900">
                  {request.status === "confirmada_pagada" || request.status === "en_proceso" || request.status === "completada" || request.status === "calificada"
                    ? <span className="text-emerald-700">Pagado</span>
                    : request.status === "confirmada"
                    ? <span className="text-amber-600">Pendiente</span>
                    : <span className="text-gray-400">No aplica</span>
                  }
                </p>
              </div>
            </div>
          </div>

          {review && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <Icon name="award" className="text-amber-500" /> Tu reseña
              </h2>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={`text-lg ${s <= (review.rating || 0) ? "text-amber-400" : "text-gray-300"}`}>
                    {s <= (review.rating || 0) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600">{review.comment}</p>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
              <Icon name="bolt" className="text-blue-600" /> Acciones
            </h2>
            <div className="space-y-2">
              {getAction()}
              <Link to={`/perfil/${request.providerId}`} className="btn btn-outline btn-full">
                <Icon name="user" /> Ver perfil del proveedor
              </Link>
              <Link to="/cliente/solicitudes" className="btn btn-secondary btn-full">
                <Icon name="rotate-left" /> Volver a solicitudes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
