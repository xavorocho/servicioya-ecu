import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/UI/Toast";
import api from "../../api/client";
import { Icon, Breadcrumb } from "../../components/UI/helpers";
import MapPicker from "../../components/UI/MapPicker";

const CITIES = [
  "Quito", "Guayaquil", "Cuenca", "Santo Domingo", "Machala", "Manta", "Portoviejo",
  "Loja", "Ambato", "Riobamba", "Latacunga", "Ibarra", "Esmeraldas", "Tulcán",
  "Puyo", "Tena", "Nueva Loja", "Babahoyo", "Quevedo", "Milagro", "Salinas",
  "Santa Elena", "Sangolquí", "Pelileo", "Baños", "Otavalo",
];

export default function RequestForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    client: user?.name || "",
    phone: user?.phone || "",
    city: "",
    preferredDate: new Date().toISOString().slice(0, 10),
    preferredTimeRange: "",
    address: "",
    addressReference: "",
    latitude: "",
    longitude: "",
    description: "",
  });

  useEffect(() => {
    api.get(`/providers/${id}`).then(({ data }) => { setProvider(data); setForm((f) => ({ ...f, city: data.city })); }).catch(() => navigate("/cliente/catalogo"));
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.latitude || !form.longitude) return showToast("Selecciona la ubicación exacta en el mapa", "error");
    if (images.length < 1 || images.length > 5) return showToast("Adjunta entre 1 y 5 imágenes", "error");
    if (images.some((image) => image.size > 5 * 1024 * 1024)) return showToast("Cada imagen debe pesar máximo 5 MB", "error");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("providerId", id);
      fd.append("client", user.name);
      fd.append("phone", form.phone);
      fd.append("city", form.city);
      fd.append("address", form.address);
      fd.append("addressReference", form.addressReference);
      fd.append("latitude", form.latitude);
      fd.append("longitude", form.longitude);
      fd.append("description", form.description);
      fd.append("preferredDate", form.preferredDate);
      fd.append("preferredTimeRange", form.preferredTimeRange);
      images.forEach((img) => fd.append("images", img));
      await api.post("/requests", fd, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("Solicitud enviada correctamente");
      navigate("/cliente/solicitudes");
    } catch (err) {
      showToast(err.response?.data?.error || "Error al enviar solicitud", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!provider) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Inicio", href: "/cliente/inicio" }, { label: "Catálogo", href: "/cliente/catalogo" }, { label: "Solicitar servicio" }]} />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800">1. Proveedor</span>
            <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-800">2. Detalles</span>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-400">3. Cotización</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-3 mb-5">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-lg shadow-blue-500/20">
              {provider.name?.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <div><strong className="block text-sm text-gray-900">{provider.name}</strong><p className="text-xs text-gray-500">{provider.categoryName} · {provider.city} · ${provider.price}/hora</p></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Nombre del cliente</label><input type="text" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" /></div>
              <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Teléfono</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09XXXXXXXX" required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" /></div>
              <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Ciudad</label><select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white">{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Fecha preferida</label><input type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} min={new Date().toISOString().slice(0, 10)} required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" /></div>
              <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Rango de horario</label><select value={form.preferredTimeRange} onChange={(e) => setForm({ ...form, preferredTimeRange: e.target.value })} required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white"><option value="">Selecciona</option><option>Mañana (8:00 - 12:00)</option><option>Tarde (12:00 - 18:00)</option><option>Noche (18:00 - 21:00)</option></select></div>
              <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Dirección o sector</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ej: Latacunga centro" required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" /></div>
              <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Referencia para llegar</label><input type="text" value={form.addressReference} onChange={(e) => setForm({ ...form, addressReference: e.target.value })} placeholder="Ej: Casa azul junto al parque" required className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white" /></div>
              <div className="sm:col-span-2"><label className="text-xs font-semibold text-gray-700 mb-1 block">Descripción del trabajo *</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe claramente qué necesitas. Ej: Fuga en lavamanos del baño principal, gotea constantemente." required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white resize-y" /></div>
            </div>
            <div><label className="text-xs font-semibold text-gray-700 mb-2 block">Ubicación exacta *</label><MapPicker onSelect={({ lat, lng, address }) => setForm((current) => ({ ...current, latitude: String(lat), longitude: String(lng), address: address || current.address }))} /></div>
            <section className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900"><Icon name="image" className="text-blue-600" /> Fotos del problema *</h3>
              <p className="text-xs text-gray-500">Adjunta entre 1 y 5 imágenes JPG, PNG o WEBP. Máximo 5 MB por archivo.</p>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple onChange={(e) => {
                const selected = Array.from(e.target.files);
                if (selected.some((file) => file.size > 5 * 1024 * 1024)) showToast("Se omitieron imágenes mayores a 5 MB", "error");
                const newFiles = selected.filter((file) => file.size <= 5 * 1024 * 1024).slice(0, 5 - images.length);
                setImages((prev) => [...prev, ...newFiles].slice(0, 5));
              }} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all" />
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={URL.createObjectURL(img)} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                      <button type="button" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="xmark" /></button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full">
              {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Icon name="paper-plane" /> Enviar solicitud</>}
            </button>
          </form>
        </section>

        <aside className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm lg:sticky lg:top-24 space-y-4">
          <h2 className="font-bold text-gray-900">Resumen</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between pb-2 border-b border-gray-100"><dt className="text-gray-500 font-semibold">Proveedor</dt><dd className="text-gray-900 font-bold">{provider.name}</dd></div>
            <div className="flex justify-between pb-2 border-b border-gray-100"><dt className="text-gray-500 font-semibold">Servicio</dt><dd className="text-gray-900 font-bold">{provider.categoryName}</dd></div>
            <div className="flex justify-between pb-2 border-b border-gray-100"><dt className="text-gray-500 font-semibold">Calificación</dt><dd className="text-gray-900 font-bold">{provider.rating}/5</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 font-semibold">Disponibilidad</dt><dd className="text-gray-900 font-bold">{provider.available ? "Disponible" : "No disponible"}</dd></div>
          </dl>

        </aside>
      </div>
    </div>
  );
}
