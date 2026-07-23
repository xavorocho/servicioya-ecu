import { useState, useEffect } from "react";
import api from "../../api/client";
import { useToast } from "../../components/UI/Toast";
import { Icon, StatCard, Breadcrumb } from "../../components/UI/helpers";

const STATUS_MAP = {
  nuevo: { label: "Nuevo", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  en_revision: { label: "En revisión", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  respondido: { label: "Respondido", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cerrado: { label: "Cerrado", bg: "bg-gray-100 text-gray-600 border-gray-200" },
};

const TABS = [
  { key: "", label: "Todos" },
  { key: "nuevo", label: "Nuevos" },
  { key: "en_revision", label: "En revisión" },
  { key: "respondido", label: "Respondidos" },
  { key: "cerrado", label: "Cerrados" },
];

export default function AdminSupport() {
  const showToast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [responses, setResponses] = useState({});

  const load = () => {
    setLoading(true);
    api
      .get("/support")
      .then(({ data }) => setMessages(Array.isArray(data) ? data : []))
      .catch(() => showToast("Error al cargar mensajes", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const total = messages.length;
  const nuevos = messages.filter((m) => m.status === "nuevo").length;
  const revision = messages.filter((m) => m.status === "en_revision").length;
  const respondidos = messages.filter((m) => m.status === "respondido").length;
  const cerrados = messages.filter((m) => m.status === "cerrado").length;

  const filtered = activeTab ? messages.filter((m) => m.status === activeTab) : messages;

  const markInProgress = async (id) => {
    try {
      await api.put(`/support/${id}/status`, { status: "en_revision" });
      setMessages((prev) => prev.map((m) => (m.id === id || m._id === id ? { ...m, status: "en_revision" } : m)));
      showToast("Marcado como en revisión");
    } catch {
      showToast("Error al actualizar", "error");
    }
  };

  const closeMessage = async (id) => {
    try {
      await api.put(`/support/${id}/close`);
      setMessages((prev) => prev.map((m) => (m.id === id || m._id === id ? { ...m, status: "cerrado" } : m)));
      showToast("Mensaje cerrado");
    } catch {
      showToast("Error al cerrar", "error");
    }
  };

  const sendResponse = async (id) => {
    const text = responses[id];
    if (!text?.trim()) return showToast("Escribe una respuesta", "error");
    try {
      await api.put(`/support/${id}/respond`, { status: "respondido", response: text.trim() });
      setMessages((prev) => prev.map((m) => (m.id === id || m._id === id ? { ...m, status: "respondido", response: text.trim() } : m)));
      setResponses((prev) => ({ ...prev, [id]: "" }));
      showToast("Respuesta enviada");
    } catch {
      showToast("Error al responder", "error");
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Icon name="spinner" /> Cargando mensajes de soporte...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin/inicio" }, { label: "Soporte" }]} />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Mensajes de soporte</h1>
      <p className="text-gray-500 mt-1 mb-6">Gestiona las consultas y problemas reportados por los usuarios de la plataforma.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard value={total} label="Total" icon="envelope" color="blue" />
        <StatCard value={nuevos} label="Nuevos" icon="circle-info" color="teal" />
        <StatCard value={revision} label="En revisión" icon="clock" color="orange" />
        <StatCard value={respondidos} label="Respondidos" icon="check-double" color="green" />
        <StatCard value={cerrados} label="Cerrados" icon="ban" color="purple" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            {tab.key !== "" && (
              <span className="ml-1.5 text-xs opacity-80">
                ({tab.key === "nuevo" ? nuevos : tab.key === "en_revision" ? revision : tab.key === "respondido" ? respondidos : cerrados})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl">
              <Icon name="envelope" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sin mensajes</h3>
            <p className="text-gray-500">No hay mensajes de soporte {activeTab ? `con estado "${STATUS_MAP[activeTab]?.label}"` : ""}.</p>
          </div>
        ) : (
          filtered.map((msg) => {
            const id = msg.id || msg._id;
            const st = STATUS_MAP[msg.status] || STATUS_MAP.nuevo;
            return (
              <article
                key={id}
                className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-extrabold flex-shrink-0 capitalize">
                      {msg.userName?.[0] || "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900">{msg.subject || "Sin asunto"}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold border ${st.bg}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-semibold">
                        <span className="flex items-center gap-1"><Icon name="user" className="text-[0.7rem]" /> {msg.userName || "—"}</span>
                        <span className="flex items-center gap-1"><Icon name="envelope" className="text-[0.7rem]" /> {msg.userEmail || "—"}</span>
                        <span className="flex items-center gap-1 capitalize"><Icon name="shield-halved" className="text-[0.7rem]" /> {msg.userRole || "—"}</span>
                        <span className={`px-2 py-0.5 rounded-full ${msg.priority === "urgente" || msg.priority === "alta" ? "bg-red-100 text-red-700" : "bg-gray-100"}`}>Prioridad: {msg.priority || "media"}</span>
                        <span className="flex items-center gap-1"><Icon name="clock" className="text-[0.7rem]" /> {formatDate(msg.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>

                {msg.response && (
                  <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1"><Icon name="check-double" className="text-[0.7rem]" /> Respuesta del administrador:</p>
                    <p className="text-sm text-emerald-800 whitespace-pre-wrap">{msg.response}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                  {msg.status !== "en_revision" && msg.status !== "respondido" && msg.status !== "cerrado" && (
                    <button onClick={() => markInProgress(id)} className="btn btn-outline btn-small">
                      <Icon name="clock" /> Marcar en revisión
                    </button>
                  )}
                  {msg.status !== "respondido" && msg.status !== "cerrado" && (
                    <>
                      <textarea
                        value={responses[id] || ""}
                        onChange={(e) => setResponses((prev) => ({ ...prev, [id]: e.target.value }))}
                        placeholder="Escribe tu respuesta..."
                        rows={2}
                        className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                      />
                      <button onClick={() => sendResponse(id)} className="btn btn-primary btn-small self-end">
                        <Icon name="paper-plane" /> Responder
                      </button>
                    </>
                  )}
                  {msg.status !== "cerrado" && (
                    <button onClick={() => closeMessage(id)} className="btn btn-outline btn-small text-red-600 border-red-200 hover:bg-red-50">
                      <Icon name="xmark" /> Cerrar
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400 font-semibold mt-6">
          Mostrando {filtered.length} de {total} mensajes
        </p>
      )}
    </div>
  );
}
