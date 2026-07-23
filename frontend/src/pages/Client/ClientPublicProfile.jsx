import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";
import { Icon, Breadcrumb } from "../../components/UI/helpers";

export default function ClientPublicProfile() {
  const { email } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/auth/user/${encodeURIComponent(email)}`)
      .then(({ data }) => setProfile(data))
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">Cliente no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Mis trabajos", to: "/proveedor/solicitudes" }, { label: "Perfil del cliente" }]} />
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Perfil del cliente</h1>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
            {profile.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Teléfono:</span> <span className="font-semibold">{profile.phone || "—"}</span></div>
          <div><span className="text-gray-500">Ciudad:</span> <span className="font-semibold">{profile.city || "—"}</span></div>
          <div><span className="text-gray-500">Miembro desde:</span> <span className="font-semibold">{new Date(profile.createdAt).toLocaleDateString("es-EC")}</span></div>
        </div>
      </div>

      {profile.requests?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Solicitudes recientes</h3>
          {profile.requests.map(r => (
            <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm font-semibold text-gray-800">{r.service}</span>
              <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString("es-EC")}</span>
            </div>
          ))}
        </div>
      )}

      {profile.reviews?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-3">Calificaciones como cliente</h3>
          {profile.reviews.map((r, i) => (
            <div key={i} className="py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-1 mb-1">
                {[1,2,3,4,5].map(s => <span key={s} className={s <= r.rating ? "text-amber-400" : "text-gray-300"}>{s <= r.rating ? "★" : "☆"}</span>)}
              </div>
              {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
