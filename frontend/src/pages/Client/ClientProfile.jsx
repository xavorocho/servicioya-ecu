import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/UI/Toast";
import api from "../../api/client";
import { Icon, Breadcrumb } from "../../components/UI/helpers";

const CITIES = ["Quito", "Latacunga", "Ambato", "Pelileo", "Sangolquí", "Riobamba"];

export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const showToast = useToast();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", city: user?.city || "" });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/users/profile", form);
      updateUser(data);
      showToast("Perfil actualizado correctamente.");
    } catch (err) {
      showToast(err.response?.data?.error || "Error", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Inicio", href: "/cliente/inicio" }, { label: "Mi perfil" }]} />
      <div className="grid sm:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Datos personales</h2>
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
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Nombre completo</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Correo electrónico</label><input type="email" value={user?.email} disabled className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500" /></div>
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Teléfono</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" /></div>
            <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Ciudad</label><select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">{CITIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <button type="submit" className="btn btn-primary btn-full"><Icon name="save" /> Guardar cambios</button>
          </form>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm border-l-4 border-l-blue-600">
          <h2 className="font-bold text-gray-900 mb-3">Cuenta de cliente</h2>
          <p className="text-sm text-gray-500 mb-4">Desde este perfil puedes buscar servicios, solicitar proveedores y revisar el estado de tus solicitudes.</p>
          <ul className="space-y-2 text-sm text-gray-600">
            {["Solo los clientes pueden contratar servicios.", "Los proveedores se muestran únicamente cuando están aprobados.", "El estado de cada solicitud se actualiza según la respuesta del proveedor."].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-[0.5rem]"><Icon name="check" /></span> {t}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
