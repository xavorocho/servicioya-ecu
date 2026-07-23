import { useState, useEffect } from "react";
import api from "../../api/client";
import { useToast } from "../../components/UI/Toast";
import { Icon, Breadcrumb } from "../../components/UI/helpers";

const DOC_LABELS = {
  cedula: "Cédula",
  antecedentes: "Antecedentes Penales",
  oficio: "Certificado",
  ruc: "RUC",
  frontal: "Foto de perfil",
};

function getDocUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `/api/uploads/${path}`;
}

function ProviderCard({ provider, onApproved, onRejected }) {
  const { addToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [docRejectReason, setDocRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const docs = provider.documents || {};
  const docEntries = Object.entries(docs).filter(
    ([key, val]) => val && key !== "frontal"
  );

  const allApproved = provider.status === "Aprobado";
  const allRejected = provider.status === "Rechazado";

  const approveAll = async () => {
    setLoading(true);
    try {
      await api.put(`/providers/${provider.id}/approve`);
      addToast("Proveedor aprobado correctamente", "success");
      onApproved(provider.id);
    } catch {
      addToast("Error al aprobar proveedor", "error");
    } finally {
      setLoading(false);
    }
  };

  const rejectAll = async () => {
    if (!rejectReason.trim()) {
      addToast("Ingresa un motivo de rechazo", "error");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/providers/${provider.id}/reject`, {
        reason: rejectReason.trim(),
      });
      addToast("Proveedor rechazado", "success");
      onRejected(provider.id);
    } catch {
      addToast("Error al rechazar proveedor", "error");
    } finally {
      setLoading(false);
    }
  };

  const approveDoc = async (docKey) => {
    setLoading(true);
    try {
      await api.put(`/providers/${provider.id}/documents/${docKey}/approve`);
      addToast(`${DOC_LABELS[docKey] || docKey} aprobado`, "success");
      onApproved(provider.id);
    } catch {
      addToast("Error al aprobar documento", "error");
    } finally {
      setLoading(false);
    }
  };

  const rejectDoc = async (docKey) => {
    if (!docRejectReason.trim()) {
      addToast("Ingresa un motivo para rechazar el documento", "error");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/providers/${provider.id}/documents/${docKey}/reject`, {
        reason: docRejectReason.trim(),
      });
      addToast(`${DOC_LABELS[docKey] || docKey} rechazado`, "success");
      setRejectingDoc(null);
      setDocRejectReason("");
      onRejected(provider.id);
    } catch {
      addToast("Error al rechazar documento", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          {docs.frontal ? (
            <img
              src={getDocUrl(docs.frontal)}
              alt={provider.name}
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border border-gray-200">
              {provider.name?.charAt(0) || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base">
                {provider.name}
              </h3>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  allApproved
                    ? "bg-green-100 text-green-700"
                    : allRejected
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {provider.status || "Pendiente"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {provider.categoryName} · {provider.city} · {provider.sector}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name={expanded ? "chevron-up" : "chevron-down"} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <span className="text-gray-500 text-xs block">Nombre</span>
            <span className="font-medium text-gray-900">{provider.name}</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <span className="text-gray-500 text-xs block">Email</span>
            <span className="font-medium text-gray-900 truncate block">
              {provider.email}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <span className="text-gray-500 text-xs block">Teléfono</span>
            <span className="font-medium text-gray-900">
              {provider.phone || "—"}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <span className="text-gray-500 text-xs block">Experiencia</span>
            <span className="font-medium text-gray-900">
              {provider.experience ? `${provider.experience} años` : "—"}
            </span>
          </div>
        </div>

        {provider.description && (
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {provider.description}
          </p>
        )}

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Documentos
          </h4>
          <div className="space-y-2">
            {docEntries.map(([key, val]) => {
              const url = getDocUrl(val);
              const isRejecting = rejectingDoc === key;
              return (
                <div
                  key={key}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="file" className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800">
                        {DOC_LABELS[key] || key}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                        >
                          Ver archivo
                        </a>
                      )}
                      <button
                        onClick={() => approveDoc(key)}
                        disabled={loading}
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Icon name="check" className="mr-1" />Aprobar
                      </button>
                      <button
                        onClick={() => {
                          setRejectingDoc(isRejecting ? null : key);
                          setDocRejectReason("");
                        }}
                        disabled={loading}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        <Icon name="xmark" className="mr-1" />Rechazar
                      </button>
                    </div>
                  </div>
                  {isRejecting && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Motivo de rechazo..."
                        value={docRejectReason}
                        onChange={(e) => setDocRejectReason(e.target.value)}
                        className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-300"
                      />
                      <button
                        onClick={() => rejectDoc(key)}
                        disabled={loading}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Acciones globales
          </h4>
          {rejecting ? (
            <div className="space-y-3">
              <textarea
                placeholder="Describe el motivo del rechazo del proveedor..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <div className="flex gap-2">
                <button
                  onClick={rejectAll}
                  disabled={loading}
                  className="btn btn-danger btn-small"
                >
                  <Icon name="xmark" /> Confirmar rechazo
                </button>
                <button
                  onClick={() => {
                    setRejecting(false);
                    setRejectReason("");
                  }}
                  className="btn btn-outline btn-small"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={approveAll}
                disabled={loading || allApproved}
                className="btn btn-success btn-small"
              >
                <Icon name="check" /> Aprobar todo
              </button>
              <button
                onClick={() => setRejecting(true)}
                disabled={loading || allRejected}
                className="btn btn-danger btn-small"
              >
                <Icon name="xmark" /> Rechazar proveedor
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default function AdminVerifications() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/providers/pending");
      setProviders(data);
    } catch {
      addToast("Error al cargar proveedores pendientes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApproved = (id) => {
    setProviders((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRejected = (id) => {
    setProviders((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Verificaciones" },
        ]}
      />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">
        Verificación de proveedores
      </h1>
      <p className="text-gray-500 mt-1 mb-6">
        Revisa documentos y aprueba únicamente a los proveedores que cumplan los
        requisitos mínimos de confianza.
      </p>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando proveedores...</p>
        </div>
      ) : providers.length > 0 ? (
        <div className="space-y-4">
          {providers.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              onApproved={handleApproved}
              onRejected={handleRejected}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <Icon name="check-circle" className="text-gray-300 text-4xl mb-3" />
          <p className="text-gray-500 font-medium">
            No hay proveedores pendientes de verificación.
          </p>
        </div>
      )}
    </div>
  );
}
