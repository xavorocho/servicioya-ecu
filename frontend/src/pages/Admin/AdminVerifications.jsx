import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { Icon, StatusBadge, Avatar } from "../../components/UI/helpers";

export default function AdminVerifications() {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    api.get("/providers/pending").then(({ data }) => setProviders(data));
  }, []);

  const approve = async (id) => {
    await api.put(`/providers/${id}/approve`);
    setProviders((p) => p.filter((x) => x.id !== id));
  };

  const reject = async (id) => {
    await api.put(`/providers/${id}/reject`);
    setProviders((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Verificación de proveedores</h1>
      <p className="text-gray-500 mt-1 mb-6">Revisa documentos y aprueba únicamente a los proveedores que cumplan los requisitos mínimos de confianza.</p>

      <div className="space-y-3">
        {providers.length ? providers.map((p) => (
          <article key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <Avatar name={p.name} className="w-12 h-12 rounded-xl" />
                <div><h3 className="font-bold text-gray-900 text-sm">{p.name}</h3><p className="text-xs text-gray-500">{p.categoryName} · {p.city} · {p.sector}</p></div>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-sm text-gray-600 mb-3">{p.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[<Icon name="file-pdf" />, p.documents.cedula, <Icon name="file-shield" />, p.documents.antecedentes, <Icon name="star" />, p.documents.oficio, <Icon name="tags" />, p.documents.ruc || "No adjuntado"].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">{item}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => approve(p.id)} className="btn btn-success btn-small"><Icon name="check" /> Aprobar</button>
              <button onClick={() => reject(p.id)} className="btn btn-danger btn-small"><Icon name="xmark" /> Rechazar</button>
              <a href={p.documents.cedula?.startsWith("http") ? p.documents.cedula : `/api/uploads/${p.documents.cedula}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-small"><Icon name="file-pdf" /> Ver documentos</a>
            </div>
          </article>
        )) : (
          <div className="text-center py-12 px-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-gray-500">No hay proveedores pendientes de verificación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
