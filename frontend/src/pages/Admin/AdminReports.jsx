import { useState, useEffect } from "react";
import api from "../../api/client";
import { Icon, StatCard, Breadcrumb } from "../../components/UI/helpers";

export default function AdminReports() {
  const [requests, setRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/requests").catch(() => ({ data: [] })),
      api.get("/providers").catch(() => ({ data: [] })),
      api.get("/payments").catch(() => ({ data: [] })),
    ]).then(([reqRes, provRes, payRes]) => {
      setRequests(reqRes.data);
      setProviders(provRes.data);
      setPayments(payRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[40vh]">
        <Icon name="spinner" className="text-blue-600 text-2xl" />
      </div>
    );
  }

  const completedRequests = requests.filter((r) => r.status === "Completada").length;
  const cancelledRequests = requests.filter((r) => r.status === "Cancelada").length;
  const activeProviders = providers.filter((p) => p.status === "Aprobado" || p.status === "Activo").length;
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const statusMap = {};
  requests.forEach((r) => {
    statusMap[r.status] = (statusMap[r.status] || 0) + 1;
  });
  const statusEntries = Object.entries(statusMap).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(...statusEntries.map(([, c]) => c), 1);

  const cityMap = {};
  requests.forEach((r) => {
    const city = r.city || r.location || r.direccion || "Sin ciudad";
    cityMap[city] = (cityMap[city] || 0) + 1;
  });
  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCity = Math.max(...topCities.map(([, c]) => c), 1);

  const providerCompletedMap = {};
  requests.forEach((r) => {
    if (r.status === "Completada" && (r.providerId || r.provider_id)) {
      const pid = r.providerId || r.provider_id;
      providerCompletedMap[pid] = (providerCompletedMap[pid] || 0) + 1;
    }
  });
  const topProviders = Object.entries(providerCompletedMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pid, count]) => {
      const prov = providers.find((p) => p.id == pid || p._id == pid);
      return { name: prov?.name || prov?.businessName || `Proveedor #${pid}`, rating: prov?.rating || 0, completed: count };
    });
  const maxProvider = Math.max(...topProviders.map((p) => p.completed), 1);

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthRevenue = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthRevenue[key] = 0;
  }
  payments.forEach((p) => {
    const date = p.date || p.createdAt || p.created_at;
    if (!date) return;
    const d = new Date(date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthRevenue) {
      monthRevenue[key] += Number(p.amount) || 0;
    }
  });
  const monthlyEntries = Object.entries(monthRevenue).map(([key, val]) => {
    const [y, m] = key.split("-");
    return { label: `${monthNames[Number(m) - 1]} ${y.slice(2)}`, value: val };
  });
  const maxRevenue = Math.max(...monthlyEntries.map((e) => e.value), 1);

  const statusBarColors = {
    Pendiente: "from-amber-500 to-amber-300",
    Confirmada: "from-blue-600 to-blue-400",
    "En proceso": "from-purple-600 to-purple-400",
    Completada: "from-emerald-600 to-emerald-400",
    Cancelada: "from-red-500 to-red-300",
    Rechazada: "from-red-500 to-red-300",
  };
  const defaultBarColor = "from-gray-500 to-gray-300";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Admin", href: "/admin/inicio" }, { label: "Reportes" }]} />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Reportes</h1>
      <p className="text-gray-500 mt-1 mb-6">Resumen completo de actividad de la plataforma.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard value={requests.length} label="Solicitudes totales" icon="clipboard-list" color="teal" />
        <StatCard value={completedRequests} label="Completadas" icon="check-double" color="green" />
        <StatCard value={cancelledRequests} label="Canceladas" icon="ban" color="red" />
        <StatCard value={activeProviders} label="Proveedores activos" icon="user-check" color="blue" />
        <StatCard value={`$${totalRevenue.toLocaleString()}`} label="Ingresos totales" icon="dollar-sign" color="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4"><Icon name="chart-column" /> Solicitudes por estado</h2>
          {statusEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No hay datos disponibles.</p>
          ) : (
            <div className="space-y-3">
              {statusEntries.map(([status, count]) => {
                const pct = requests.length > 0 ? Math.round((count / requests.length) * 100) : 0;
                const barWidth = Math.round((count / maxStatus) * 100);
                const barColor = statusBarColors[status] || defaultBarColor;
                return (
                  <div key={status} className="grid grid-cols-[100px_1fr_50px] gap-3 items-center">
                    <span className="text-sm font-semibold text-gray-600 truncate" title={status}>{status}</span>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                    </div>
                    <span className="text-right text-sm text-gray-800">
                      <strong>{count}</strong> <span className="text-gray-400">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4"><Icon name="location-dot" /> Top 5 ciudades</h2>
          {topCities.length === 0 ? (
            <p className="text-sm text-gray-400">No hay datos disponibles.</p>
          ) : (
            <div className="space-y-3">
              {topCities.map(([city, count], i) => {
                const barWidth = Math.round((count / maxCity) * 100);
                const colors = ["from-blue-600 to-blue-400", "from-teal-600 to-teal-400", "from-indigo-600 to-indigo-400", "from-cyan-600 to-cyan-400", "from-sky-600 to-sky-400"];
                return (
                  <div key={city} className="grid grid-cols-[120px_1fr_40px] gap-3 items-center">
                    <span className="text-sm font-semibold text-gray-600 truncate" title={city}>
                      <span className="text-gray-400 mr-1">#{i + 1}</span>{city}
                    </span>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${colors[i] || colors[0]} transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                    </div>
                    <span className="text-right font-extrabold text-sm text-gray-800">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4"><Icon name="star" /> Top proveedores</h2>
          {topProviders.length === 0 ? (
            <p className="text-sm text-gray-400">No hay datos disponibles.</p>
          ) : (
            <div className="space-y-3">
              {topProviders.map((prov, i) => {
                const barWidth = Math.round((prov.completed / maxProvider) * 100);
                return (
                  <div key={i} className="flex flex-col gap-1.5 p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800 truncate">{prov.name}</span>
                      <span className="text-xs text-amber-500 font-semibold">
                        <Icon name="star" className="text-amber-400" /> {prov.rating ? Number(prov.rating).toFixed(1) : "N/A"}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1fr_60px] gap-2 items-center">
                      <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" style={{ width: `${barWidth}%` }} />
                      </div>
                      <span className="text-right text-xs font-bold text-gray-600">{prov.completed} servicios</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4"><Icon name="dollar-sign" /> Ingresos mensuales</h2>
          {monthlyEntries.length === 0 ? (
            <p className="text-sm text-gray-400">No hay datos disponibles.</p>
          ) : (
            <div className="space-y-3">
              {monthlyEntries.map((entry, i) => {
                const barWidth = Math.round((entry.value / maxRevenue) * 100);
                return (
                  <div key={i} className="grid grid-cols-[70px_1fr_80px] gap-3 items-center">
                    <span className="text-sm font-semibold text-gray-600">{entry.label}</span>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500" style={{ width: `${barWidth}%` }} />
                    </div>
                    <span className="text-right text-sm font-bold text-gray-800">${entry.value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
