import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useToast } from "../../components/UI/Toast";
import { Icon } from "../../components/UI/helpers";

export default function NewQuoteForm() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evidence, setEvidence] = useState(null);
  const [form, setForm] = useState({
    reason: "",
    laborPrice: "",
    materialsPrice: "",
    materialsDetail: "",
    providerNote: "",
    providerExactTime: "",
  });

  useEffect(() => {
    api.get("/requests").then(({ data }) => {
      const req = data.find((r) => r.id === requestId);
      setRequest(req);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [requestId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const labor = Number(form.laborPrice) || 0;
  const mats = Number(form.materialsPrice) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason) {
      showToast("Debe indicar el motivo del cambio", "error");
      return;
    }
    if (!form.laborPrice) {
      showToast("Precio de mano de obra es requerido", "error");
      return;
    }
    if (!evidence) return showToast("Adjunta una imagen que justifique el cambio", "error");
    setSubmitting(true);
    try {
      const evidenceData = new FormData();
      evidenceData.append("evidence", evidence);
      await api.post(`/evidence/${requestId}`, evidenceData, { headers: { "Content-Type": "multipart/form-data" } });
      await api.post(`/quotes/new-quote/${requestId}`, {
        reason: form.reason,
        laborPrice: labor,
        materialsPrice: mats,
        totalWithMaterials: labor + mats,
        totalWithoutMaterials: labor,
        materialsDetail: form.materialsDetail,
        providerNote: form.providerNote,
        providerExactTime: form.providerExactTime,
      });
      showToast("Nueva cotización enviada exitosamente");
      navigate(`/proveedor/solicitud/${requestId}`);
    } catch (err) {
      showToast(err.response?.data?.error || "Error al enviar nueva cotización", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!request) return <div className="text-center py-20 text-gray-500">Solicitud no encontrada</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <Icon name="file-plus" className="text-amber-600" /> Nueva Cotización
      </h1>

      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 mb-6">
        <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
          <Icon name="alert-triangle" className="w-5 h-5" />
          El alcance del trabajo ha cambiado. Enviar una nueva cotización con los precios actualizados.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-900 mb-2">Detalle de la solicitud</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">ID:</span> <strong>{request.displayId}</strong></div>
          <div><span className="text-gray-500">Estado:</span> <strong className="capitalize">{request.status?.replace(/_/g, " ")}</strong></div>
          <div><span className="text-gray-500">Servicio:</span> <strong>{request.serviceName || request.service}</strong></div>
          <div><span className="text-gray-500">Ciudad:</span> <strong>{request.city}</strong></div>
          <div className="sm:col-span-2"><span className="text-gray-500">Descripción:</span> <strong>{request.description}</strong></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Icon name="dollar-sign" className="text-amber-600" /> Nueva cotización
        </h2>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo del cambio *</label>
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            rows={3}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white resize-y"
            placeholder="Ej: Se encontró daño adicional en la instalación eléctrica..."
          />
        </div>

        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Evidencia del cambio *</label><input type="file" accept=".jpg,.jpeg,.png,.webp" required onChange={(event) => setEvidence(event.target.files[0])} className="w-full text-sm" /><p className="text-xs text-gray-500 mt-1">Adjunta una foto del problema adicional encontrado.</p></div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mano de obra ($) *</label>
            <input type="number" name="laborPrice" value={form.laborPrice} onChange={handleChange} min="1" step="0.50" required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" placeholder="Ej: 25" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Materiales ($)</label>
            <input type="number" name="materialsPrice" value={form.materialsPrice} onChange={handleChange} min="0" step="0.50" className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" placeholder="Ej: 18" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Resumen de precios</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 border border-emerald-200">
              <p className="text-xs text-gray-500 font-semibold">Opción B: Sin materiales</p>
              <p className="text-xl font-extrabold text-emerald-700">${labor.toFixed(2)}</p>
              <p className="text-xs text-gray-500">El cliente compra materiales</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-blue-200">
              <p className="text-xs text-gray-500 font-semibold">Opción A: Con materiales</p>
              <p className="text-xl font-extrabold text-blue-700">${(labor + mats).toFixed(2)}</p>
              <p className="text-xs text-gray-500">El proveedor compra materiales</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Detalle de materiales</label>
          <textarea name="materialsDetail" value={form.materialsDetail} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white resize-y" placeholder="Lista de materiales necesarios y cantidades aproximadas..." />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Hora exacta propuesta</label>
          <input type="time" name="providerExactTime" value={form.providerExactTime} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nota adicional</label>
          <textarea name="providerNote" value={form.providerNote} onChange={handleChange} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white resize-y" placeholder="Aclaraciones o recomendaciones..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn btn-primary flex-1 bg-amber-600 hover:bg-amber-700">
            {submitting ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Icon name="paper-plane" /> Enviar nueva cotización</>}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
