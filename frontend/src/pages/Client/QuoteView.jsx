import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useToast } from "../../components/UI/Toast";
import { Icon } from "../../components/UI/helpers";

export default function QuoteView() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [request, setRequest] = useState(null);
  const [quote, setQuote] = useState(null);
  const [timeProposals, setTimeProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showTimeProposal, setShowTimeProposal] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/requests"),
      api.get(`/quotes/by-request/${requestId}`),
    ]).then(([reqsRes, quotesRes]) => {
      const req = reqsRes.data.find((r) => r.id === requestId);
      setRequest(req);
      if (quotesRes.data.length > 0) {
        const q = quotesRes.data[0];
        setQuote(q);
        if (q.timeProposals) setTimeProposals(q.timeProposals);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [requestId]);

  const handleAccept = async (option) => {
    setProcessing(true);
    try {
      const res = await api.put(`/quotes/${quote.id}/accept`, { option });
      showToast("Cotización aceptada. Procede al pago de reserva.");
      setQuote({ ...quote, status: "aceptada" });
      setRequest({ ...request, status: "confirmada" });
    } catch (err) {
      showToast(err.response?.data?.error || "Error al aceptar", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("¿Estás seguro de rechazar esta cotización?")) return;
    setProcessing(true);
    try {
      await api.put(`/quotes/${quote.id}/reject`);
      showToast("Cotización rechazada");
      navigate("/cliente/solicitudes");
    } catch (err) {
      showToast(err.response?.data?.error || "Error al rechazar", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleAcceptNewQuote = async () => {
    setProcessing(true);
    try {
      await api.put(`/quotes/${quote.id}/accept-new-quote`);
      showToast("Nueva cotización aceptada. El trabajo continúa.");
      setQuote({ ...quote, status: "aceptada" });
      setRequest({ ...request, status: "en_proceso" });
    } catch (err) {
      showToast(err.response?.data?.error || "Error al aceptar", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectNewQuote = async () => {
    if (!confirm("¿Estás seguro de rechazar esta nueva cotización? La solicitud será cancelada.")) return;
    setProcessing(true);
    try {
      await api.put(`/quotes/${quote.id}/reject-new-quote`);
      showToast("Nueva cotización rechazada. Solicitud cancelada.");
      navigate("/cliente/solicitudes");
    } catch (err) {
      showToast(err.response?.data?.error || "Error al rechazar", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleProposeTime = async () => {
    if (!newTime) return;
    setProcessing(true);
    try {
      await api.post("/time-proposals", { quoteId: quote.id, proposedTime: newTime, note: "Nueva hora propuesta por el cliente" });
      showToast("Hora propuesta enviada");
      setShowTimeProposal(false);
      setTimeProposals([...timeProposals, { proposedTime: newTime, proposedBy: "cliente", status: "pendiente" }]);
    } catch (err) {
      showToast(err.response?.data?.error || "Error al proponer hora", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    setPaymentProcessing(true);
    try {
      if (!import.meta.env.VITE_PAYPHONE_TOKEN) {
        const { data } = await api.post("/payments/simulate", { requestId });
        showToast(data.message || "Pago simulado exitosamente");
        setRequest({ ...request, status: "confirmada_pagada" });
        return;
      }
      let paymentId = quote.id;
      let payRes;
      try {
        payRes = await api.get("/payments");
        const myPayment = payRes.data.find((p) => p.requestId === requestId && p.paymentStatus === "pendiente");
        if (myPayment) paymentId = myPayment.id;
      } catch (_) {}

      const res = await api.post(`/payments/${paymentId}/process`, { method: "payphone" });
      const data = res.data;

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      if (data.simulation) {
        showToast(data.message || "Pago simulado exitosamente");
      } else {
        showToast("Pago procesado exitosamente");
      }
      setRequest({ ...request, status: "confirmada_pagada" });
    } catch (err) {
      showToast(err.response?.data?.error || "Error al procesar pago", "error");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!request) return <div className="text-center py-20 text-gray-500">Solicitud no encontrada</div>;
  if (!quote) return <div className="text-center py-20 text-gray-500">No hay cotización para esta solicitud aún.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <Icon name="clipboard-check" className="text-blue-600" /> Cotización de {request.providerName}
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-900 mb-3">Detalle del trabajo</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">ID:</span> <strong>{request.displayId}</strong></div>
          <div><span className="text-gray-500">Estado:</span> <strong className="capitalize">{request.status.replace(/_/g, " ")}</strong></div>
          <div><span className="text-gray-500">Fecha preferida:</span> <strong>{request.preferredDate || "Sin preferencia"}</strong></div>
          <div><span className="text-gray-500">Horario:</span> <strong>{request.preferredTimeRange || "Sin preferencia"}</strong></div>
          <div className="sm:col-span-2"><span className="text-gray-500">Descripción:</span> <strong>{request.description}</strong></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="dollar-sign" className="text-blue-600" /> Cotización
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide mb-1">Opción B: Sin materiales</p>
            <p className="text-2xl font-extrabold text-emerald-800">${quote.totalWithoutMaterials.toFixed(2)}</p>
            <p className="text-xs text-emerald-600 mt-1">Mano de obra: ${quote.laborPrice.toFixed(2)}</p>
            <p className="text-xs text-emerald-600">Tú compras los materiales</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-1">Opción A: Con materiales</p>
            <p className="text-2xl font-extrabold text-blue-800">${quote.totalWithMaterials.toFixed(2)}</p>
            <p className="text-xs text-blue-600 mt-1">Mano de obra: ${quote.laborPrice.toFixed(2)} + Materiales: ${quote.materialsPrice.toFixed(2)}</p>
            <p className="text-xs text-blue-600">El proveedor compra todo</p>
          </div>
        </div>

        {quote.materialsDetail && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
            <p className="text-xs font-bold text-gray-700 mb-1">Materiales detallados:</p>
            <p className="text-sm text-gray-600">{quote.materialsDetail}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
          <p className="text-xs font-bold text-gray-700 mb-1">Hora propuesta por el proveedor:</p>
          <p className="text-lg font-extrabold text-blue-700">{quote.providerExactTime}</p>
        </div>

        {quote.providerNote && (
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-xs font-bold text-amber-700 mb-1">Nota del proveedor:</p>
            <p className="text-sm text-amber-800">{quote.providerNote}</p>
          </div>
        )}
      </div>

      {timeProposals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon name="clock" className="text-blue-600" /> Propuestas de horario
          </h2>
          <div className="space-y-2">
            {timeProposals.map((tp, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${tp.status === "aceptada" ? "bg-emerald-50 border border-emerald-200" : tp.status === "rechazada" ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"}`}>
                <Icon name="clock" className="text-blue-600" />
                <span className="font-bold">{tp.proposedTime}</span>
                <span className="text-gray-500">por {tp.proposedBy === "cliente" ? "ti" : "el proveedor"}</span>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${tp.status === "aceptada" ? "bg-emerald-200 text-emerald-800" : tp.status === "rechazada" ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"}`}>{tp.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(request.status === "cotizacion_enviada" || request.status === "hora_propuesta_cliente") && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">¿Qué deseas hacer?</h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <button onClick={() => handleAccept("without_materials")} disabled={processing} className="btn btn-primary">
              <Icon name="check" /> Aceptar sin materiales (${quote.totalWithoutMaterials})
            </button>
            <button onClick={() => handleAccept("with_materials")} disabled={processing} className="btn btn-primary">
              <Icon name="check-double" /> Aceptar con materiales (${quote.totalWithMaterials})
            </button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowTimeProposal(!showTimeProposal)} className="btn btn-secondary flex-1">
              <Icon name="clock" /> Proponer otra hora
            </button>
            <button onClick={handleReject} disabled={processing} className="btn btn-danger flex-1">
              <Icon name="ban" /> Rechazar cotización
            </button>
          </div>
          {showTimeProposal && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Nueva hora propuesta</label>
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm" />
              </div>
              <button onClick={handleProposeTime} disabled={processing || !newTime} className="btn btn-primary btn-small">
                <Icon name="paper-plane" /> Enviar
              </button>
            </div>
          )}
        </div>
      )}

      {request.status === "nueva_cotizacion_enviada" && (
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 mb-4">
            <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
              <Icon name="alert-triangle" className="w-5 h-5" />
              El proveedor ha enviado una nueva cotización debido a cambios en el trabajo.
            </p>
          </div>

          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="dollar-sign" className="text-amber-600" /> Nueva cotización
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide mb-1">Opción B: Sin materiales</p>
              <p className="text-2xl font-extrabold text-emerald-800">${quote.totalWithoutMaterials.toFixed(2)}</p>
              <p className="text-xs text-emerald-600 mt-1">Mano de obra: ${quote.laborPrice.toFixed(2)}</p>
              <p className="text-xs text-emerald-600">Tú compras los materiales</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-1">Opción A: Con materiales</p>
              <p className="text-2xl font-extrabold text-blue-800">${quote.totalWithMaterials.toFixed(2)}</p>
              <p className="text-xs text-blue-600 mt-1">Mano de obra: ${quote.laborPrice.toFixed(2)} + Materiales: ${quote.materialsPrice.toFixed(2)}</p>
              <p className="text-xs text-blue-600">El proveedor compra todo</p>
            </div>
          </div>

          {quote.materialsDetail && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-700 mb-1">Materiales detallados:</p>
              <p className="text-sm text-gray-600">{quote.materialsDetail}</p>
            </div>
          )}

          {quote.providerNote && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-4">
              <p className="text-xs font-bold text-amber-700 mb-1">Motivo del cambio:</p>
              <p className="text-sm text-amber-800">{quote.providerNote}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleAcceptNewQuote} disabled={processing} className="btn btn-primary flex-1 bg-green-600 hover:bg-green-700">
              {processing ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Icon name="check" /> Aceptar nueva cotización</>}
            </button>
            <button onClick={handleRejectNewQuote} disabled={processing} className="btn btn-danger flex-1">
              <Icon name="ban" /> Rechazar y cancelar
            </button>
          </div>
        </div>
      )}

      {request.status === "confirmada" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon name="circle-check" className="text-emerald-600" /> Cotización confirmada
          </h2>
          <p className="text-sm text-gray-600 mb-4">El precio y horario han sido acordados. Procede a pagar la reserva para confirmar el trabajo.</p>
          <button onClick={handleProcessPayment} disabled={paymentProcessing} className="btn btn-primary btn-full">
            {paymentProcessing ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Icon name="dollar-sign" /> {import.meta.env.VITE_PAYPHONE_TOKEN ? "Pagar reserva (PayPhone)" : "Simular pago de reserva"}</>}
          </button>
          {!import.meta.env.VITE_PAYPHONE_TOKEN && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mt-3">
              Proyecto educativo: este botón confirmará un pago simulado y habilitará el inicio del trabajo.
            </div>
          )}
        </div>
      )}

      {request.status === "confirmada_pagada" && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="circle-check" className="text-emerald-600 text-xl" />
            <h2 className="font-bold text-emerald-900">Pago realizado. Esperando inicio del proveedor.</h2>
          </div>
          <p className="text-sm text-emerald-700">El proveedor iniciará el trabajo en el horario acordado.</p>
        </div>
      )}

      {request.status === "completada" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Icon name="award" className="text-amber-500" /> Servicio completado
          </h2>
          <p className="text-sm text-gray-600 mb-4">¿Cómo fue tu experiencia? Califica al proveedor.</p>
          <ReviewForm requestId={requestId} providerId={request.providerId} onComplete={() => setRequest({ ...request, status: "calificada" })} />
        </div>
      )}
    </div>
  );
}

function ReviewForm({ requestId, providerId, onComplete }) {
  const showToast = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post("/reviews", { requestId, rating, comment });
      showToast("Calificación enviada. ¡Gracias!");
      onComplete();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al calificar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Calificación</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className={`text-2xl transition-colors ${s <= rating ? "text-amber-400" : "text-gray-300"}`}>
              {s <= rating ? "★" : "☆"}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Comentario</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-y" placeholder="¿Cómo fue tu experiencia?" />
      </div>
      <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary">
        {submitting ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Icon name="award" /> Enviar calificación</>}
      </button>
    </div>
  );
}
