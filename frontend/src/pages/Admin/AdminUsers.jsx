import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { Icon, StatusBadge } from "../../components/UI/helpers";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get("/users").then(({ data }) => setUsers(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Usuarios registrados</h1>
      <p className="text-gray-500 mt-1 mb-6">Listado general de clientes, proveedores y administradores registrados en el sistema.</p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-600">Nombre</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Correo</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Rol</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Ciudad</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold capitalize">{u.role}</span></td>
                  <td className="px-6 py-4 text-gray-600">{u.city}</td>
                  <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
