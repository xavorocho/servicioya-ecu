import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "../UI/helpers";
import NotificationBell from "../UI/NotificationBell";
import { getFileUrl } from "../../utils/files";

const publicLinks = [{ label: "Inicio", path: "/" }, { label: "Explorar", path: "/catalogo" }, { label: "Cómo funciona", path: "/ayuda" }];
const quickServices = [["wrench", "Plomería", "plomeria"], ["bolt", "Electricidad", "electricidad"], ["broom", "Limpieza", "limpieza"], ["paint-roller", "Pintura", "pintura"], ["hammer", "Carpintería", "carpinteria"], ["seedling", "Jardinería", "jardineria"]];
const roleLinks = {
  cliente: [{ label: "Inicio", path: "/cliente/inicio" }, { label: "Buscar servicios", path: "/cliente/catalogo" }, { label: "Mis solicitudes", path: "/cliente/solicitudes" }, { label: "Mi perfil", path: "/cliente/perfil" }],
  proveedor: [{ label: "Panel", path: "/proveedor/inicio" }, { label: "Solicitudes", path: "/proveedor/solicitudes" }, { label: "Mi perfil", path: "/proveedor/perfil" }, { label: "Verificación", path: "/proveedor/documentos" }],
  admin: [{ label: "Dashboard", path: "/admin/inicio" }, { label: "Solicitudes", path: "/admin/solicitudes" }, { label: "Verificaciones", path: "/admin/verificaciones" }, { label: "Usuarios", path: "/admin/usuarios" }, { label: "Proveedores", path: "/admin/proveedores" }, { label: "Categorías", path: "/admin/categorias" }, { label: "Reportes", path: "/admin/reportes" }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const links = user ? roleLinks[user.role] || [] : publicLinks;
  const catalogPath = user?.role === "cliente" ? "/cliente/catalogo" : "/catalogo";
  const initials = String(user?.name || "SY").split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => { setMenuOpen(false); setServicesOpen(false); }, [location.pathname]);
  useEffect(() => {
    const close = (event) => { if (!event.target.closest("[data-services-menu]")) setServicesOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <header className="sy-nav">
      <nav aria-label="Navegación principal">
        <Link to={user ? `/${user.role}/inicio` : "/"} className="sy-brand" aria-label="ServicioYa ECU, ir al inicio"><span><Icon name="house-chimney-user" /></span><div><strong>ServicioYa</strong><small>ECU</small></div></Link>

        <button className="sy-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen}><Icon name={menuOpen ? "xmark" : "bars"} /><span>Menú</span></button>

        <div className={`sy-nav__panel ${menuOpen ? "is-open" : ""}`}>
          <div className="sy-nav__links">
            {(!user || user.role === "cliente") && <div className="sy-services-menu" data-services-menu><button type="button" onClick={() => setServicesOpen((open) => !open)} aria-expanded={servicesOpen}><Icon name="bars" /> Servicios <Icon name="chevron-right" /></button>{servicesOpen && <div className="sy-services-popover"><header><div><strong>Encuentra ayuda rápido</strong><small>Explora por tipo de trabajo</small></div><Link to={catalogPath}>Ver todo</Link></header><div>{quickServices.map(([icon, label, id]) => <Link key={id} to={`${catalogPath}?category=${id}`}><span><Icon name={icon} /></span>{label}<Icon name="chevron-right" /></Link>)}</div></div>}</div>}
            {links.map((link) => <Link key={link.path} to={link.path} className={location.pathname === link.path ? "is-active" : ""}>{link.label}</Link>)}
          </div>

          <div className="sy-nav__actions">
            {!user ? <><Link to="/login" className="sy-login">Ingresar</Link><Link to="/registro" className="sy-signup">Crear cuenta <Icon name="chevron-right" /></Link></> : <><NotificationBell /><Link to={`/${user.role}/perfil`} className="sy-user"><span>{user.profileImage ? <img src={getFileUrl(user.profileImage)} alt="" /> : initials}</span><div><strong>{user.name}</strong><small>{user.role}</small></div></Link><button className="sy-logout" onClick={() => { logout(); navigate("/"); }} aria-label="Cerrar sesión"><Icon name="right-from-bracket" /></button></>}
          </div>
        </div>
      </nav>
    </header>
  );
}
