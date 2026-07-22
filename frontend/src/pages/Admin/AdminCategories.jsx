import { useAuth } from "../../context/AuthContext";
import { Icon } from "../../components/UI/helpers";

const CATEGORIES = [
  { id: "plomeria", name: "Plomería", icon: "wrench", desc: "Fugas, tuberías, grifería y mantenimiento." },
  { id: "electricidad", name: "Electricidad", icon: "bolt", desc: "Instalaciones, tomacorrientes y fallas eléctricas." },
  { id: "limpieza", name: "Limpieza", icon: "broom", desc: "Limpieza general, profunda y por horas." },
  { id: "pintura", name: "Pintura", icon: "paint-roller", desc: "Pintura interior, exterior y retoques." },
  { id: "carpinteria", name: "Carpintería", icon: "hammer", desc: "Muebles, puertas, repisas y reparaciones." },
  { id: "jardineria", name: "Jardinería", icon: "seedling", desc: "Poda, césped y mantenimiento de jardines." },
  { id: "electrodomesticos", name: "Electrodomésticos", icon: "plug", desc: "Diagnóstico y reparación de equipos." },
  { id: "mudanzas", name: "Mudanzas", icon: "truck", desc: "Carga, traslado y descarga de muebles." },
  { id: "cerrajeria", name: "Cerrajería", icon: "key", desc: "Chapas, llaves y apertura de puertas." },
  { id: "cuidado", name: "Cuidado del hogar", icon: "house-user", desc: "Asistencia y apoyo en tareas del hogar." },
];

export default function AdminCategories() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Categorías de servicios</h1>
      <p className="text-gray-500 mt-1 mb-6">Catálogo base de servicios disponibles dentro de ServicioYa ECU.</p>

      <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => (
            <article key={cat.id} className="admin-category\n              p-5 rounded-xl border border-gray-200 bg-gray-50 hover:shadow-lg transition-shadow\n              flex flex-col items-center text-center gap-3">
              <span className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-600 text-xl shadow-sm">
                <Icon name={cat.icon} />
              </span>
              <strong className="block text-sm font-bold text-gray-900">{cat.name}</strong>
              <small className="text-xs text-gray-500">Activa</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
