import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { Icon, StatusBadge } from "../../components/UI/helpers";

export default function AdminProviders() {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    api.get("/providers/all").then(({ data }) => setProviders(data));
  }, []);

  const approve = async (id) => {
    await api.put(`/providers/${id}/approve`);
    setProviders((p) => p.map((x) => (x.id === id ? { ...x, status: "Aprobado", verified: true, available: true } : x)));
  };

  const reject = async (id) => {
    await api.put(`/providers/${id}/reject`);
    setProviders((p) => p.map((x) => (x.id === id ? { ...x, status: "Rechazada", verified: false, available: false } : x)));
  };

  return (
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Proveedores registrados</h1>
      <p class="text-gray-500 mt-1 mb-6">Listado general de proveedores aprobados, pendientes y rechazados dentro de la plataforma.</p>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 font-semibold text-gray-600">Proveedor</th>
                <th class="px-6 py-3 font-semibold text-gray-600">Servicio</th>
                <th class="px-6 py-3 font-semibold text-gray-600">Ciudad</th>
                <th class="px-6 py-3 font-semibold text-gray-600">Estado</th>
                <th class="px-6 py-3 font-semibold text-gray-600">Precio</th>
                <th class="px-6 py-3 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {providers.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">{p.categoryName}</td>
                  <td className="px-6 py-4 text-gray-600">{p.city}</td>
                  <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-6 py-4 text-gray-600">${p.price}/hora</td>
                  <td className="px-6 py-4">
                    {p.status === "Pendiente" ? (
                      <>
                        <button onClick={() => approve(p.id)} className="btn btn-success btn-small mr-1">Aprobar</button>
                        <button onClick={() => reject(p.id)} className="btn btn-danger btn-small">Rechazar</button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">Revisado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
