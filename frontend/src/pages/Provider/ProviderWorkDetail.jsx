import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/client";
import { useToast } from "../../components/UI/Toast";
import { Icon, Breadcrumb } from "../../components/UI/helpers";

function StatusBadge({ status }) {
  const map = {
    pendiente_cotizacion: { label: "Pendiente de cotización", color: "bg-yellow-100 text-yellow-800" },
    cotizacion_enviada: { label: "Cotización enviada", color: "bg-blue-100 text-blue-800" },
    hora_propuesta_cliente: { label: "Hora propuesta por el cliente", color: "bg-purple-100 text-purple-800" },
    confirmada: { label: "Confirmada", color: "bg-green-100 text-green-800" },
    confirmada_pagada: { label: "Confirmada y pagada", color: "bg-green-200 text-green-900" },
    en_proceso: { label: "En proceso", color: "bg-indigo-100 text-indigo-800" },
    completada: { label: "Completada", color: "bg-green-100 text-green-800" },
    cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
  };
  const { label, color } = map[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {label}
    </span>
  );
}

export default function ProviderWorkDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [request, setRequest] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [requestsRes, quotesRes] = await Promise.all([
        api.get("/api/requests"),
        api.get(`/api/quotes/by-request/${requestId}`),
      ]);
      const found = requestsRes.data.find(
        (r) => String(r.id) === String(requestId) || String(r._id) === String(requestId)
      );
      setRequest(found || null);
      setQuote(quotesRes.data?.quote || quotesRes.data || null);
    } catch (err) {
      showToast(err.response?.data?.error || "Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [requestId]);

  const acceptTime = async (proposalId) => {
    try {
      setAccepting(proposalId);
      await api.put(`/time-proposals/${proposalId}/accept`);
      showToast("Horario aceptado");
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error", "error");
    } finally {
      setAccepting(null);
    }
  };

  const rejectTime = async (proposalId) => {
    try {
      setRejecting(proposalId);
      await api.put(`/time-proposals/${proposalId}/reject`);
      showToast("Horario rechazado");
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error", "error");
    } finally {
      setRejecting(null);
    }
  };

  const startWork = async () => {
    try {
      setCompleting(true);
      await api.put(`/api/requests/${requestId}/start`);
      showToast("Trabajo iniciado");
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al iniciar trabajo", "error");
    } finally {
      setCompleting(false);
    }
  };

  const completeWork = async () => {
    try {
      setCompleting(true);
      await api.put(`/api/requests/${requestId}/complete`);
      showToast("Trabajo completado");
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al completar trabajo", "error");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto py-8 px-4">
        <Breadcrumb
          items={[
            { label: "Mis trabajos", to: "/proveedor/trabajos" },
            { label: "Detalle" },
          ]}
        />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center mt-6">
          <Icon name="alert-circle" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">Solicitud no encontrada</p>
          <Link
            to="/proveedor/trabajos"
            className="mt-4 inline-flex items-center gap-2 text-[#FF6B35] hover:underline font-medium"
          >
            <Icon name="arrow-left" className="w-4 h-4" /> Volver a mis trabajos
          </Link>
        </div>
      </div>
    );
  }

  const client = request.client || request.cliente || {};
  const images = request.images || request.fotos || [];
  const timeProposal = request.timeProposal || request.time_proposal || null;
  const acceptedOption = request.acceptedOption || request.opcion_aceptada || null;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-8 px-4 space-y-6">
      <Breadcrumb
        items={[
          { label: "Mis trabajos", to: "/proveedor/trabajos" },
          { label: request.displayId || request.codigo || requestId },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalle del trabajo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Código: <span className="font-mono font-semibold">{request.displayId || request.codigo || `#${requestId}`}</span>
          </p>
        </div>
        <StatusBadge status={request.status || request.estado} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="user" className="w-5 h-5 text-[#FF6B35]" />
            Datos del cliente
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="user" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre</p>
                <p className="text-gray-900 font-medium">{client.name || client.nombre || request.clientName || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="phone" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                <p className="text-gray-900 font-medium">{client.phone || client.telefono || request.clientPhone || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="map-pin" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Ciudad</p>
                <p className="text-gray-900 font-medium">{request.city || request.ciudad || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="home" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
                <p className="text-gray-900 font-medium">{request.address || request.direccion || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="calendar" className="w-5 h-5 text-[#FF6B35]" />
            Fecha y horario
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="calendar" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha preferida</p>
                <p className="text-gray-900 font-medium">
                  {request.preferredDate || request.fecha_preferida
                    ? new Date(request.preferredDate || request.fecha_preferida).toLocaleDateString("es-EC", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="clock" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Rango horario</p>
                <p className="text-gray-900 font-medium">{request.timeRange || request.rango_horario || "—"}</p>
              </div>
            </div>

            {quote?.exactTime && (
              <div className="flex items-start gap-3">
                <Icon name="clock" className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Hora exacta acordada</p>
                  <p className="text-gray-900 font-medium">{quote.exactTime}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="briefcase" className="w-5 h-5 text-[#FF6B35]" />
            Servicio solicitado
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="tag" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Servicio</p>
                <p className="text-gray-900 font-medium">{request.serviceName || request.servicio || request.service?.name || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="file-text" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Descripción del problema</p>
                <p className="text-gray-900">{request.description || request.descripcion || "—"}</p>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Imágenes subidas</p>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                    <img
                      src={typeof img === "string" ? img : img.url}
                      alt={`Imagen ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="dollar-sign" className="w-5 h-5 text-[#FF6B35]" />
            Cotización
          </h2>

          {quote ? (
            <div className="space-y-4">
              {quote.description && (
                <div className="flex items-start gap-3">
                  <Icon name="file-text" className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Descripción</p>
                    <p className="text-gray-900">{quote.description}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quote.optionA && (
                  <div className={`rounded-xl border-2 p-4 transition-colors ${
                    acceptedOption === "A" || quote.acceptedOption === "A"
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opción A</span>
                      {acceptedOption === "A" && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                          Aceptada
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      ${typeof quote.optionA.price === "number" ? quote.optionA.price.toFixed(2) : quote.optionA.price || quote.priceA || "—"}
                    </p>
                    {quote.optionA.description && (
                      <p className="text-sm text-gray-600 mt-1">{quote.optionA.description}</p>
                    )}
                    {quote.optionA.deliveryTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        <Icon name="clock" className="w-3 h-3 inline mr-1" />
                        {quote.optionA.deliveryTime}
                      </p>
                    )}
                  </div>
                )}

                {quote.optionB && (
                  <div className={`rounded-xl border-2 p-4 transition-colors ${
                    acceptedOption === "B" || quote.acceptedOption === "B"
                      ? "border-green-400 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Opción B</span>
                      {acceptedOption === "B" && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">
                          Aceptada
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      ${typeof quote.optionB.price === "number" ? quote.optionB.price.toFixed(2) : quote.optionB.price || quote.priceB || "—"}
                    </p>
                    {quote.optionB.description && (
                      <p className="text-sm text-gray-600 mt-1">{quote.optionB.description}</p>
                    )}
                    {quote.optionB.deliveryTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        <Icon name="clock" className="w-3 h-3 inline mr-1" />
                        {quote.optionB.deliveryTime}
                      </p>
                    )}
                  </div>
                )}

                {!quote.optionA && !quote.optionB && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Opción única</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${typeof quote.price === "number" ? quote.price.toFixed(2) : quote.price || "—"}
                    </p>
                    {quote.description && (
                      <p className="text-sm text-gray-600 mt-1">{quote.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Icon name="file-plus" className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No se ha enviado cotización aún</p>
            </div>
          )}
        </div>

        {acceptedOption && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="check-circle" className="w-5 h-5 text-green-500" />
              Opción aceptada por el cliente
            </h2>
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <p className="text-sm text-green-700 font-medium">
                Opción {acceptedOption} seleccionada por el cliente
              </p>
              {quote && (
                <div className="mt-2">
                  {acceptedOption === "A" && quote.optionA && (
                    <p className="text-lg font-bold text-green-900">
                      ${typeof quote.optionA.price === "number" ? quote.optionA.price.toFixed(2) : quote.optionA.price || quote.priceA}
                      {quote.optionA.description && (
                        <span className="block text-sm font-normal text-green-700 mt-1">{quote.optionA.description}</span>
                      )}
                    </p>
                  )}
                  {acceptedOption === "B" && quote.optionB && (
                    <p className="text-lg font-bold text-green-900">
                      ${typeof quote.optionB.price === "number" ? quote.optionB.price.toFixed(2) : quote.optionB.price || quote.priceB}
                      {quote.optionB.description && (
                        <span className="block text-sm font-normal text-green-700 mt-1">{quote.optionB.description}</span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {timeProposal && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="clock" className="w-5 h-5 text-purple-500" />
              Propuesta de horario del cliente
            </h2>
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
              <div className="space-y-2">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">Fecha:</span>{" "}
                  {timeProposal.date
                    ? new Date(timeProposal.date).toLocaleDateString("es-EC", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : timeProposal.preferredDate
                    ? new Date(timeProposal.preferredDate).toLocaleDateString("es-EC", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
                <p className="text-sm text-purple-700">
                  <span className="font-medium">Hora:</span>{" "}
                  {timeProposal.time || timeProposal.hour || "—"}
                </p>
                {timeProposal.note && (
                  <p className="text-sm text-purple-600 italic mt-1">{timeProposal.note}</p>
                )}
              </div>
            </div>

            {(request.status === "hora_propuesta_cliente" || request.estado === "hora_propuesta_cliente") && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => acceptTime(timeProposal.id || timeProposal._id)}
                  disabled={accepting === (timeProposal.id || timeProposal._id)}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  <Icon name="check" className="w-4 h-4" />
                  {accepting === (timeProposal.id || timeProposal._id) ? "Aceptando..." : "Aceptar horario"}
                </button>
                <button
                  onClick={() => rejectTime(timeProposal.id || timeProposal._id)}
                  disabled={rejecting === (timeProposal.id || timeProposal._id)}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                  <Icon name="x" className="w-4 h-4" />
                  {rejecting === (timeProposal.id || timeProposal._id) ? "Rechazando..." : "Rechazar horario"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
        <div className="flex flex-wrap gap-3">
          {(request.status === "pendiente_cotizacion" || request.estado === "pendiente_cotizacion") && (
            <Link
              to={`/proveedor/cotizar/${request._id || request.id}`}
              className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E55A2B] text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              <Icon name="file-plus" className="w-5 h-5" />
              Crear cotización
            </Link>
          )}

          {(request.status === "confirmada" || request.status === "confirmada_pagada" || request.estado === "confirmada" || request.estado === "confirmada_pagada") && (
            <button
              onClick={startWork}
              disabled={completing}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              <Icon name="play" className="w-5 h-5" />
              {completing ? "Iniciando..." : "Iniciar trabajo"}
            </button>
          )}

          {(request.status === "en_proceso" || request.estado === "en_proceso") && (
            <button
              onClick={completeWork}
              disabled={completing}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
            >
              <Icon name="check-circle" className="w-5 h-5" />
              {completing ? "Completando..." : "Marcar como completado"}
            </button>
          )}

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition-colors ml-auto"
          >
            <Icon name="arrow-left" className="w-5 h-5" />
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
