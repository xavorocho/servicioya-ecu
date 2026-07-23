import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/UI/Toast";
import api from "../../api/client";
import { Icon, Breadcrumb } from "../../components/UI/helpers";

const CITIES = ["Quito", "Latacunga", "Ambato", "Pelileo", "Sangolquí", "Riobamba"];
const CATEGORIES = [
  { id: "plomeria", name: "Plomería" }, { id: "electricidad", name: "Electricidad" },
  { id: "limpieza", name: "Limpieza" }, { id: "pintura", name: "Pintura" },
  { id: "carpinteria", name: "Carpintería" }, { id: "jardineria", name: "Jardinería" },
  { id: "electrodomesticos", name: "Electrodomésticos" }, { id: "mudanzas", name: "Mudanzas" },
  { id: "cerrajeria", name: "Cerrajería" }, { id: "cuidado", name: "Cuidado del hogar" },
];

export default function ProviderProfileEdit() {
  const { user, updateUser } = useAuth();
  const showToast = useToast();
  const [provider, setProvider] = useState(null);
  const [form, setForm] = useState({ name: "", category: "", sector: "", price: "", phone: "", description: "" });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("profileImage", file);
    try {
      const { data } = await api.put("/users/profile/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      updateUser({ ...user, profileImage: data.profileImage });
      showToast("Foto de perfil actualizada");
    } catch (err) {
      showToast("Error al subir imagen", "error");
    }
  };

  useEffect(() => {
    api.get("/providers/me").then(({ data }) => {
      setProvider(data);
      setForm({
        name: data.name,
        category: data.category,
        sector: data.sector,
        price: data.price,
        phone: data.phone,
        description: data.description,
      });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/providers/profile", form);
      updateUser({ ...user, providerId: data.id });
      showToast("Perfil profesional actualizado.");
    } catch (err) {
      showToast(err.response?.data?.error || "Error", "error");
    }
  };

  if (!provider) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Panel del proveedor" }, { label: "Mi perfil" }]} />
      <h1 className="text-2xl font-extrabold text-gray-900">Mi perfil profesional</h1>
      <p className="text-gray-500 mt-1 mb-6">Actualiza la información visible para clientes. La publicación depende de la aprobación administrativa.</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Datos del proveedor</h2>
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white shadow-lg">
                {user?.profileImage ? (
                  <img src={user.profileImage.startsWith("http") ? user.profileImage : `/api/uploads/${user.profileImage}`} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "U"
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                <Icon name="camera" className="w-4 h-4" />
                <input type="file" accept=".jpg,.jpeg,.png" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Foto de perfil</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Nombre visible</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Especialidad</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
                <option value="">Selecciona</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Sector de cobertura</label><input type="text" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Precio referencial por hora</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="1" required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Disponibilidad</label>
              <select value={form.available} onChange={(e) => setForm({ ...form, available: e.target.value })} className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
                <option value="true">Disponible</option>
                <option value="false">No disponible</option>
              </select>
            </div>
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Teléfono</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-all" /></div>
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-y" />
            </div>
            <button type="submit" className="btn btn-primary btn-full"><Icon name="save" /> Guardar cambios</button>
          </form>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm border-l-4 border-l-blue-600">
          <h2 className="font-bold text-gray-900 mb-3">Estado del perfil</h2>
          <p className="text-sm text-gray-500 mb-4">Estado actual: <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${provider.status === "Aprobado" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : provider.status === "Pendiente" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>{provider.status}</span></p>
          <ul className="space-y-2 text-sm text-gray-600">
            {["Si el perfil está aprobado, aparecerá en el catálogo.", "Si está pendiente, un administrador debe revisar los documentos.", "Los cambios importantes pueden requerir nueva revisión."].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-[0.5rem]"><Icon name="check" /></span> {t}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
