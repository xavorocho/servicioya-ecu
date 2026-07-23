import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { Icon } from "./helpers";

const guides = {
  Cliente: [
    { icon: "magnifying-glass", title: "Solicitar un servicio", desc: 'Ve al catálogo, selecciona un proveedor y haz clic en "Solicitar servicio".' },
    { icon: "circle-check", title: "Aceptar una cotización", desc: 'En "Mis solicitudes", abre la solicitud y revisa las opciones de precio.' },
    { icon: "clock", title: "Proponer otra hora", desc: 'En la cotización, selecciona "Proponer otra hora".' },
    { icon: "dollar-sign", title: "Pagar reserva", desc: 'Después de aceptar, haz clic en "Pagar reserva".' },
    { icon: "star", title: "Calificar un servicio", desc: 'En "Mis solicitudes", abre la solicitud completada y califica.' },
  ],
  Proveedor: [
    { icon: "inbox", title: "Revisar una solicitud", desc: 'Ve a "Mis trabajos" y abre el detalle.' },
    { icon: "dollar-sign", title: "Enviar cotización", desc: 'En el detalle del trabajo, haz clic en "Crear cotización".' },
    { icon: "clock", title: "Responder a hora propuesta", desc: "En el detalle, acepta o rechaza la propuesta." },
    { icon: "play", title: "Iniciar trabajo", desc: 'Después de confirmación, haz clic en "Iniciar trabajo".' },
    { icon: "check-double", title: "Finalizar trabajo", desc: 'En el detalle, haz clic en "Marcar como completado".' },
  ],
  Admin: [
    { icon: "user-check", title: "Verificar proveedores", desc: 'Ve a "Verificaciones" y revisa documentos.' },
    { icon: "clipboard-list", title: "Gestionar solicitudes", desc: 'Ve a "Solicitudes" para supervisar el estado.' },
    { icon: "tags", title: "Gestionar categorías", desc: 'Ve a "Categorías" para crear o editar.' },
  ],
};

const roleLabels = { Cliente: "Guía del Cliente", Proveedor: "Guía del Proveedor", Admin: "Guía del Administrador" };

export default function HelpButton() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const role = user?.role || "Cliente";
  const items = guides[role] || guides.Cliente;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await api.post("/support", { subject: subject.trim(), message: message.trim(), role });
      setSent(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setSent(false), 4000);
    } catch {
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Ayuda"
      >
        <Icon name="circle-question" className="text-2xl" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-gray-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />

          <div className="relative bg-white w-full max-w-md h-full shadow-2xl animate-slide-in flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{roleLabels[role] || "Centro de Ayuda"}</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar"
              >
                <Icon name="xmark" className="text-lg" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={item.icon} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="envelope" className="text-blue-600" /> Contactar soporte
              </h3>

              {sent ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold">
                  <Icon name="circle-check" /> Mensaje enviado correctamente.
                </div>
              ) : (
                <form onSubmit={handleSend} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Asunto"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <textarea
                    placeholder="Describe tu problema o pregunta..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sending || !subject.trim() || !message.trim()}
                    className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {sending ? <><Icon name="spinner" className="text-sm" /> Enviando...</> : <><Icon name="paper-plane" className="text-sm" /> Enviar mensaje</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
