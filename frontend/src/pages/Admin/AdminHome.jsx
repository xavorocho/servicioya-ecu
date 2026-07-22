import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { Icon, StatCard, Breadcrumb, StatusChart, DonutChart } from "../../components/UI/helpers";

export default function AdminHome() {
  const { user } = useAuth();
  const [data, setData] = useState({ users: [], providers: [], requests: [] });

  useEffect(() => {
    api.get("/users").then(({ data }) => setData((d) => ({ ...d, users: data })));
    api.get("/providers/all").then(({ data }) => setData((d) => ({ ...d, providers: data })));
    api.get("/requests").then(({ data }) => setData((d) => ({ ...d, requests: data })));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Admin", href: "/admin/inicio" }, { label: "Dashboard" }]} />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Panel administrativo</h1>
      <p className="text-gray-500 mt-1">Gestiona proveedores, usuarios, categorías y reportes generales de la plataforma.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard value={data.users.length} label="Usuarios" icon="users" color="blue" />
        <StatCard value={data.providers.length} label="Proveedores" icon="toolbox" color="teal" />
        <StatCard value={data.providers.filter((p) => p.status === "Pendiente").length} label="Por verificar" icon="hourglass-half" color="orange" />
        <StatCard value={data.requests.length} label="Solicitudes" icon="clipboard-list" color="purple" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4"><Icon name="chart-column" /> Solicitudes por estado</h2>
          <StatusChart requests={data.requests} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4"><Icon name="chart-pie" /> Estado de proveedores</h2>
          <DonutChart providers={data.providers} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Proveedores pendientes</h2>
          <div className="space-y-3">
            {data.providers.filter((p) => p.status === "Pendiente").slice(0, 3).map((p) => (
              <article key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{p.name?.split(" ")[0][0]}{p.name?.split(" ")[1]?.[0]}</span>
                <div className="min-w-0 flex-1"><h3 className="font-bold text-sm text-gray-900 truncate">{p.name}</h3><p className="text-xs text-gray-500">{p.categoryName} · {p.city}</p></div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">Pendiente</span>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Solicitudes recientes</h2>
          <div className="space-y-3">
            {data.requests.slice(0, 4).map((r) => (
              <article key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <span className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">{r.displayId}</span>
                <div className="min-w-0 flex-1"><h3 className="font-bold text-sm text-gray-900 truncate">{r.service}</h3><p className="text-xs text-gray-500 truncate">{r.client} · {r.providerName}</p></div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${r.status === "Pendiente" ? "bg-amber-100 text-amber-800" : r.status === "Confirmada" ? "bg-blue-100 text-blue-800" : r.status === "Completada" ? "bg-emerald-100 text-emerald-800" : r.status === "Cancelada" ? "bg-red-100 text-red-800" : "bg-purple-100 text-purple-800"}`}>{r.status}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
