import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/UI/Toast";
import api from "../../api/client";
import { Icon, StatusBadge, StatCard, Breadcrumb } from "../../components/UI/helpers";

const ROLES = ["cliente", "proveedor", "admin"];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch (error) {
      showToast(error.response?.data?.error || "No se pudieron cargar los usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const updateLocal = (updated) => setUsers((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));

  const changeStatus = async (target, status) => {
    const action = status === "Activo" ? "reactivar" : status === "Suspendido" ? "suspender" : "bloquear";
    if (!confirm(`¿Deseas ${action} la cuenta de ${target.name}?`)) return;
    setWorkingId(target.id);
    try {
      const { data } = await api.put(`/users/${target.id}/status`, { status });
      updateLocal(data);
      showToast(`Cuenta ${status.toLowerCase()} correctamente`);
    } catch (error) {
      showToast(error.response?.data?.error || "No se pudo actualizar la cuenta", "error");
    } finally { setWorkingId(""); }
  };

  const changeRole = async (target, role) => {
    if (role === target.role) return;
    if (!confirm(`¿Cambiar el rol de ${target.name} de ${target.role} a ${role}? La persona deberá volver a iniciar sesión.`)) return;
    setWorkingId(target.id);
    try {
      const { data } = await api.put(`/users/${target.id}/role`, { role });
      updateLocal(data);
      showToast("Rol actualizado correctamente");
    } catch (error) {
      showToast(error.response?.data?.error || "No se pudo cambiar el rol", "error");
    } finally { setWorkingId(""); }
  };

  const verifyEmail = async (target) => {
    if (!confirm(`¿Confirmar manualmente el correo ${target.email}?`)) return;
    setWorkingId(target.id);
    try {
      const { data } = await api.put(`/users/${target.id}/verification`, { emailVerified: true });
      updateLocal(data);
      showToast("Correo verificado correctamente");
    } catch (error) {
      showToast(error.response?.data?.error || "No se pudo verificar el correo", "error");
    } finally { setWorkingId(""); }
  };

  const statuses = useMemo(() => [...new Set(users.map((item) => item.status).filter(Boolean))].sort(), [users]);
  const filtered = useMemo(() => users.filter((item) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [item.name, item.email, item.city, item.phone].some((value) => value?.toLowerCase().includes(term));
    return matchesSearch && (!roleFilter || item.role === roleFilter) && (!statusFilter || item.status === statusFilter);
  }), [users, search, roleFilter, statusFilter]);

  const activeCount = users.filter((item) => item.status === "Activo" || item.status === "Aprobado").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin/inicio" }, { label: "Usuarios" }]} />
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Gestión de usuarios</h1>
      <p className="text-gray-500 mt-1 mb-6">Administra accesos, roles y verificación de las cuentas registradas.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard value={users.length} label="Usuarios" icon="users" color="blue" />
        <StatCard value={activeCount} label="Activos" icon="user-check" color="green" />
        <StatCard value={users.filter((item) => item.role === "proveedor").length} label="Proveedores" icon="toolbox" color="orange" />
        <StatCard value={users.filter((item) => item.role === "admin").length} label="Administradores" icon="user-shield" color="purple" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-5 grid md:grid-cols-[1fr_180px_200px_auto] gap-3">
        <div className="relative"><Icon name="magnifying-glass" className="absolute left-3 top-3 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, correo, ciudad o teléfono" className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200" /></div>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 text-sm"><option value="">Todos los roles</option>{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 text-sm"><option value="">Todos los estados</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
        <button type="button" onClick={() => { setSearch(""); setRoleFilter(""); setStatusFilter(""); }} className="btn btn-outline btn-small"><Icon name="rotate-left" /> Limpiar</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200"><tr>{["Usuario", "Contacto", "Rol", "Estado", "Verificación", "Acciones"].map((heading) => <th key={heading} className="px-5 py-3 font-semibold text-gray-600">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((target) => {
                const isSelf = target.id === currentUser?.id || target.email === currentUser?.email;
                const busy = workingId === target.id;
                return <tr key={target.id} className="hover:bg-gray-50 align-top">
                  <td className="px-5 py-4"><strong className="block text-gray-900">{target.name}</strong><span className="text-xs text-gray-400">{target.city || "Sin ciudad"}{isSelf ? " · Tu cuenta" : ""}</span></td>
                  <td className="px-5 py-4"><span className="block text-gray-700">{target.email}</span><span className="text-xs text-gray-400">{target.phone || "Sin teléfono"}</span></td>
                  <td className="px-5 py-4"><select value={target.role} disabled={busy || isSelf} onChange={(event) => changeRole(target, event.target.value)} className="h-9 px-2 rounded-lg border border-gray-200 bg-white text-xs font-bold capitalize disabled:opacity-60">{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select></td>
                  <td className="px-5 py-4"><StatusBadge status={target.status} /></td>
                  <td className="px-5 py-4">{target.emailVerified ? <span className="text-xs font-bold text-emerald-700"><Icon name="circle-check" /> Verificado</span> : <button type="button" disabled={busy} onClick={() => verifyEmail(target)} className="btn btn-outline btn-small"><Icon name="envelope-circle-check" /> Verificar</button>}</td>
                  <td className="px-5 py-4"><div className="flex flex-wrap gap-2">{target.status === "Suspendido" || target.status === "Bloqueado" ? <button type="button" disabled={busy} onClick={() => changeStatus(target, "Activo")} className="btn btn-success btn-small"><Icon name="user-check" /> Reactivar</button> : <><button type="button" disabled={busy || isSelf} onClick={() => changeStatus(target, "Suspendido")} className="btn btn-outline btn-small"><Icon name="user-slash" /> Suspender</button><button type="button" disabled={busy || isSelf} onClick={() => changeStatus(target, "Bloqueado")} className="btn btn-danger btn-small"><Icon name="ban" /> Bloquear</button></>}</div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && <p className="text-center text-sm text-gray-500 py-12">No se encontraron usuarios con esos filtros.</p>}
        {loading && <p className="text-center text-sm text-gray-500 py-12"><Icon name="spinner" /> Cargando usuarios...</p>}
      </div>
      <p className="text-xs text-gray-500 mt-4"><Icon name="circle-info" /> Los cambios de rol se aplican cuando el usuario vuelve a iniciar sesión. Suspender o bloquear conserva su historial.</p>
    </div>
  );
}
