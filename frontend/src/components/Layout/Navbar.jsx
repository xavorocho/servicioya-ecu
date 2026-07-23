import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "../UI/helpers";

const publicLinks = [
  { label: "Inicio", path: "/", icon: "house" },
  { label: "Catálogo", path: "/catalogo", icon: "magnifying-glass" },
  { label: "Ayuda", path: "/ayuda", icon: "circle-question" },
];

const roleLinks = {
  cliente: [
    { label: "Inicio", path: "/cliente/inicio", icon: "house" },
    { label: "Buscar servicios", path: "/cliente/catalogo", icon: "magnifying-glass" },
    { label: "Mis solicitudes", path: "/cliente/solicitudes", icon: "clipboard-list" },
    { label: "Mi perfil", path: "/cliente/perfil", icon: "user" },
  ],
  proveedor: [
    { label: "Panel", path: "/proveedor/inicio", icon: "gauge-high" },
    { label: "Solicitudes", path: "/proveedor/solicitudes", icon: "inbox" },
    { label: "Mi perfil", path: "/proveedor/perfil", icon: "id-card" },
    { label: "Verificación", path: "/proveedor/documentos", icon: "file-shield" },
  ],
  admin: [
    { label: "Dashboard", path: "/admin/inicio", icon: "chart-pie" },
    { label: "Solicitudes", path: "/admin/solicitudes", icon: "clipboard-list" },
    { label: "Verificaciones", path: "/admin/verificaciones", icon: "user-check" },
    { label: "Usuarios", path: "/admin/usuarios", icon: "users" },
    { label: "Proveedores", path: "/admin/proveedores", icon: "toolbox" },
    { label: "Categorías", path: "/admin/categorias", icon: "tags" },
    { label: "Reportes", path: "/admin/reportes", icon: "chart-column" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user ? roleLinks[user.role] || [] : publicLinks;
  const initials = (name) => String(name || "SY").split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 border-b border-gray-200 backdrop-blur-md shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? `/${user.role}/inicio` : "/"} className="flex items-center gap-3 hover:opacity-85 transition-opacity" aria-label="Ir a ServicioYa ECU">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Icon name="house-chimney-user" />
            </span>
            <div className="leading-tight">
              <strong className="block text-sm font-extrabold text-gray-900">ServicioYa ECU</strong>
              <small className="block text-xs text-gray-500 font-medium">Servicios confiables</small>
            </div>
          </Link>

          <button
            className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-blue-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? "xmark" : "bars"} />
          </button>

          <div className={`${menuOpen ? "flex" : "hidden"} lg:flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-0 absolute lg:static top-16 left-0 right-0 bg-white lg:bg-transparent border-b lg:border-0 border-gray-200 lg:border-none p-4 lg:p-0 shadow-lg lg:shadow-none z-50`}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:mr-4">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                    isActive(link.path) ? "bg-blue-50 text-blue-800" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon name={link.icon} className="text-xs opacity-75" />
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="lg:ml-auto flex flex-col lg:flex-row items-stretch lg:items-center gap-2 pt-3 lg:pt-0 border-t lg:border-0 border-gray-100 lg:border-none mt-3 lg:mt-0">
              {!user ? (
                <>
                  <Link to="/login" className="btn btn-secondary text-center" onClick={() => setMenuOpen(false)}>
                    <Icon name="right-to-bracket" /> Iniciar sesión
                  </Link>
                  <Link to="/registro" className="btn btn-primary text-center" onClick={() => setMenuOpen(false)}>
                    <Icon name="user-plus" /> Registrarme
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={`/${user.role}/perfil`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm hover:border-blue-200 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                      {initials(user.name)}
                    </span>
                    <div className="leading-tight">
                      <strong className="block text-sm text-gray-900">{user.name}</strong>
                      <small className="block text-xs text-gray-500 font-medium capitalize">{user.role}</small>
                    </div>
                  </Link>
                  <button
                    className="btn btn-outline btn-small"
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                  >
                    <Icon name="right-from-bracket" /> Salir
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
