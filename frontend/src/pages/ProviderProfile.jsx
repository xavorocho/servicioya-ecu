import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Icon, Breadcrumb, StatusBadge, Avatar } from "../components/UI/helpers";
import { getFileUrl } from "../utils/files";

export default function ProviderProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/providers/${id}`).then(({ data }) => { setProvider(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!provider) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-extrabold text-gray-900 mb-2">Proveedor no disponible</h1>
      <p className="text-gray-500 mb-5">Este perfil no existe o no ha sido aprobado.</p>
      <Link to={user?.role === "cliente" ? "/cliente/catalogo" : "/catalogo"} className="btn btn-primary">Volver al catálogo</Link>
    </div>
  );

  const crumbs = user?.role === "cliente"
    ? [{ label: "Inicio", href: "/cliente/inicio" }, { label: "Catálogo", href: "/cliente/catalogo" }, { label: provider.name }]
    : [{ label: "Inicio", href: "/" }, { label: "Catálogo", href: "/catalogo" }, { label: provider.name }];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={crumbs} />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-5">
          <article className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 flex flex-col sm:flex-row gap-4 shadow-sm">
            {provider.profileImage ? <img src={getFileUrl(provider.profileImage)} alt={`Foto de ${provider.name}`} className="w-16 h-16 rounded-2xl object-cover" /> : <Avatar name={provider.name} className="w-16 h-16 rounded-2xl text-lg" />}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-gray-900">{provider.name}</h1>
                <StatusBadge status="Aprobado" />
              </div>
              <p className="text-sm text-gray-600 mt-2">{provider.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[0.65rem] font-semibold"><Icon name="star" className="text-amber-500" /> {provider.rating} ({provider.reviews} opiniones)</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[0.65rem] font-semibold"><Icon name="location-dot" /> {provider.city} · {provider.sector}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[0.65rem] font-semibold"><Icon name="dollar-sign" /> ${provider.price}/hora</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.65rem] font-semibold ${provider.available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  <Icon name={provider.available ? "circle-check" : "circle-xmark"} /> {provider.available ? "Disponible hoy" : "No disponible hoy"}
                </span>
              </div>
            </div>
          </article>

          <article className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3"><Icon name="list" className="text-blue-600 mr-1.5" /> Servicios que ofrece</h2>
            <div className="flex flex-wrap gap-1.5">
              {(provider.services || []).map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[0.65rem] font-semibold">{s}</span>
              ))}
            </div>
          </article>

          <article className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3"><Icon name="shield-halved" className="text-blue-600 mr-1.5" /> Confianza y validación</h2>
            <ul className="space-y-2 text-sm">
              {["Documento de identidad revisado.", "Certificado de no tener antecedentes registrado.", "Experiencia o referencias revisadas.", "Calificaciones visibles de clientes anteriores."].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-[0.5rem]"><Icon name="check" /></span> {t}
                </li>
              ))}
            </ul>
          </article>

          <article className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3"><Icon name="comment" className="text-blue-600 mr-1.5" /> Comentarios de clientes</h2>
            <div className="space-y-3">
              {provider.comments?.length ? provider.comments.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-blue-50">
                  <strong className="block text-sm text-gray-900">{c.user}</strong>
                  <span className="text-amber-500 text-xs font-bold">{Array(Math.round(c.rating)).fill("★").join("")}{Array(5 - Math.round(c.rating)).fill("☆").join("")} {c.rating}/5</span>
                  <p className="text-sm text-gray-600 mt-1">{c.text}</p>
                </div>
              )) : <p className="text-sm text-gray-500">Sin comentarios todavía.</p>}
            </div>
          </article>
        </div>

        <aside className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm lg:sticky lg:top-24 space-y-4">
          <h2 className="font-bold text-gray-900">Resumen</h2>
          <dl className="space-y-3 text-sm">
            {[{ l: "Especialidad", v: provider.categoryName }, { l: "Ciudad", v: provider.city }, { l: "Sector", v: provider.sector }, { l: "Contacto", v: provider.phone }, { l: "Estado", v: provider.available ? "Disponible" : "No disponible" }].map((x) => (
              <div key={x.l} className="flex justify-between pb-2 border-b border-gray-100 last:border-0">
                <dt className="text-gray-500 font-semibold flex items-center gap-1.5">{x.l}</dt>
                <dd className="text-gray-900 font-bold text-right">{x.v}</dd>
              </div>
            ))}
          </dl>
          {user?.role === "cliente" && provider.available ? (
            <Link to={`/cliente/solicitar/${provider.id}`} className="btn btn-primary btn-full text-center"><Icon name="paper-plane" /> Solicitar servicio</Link>
          ) : user ? (
            <button className="btn btn-primary btn-full" disabled>Solo clientes pueden solicitar</button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-full text-center"><Icon name="right-to-bracket" /> Iniciar sesión para solicitar</Link>
          )}
          <Link to={user?.role === "cliente" ? "/cliente/catalogo" : "/catalogo"} className="btn btn-outline btn-full text-center"><Icon name="arrow-left" /> Volver al catálogo</Link>
        </aside>
      </div>
    </div>
  );
}
