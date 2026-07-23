import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useToast } from "../../components/UI/Toast";
import { Icon } from "../../components/UI/helpers";

export default function QuoteForm() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    laborPrice: "",
    materialsPrice: "",
    materialsDetail: "",
    providerNote: "",
    providerExactTime: "",
  });

  useEffect(() => {
    api.get(`/requests`).then(({ data }) => {
      const req = data.find((r) => r.id === requestId);
      setRequest(req);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [requestId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.laborPrice || !form.providerExactTime || !form.providerNote.trim()) {
      showToast("Precio, hora exacta y condiciones son requeridos", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/quotes", {
        requestId,
        laborPrice: Number(form.laborPrice),
        materialsPrice: Number(form.materialsPrice) || 0,
        materialsDetail: form.materialsDetail,
        providerNote: form.providerNote,
        providerExactTime: form.providerExactTime,
      });
      showToast("Cotización enviada exitosamente");
      navigate("/proveedor/solicitudes");
    } catch (err) {
      showToast(err.response?.data?.error || "Error al enviar cotización", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!request) return <div className="text-center py-20 text-gray-500">Solicitud no encontrada</div>;

  const labor = Number(form.laborPrice) || 0;
  const mats = Number(form.materialsPrice) || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <Icon name="file-shield" className="text-blue-600" /> Crear Cotización
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-900 mb-2">Detalle de la solicitud</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">ID:</span> <strong>{request.displayId}</strong></div>
          <div><span className="text-gray-500">Cliente:</span> <strong>{request.client}</strong></div>
          <div><span className="text-gray-500">Servicio:</span> <strong>{request.service}</strong></div>
          <div><span className="text-gray-500">Ciudad:</span> <strong>{request.city}</strong></div>
          <div><span className="text-gray-500">Fecha preferida:</span> <strong>{request.preferredDate || "Sin preferencia"}</strong></div>
          <div><span className="text-gray-500">Horario:</span> <strong>{request.preferredTimeRange || "Sin preferencia"}</strong></div>
          {request.address && <div className="sm:col-span-2"><span className="text-gray-500">Dirección:</span> <strong>{request.address}</strong></div>}
          <div className="sm:col-span-2"><span className="text-gray-500">Descripción:</span> <strong>{request.description}</strong></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Icon name="dollar-sign" className="text-blue-600" /> Tu cotización
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mano de obra ($) *</label>
            <input type="number" name="laborPrice" value={form.laborPrice} onChange={handleChange} min="1" step="0.50" required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" placeholder="Ej: 20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Materiales ($)</label>
            <input type="number" name="materialsPrice" value={form.materialsPrice} onChange={handleChange} min="0" step="0.50" className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" placeholder="Ej: 15" />
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">Hora exacta propuesta *</label>
          <input type="time" name="providerExactTime" value={form.providerExactTime} onChange={handleChange} required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Condiciones y alcance del trabajo *</label>
          <textarea name="providerNote" value={form.providerNote} onChange={handleChange} rows={2} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white resize-y" placeholder="Describe qué incluye el trabajo, condiciones y recomendaciones..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
            {submitting ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Icon name="paper-plane" /> Enviar cotización</>}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
