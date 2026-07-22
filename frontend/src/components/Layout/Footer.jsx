import { Link } from "react-router-dom";
import { Icon } from "../UI/helpers";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Icon name="house-chimney-user" />
              </span>
              <strong className="text-lg font-extrabold">ServicioYa ECU</strong>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Plataforma ecuatoriana para contratar servicios técnicos y asistencia del hogar con proveedores verificados.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-gray-300 text-xs font-semibold">
                <Icon name="shield-halved" className="text-blue-400" /> Proveedores verificados
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-gray-300 text-xs font-semibold">
                <Icon name="location-dot" className="text-blue-400" /> Ecuador
              </span>
            </div>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-4 text-gray-200">
              <Icon name="users" className="text-blue-400" /> Módulos
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Icon name="user" className="text-blue-400" /> Cliente — buscar y solicitar</li>
              <li className="flex items-center gap-2"><Icon name="toolbox" className="text-blue-400" /> Proveedor — gestionar servicios</li>
              <li className="flex items-center gap-2"><Icon name="user-shield" className="text-blue-400" /> Admin — verificación y reportes</li>
            </ul>
          </section>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-4 text-gray-200">
              <Icon name="circle-info" className="text-blue-400" /> Ayuda rápida
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/ayuda" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"><Icon name="circle-question" className="text-blue-400" /> Guía de uso</Link></li>
              <li><Link to="/catalogo" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"><Icon name="magnifying-glass" className="text-blue-400" /> Ver catálogo</Link></li>
              <li><Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"><Icon name="right-to-bracket" className="text-blue-400" /> Iniciar sesión</Link></li>
            </ul>
          </section>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-gray-500">
          <p>Proyecto académico — Diseño Centrado en el Usuario · ESPE IV</p>
          <p className="flex items-center gap-1.5">
            <Icon name="bolt" className="text-blue-400" /> React · Express · Prisma · SQLite
          </p>
        </div>
      </div>
    </footer>
  );
}
