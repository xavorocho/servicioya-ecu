import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/UI/Toast";
import api from "../../api/client";
import { Icon, StatCard, StatusChart, DonutChart } from "../../components/UI/helpers";

export default function AdminReports() {
  const { user } = useAuth();
  const showToast = useToast();
  const [stats, setStats] = useState({ totalRequests: 0, completedRequests: 0, pendingProviders: 0, approvedProviders: 0 });

  useEffect(() => {
    const load = () => {
      api.get("/requests").then(({ data }) => setStats((s) => ({
        totalRequests: data.length,
        completedRequests: data.filter((r) => r.status === "Completada").length,
        pendingProviders: data.length, // simulated
        approvedProviders: data.length, // simulated
      })));
    };
    load();
  }, []);

  const exportReport = async () => {
    showToast("Reporte exportado en modo demostración.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Reportes</h1>
      <p className="text-gray-500 mt-1 mb-6">Resumen de actividad de la plataforma para seguimiento administrativo.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard value={stats.totalRequests} label="Solicitudes totales" icon="clipboard-list" color="teal" />
        <StatCard value={stats.completedRequests} label="Servicios completados" icon="check-double" color="green" />
        <StatCard value={stats.pendingProviders} label="Proveedores por validar" icon="hourglass-half" color="orange" />
        <StatCard value={stats.approvedProviders} label="Proveedores aprobados" icon="user-check" color="blue" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4"><Icon name="chart-column" /> Distribución de solicitudes</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm font-medium">Pendiente</span>
              <span className="text-sm font-bold">39%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm font-medium">Confirmada</span>
              <span className="text-sm font-bold">25%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm font-medium">Completada</span>
              <span className="text-sm font-bold">28%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <span className="text-sm font-medium">Cancelada</span>
              <span className="text-sm font-bold">8%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4"><Icon name="chart-pie" /> Proveedores por estado</h2>
          <div className="flex items-center justify-center">
            <div className="w-32 h-32 rounded-full relative">
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500">Gráfico circular simulado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3"><Icon name="file-export" /> Exportar reporte</h2>
        <p className="text-sm text-gray-500 mb-4">Este módulo demuestra la salida inicial de indicadores. En una versión real permitiría exportar PDF o Excel.</p>
        <button onClick={exportReport} className="btn btn-secondary"><Icon name="download" /> Exportar reporte simulado</button>
      </section>
    </div>
  );
}
