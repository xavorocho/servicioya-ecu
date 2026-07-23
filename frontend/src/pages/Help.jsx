import { Icon } from "../components/UI/helpers";

export default function Help() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Ayuda</h1>
      <p className="text-gray-500 mt-1 mb-6">Guía rápida para utilizar ServicioYa ECU.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3"><Icon name="user" className="text-blue-600 mr-1.5" /> Cliente</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {["Busca proveedores aprobados.", "Revisa perfiles y calificaciones.", "Solicita servicios.", "Consulta y cancela solicitudes."].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-[0.5rem]"><Icon name="check" /></span> {t}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3"><Icon name="toolbox" className="text-blue-600 mr-1.5" /> Proveedor</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {["Registra datos profesionales.", "Adjunta documentos de validación.", "Espera aprobación administrativa.", "Gestiona solicitudes recibidas."].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-[0.5rem]"><Icon name="check" /></span> {t}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3"><Icon name="user-shield" className="text-blue-600 mr-1.5" /> Administrador</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {["Revisa documentos de proveedores.", "Aprueba o rechaza perfiles.", "Consulta usuarios y reportes.", "Gestiona categorías del sistema."].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 text-[0.5rem]"><Icon name="check" /></span> {t}</li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3"><Icon name="circle-question" className="text-blue-600 mr-1.5" /> Soporte</h2>
          <p className="text-sm text-gray-500">Usa el botón de ayuda ubicado en la esquina inferior derecha para enviar una consulta al equipo de soporte.</p>
        </section>
      </div>
    </div>
  );
}
