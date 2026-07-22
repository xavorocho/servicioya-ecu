import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { Icon, StatCard, Breadcrumb, StatusBadge } from "../../components/UI/helpers";

export default function ProviderHome() {
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [requests, setRequests] = useState([]);

  const load = () => {
    api.get("/providers/me").then(({ data }) => setProvider(data));
    api.get("/requests").then(({ data }) => setRequests(data));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Panel del proveedor" }]} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Panel del proveedor</h1>
          <p className="text-gray-500 mt-1">Gestiona tus solicitudes y revisa el estado de verificación de tu perfil.</p>
        </div>
        <Link to="/proveedor/solicitudes" className="btn btn-secondary"><Icon name="inbox" /> Ver todas</Link>
      </div>

      {provider?.status === "Pendiente" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Icon name="hourglass-half" /></span>
            <div>
              <h2 className="font-bold text-amber-800 text-base mb-0.5">Perfil pendiente de verificación</h2>
              <p className="text-sm text-amber-700">Tu cuenta necesita ser revisada por un administrador. Mientras esté pendiente no aparecerás en el catálogo.</p>
            </div>
          </div>
          <Link to="/proveedor/documentos" className="btn btn-primary btn-small" style={{ whiteSpace: "nowrap" }}><Icon name="file-shield" /> Ver documentos</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard value={provider?.status || "-"} label="Estado de perfil" icon="id-card" color={provider?.status === "Aprobado" ? "green" : "orange"} />
        <StatCard value={requests.filter((r) => r.status === "Pendiente").length} label="Pendientes" icon="clock" color="orange" />
        <StatCard value={requests.filter((r) => r.status === "Confirmada").length} label="Confirmadas" icon="circle-check" color="blue" />
        <StatCard value={requests.filter((r) => r.status === "Completada").length} label="Completadas" icon="check-double" color="green" />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Resumen profesional</h2>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100"><dt className="text-gray-500 font-semibold">Nombre</dt><dd className="text-gray-900 font-bold">{provider?.name}</dd></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><dt className="text-gray-500 font-semibold">Especialidad</dt><dd className="text-gray-900 font-bold">{provider?.categoryName}</dd></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><dt className="text-gray-500 font-semibold">Ciudad</dt><dd className="text-gray-900 font-bold">{provider?.city}</dd></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><dt className="text-gray-500 font-semibold">Sector</dt><dd className="text-gray-900 font-bold">{provider?.sector}</dd></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><dt className="text-gray-500 font-semibold">Precio</dt><dd className="text-gray-900 font-bold">${provider?.price}/hora</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500 font-semibold">Validación</dt><dd><StatusBadge status={provider?.status} /></dd></div>
          </dl>
          <div className="mt-5 flex gap-2">
            <Link to="/proveedor/perfil" className="btn btn-primary btn-small"><Icon name="pencil" /> Editar perfil</Link>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Solicitudes recientes</h2>
          <div className="space-y-3">
            {requests.slice(0, 5).map((r) => (
              <article key={r.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm flex-shrink-0">{r.providerName.slice(0, 2).toUpperCase()}</div>
                <div className="min-w-0 flex-1"><h3 className="font-bold text-sm text-gray-900 truncate">{r.displayId} · {r.service}</h3><p className="text-xs text-gray-500 truncate">{r.client} · {r.city}</p></div>
                <StatusBadge status={r.status} />
              </article>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/proveedor/solicitudes" className="text-sm font-bold text-blue-600 hover:underline">Ver todas las solicitudes</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
