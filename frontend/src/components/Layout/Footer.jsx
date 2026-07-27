import { Link } from "react-router-dom";
import { Icon } from "../UI/helpers";

export default function Footer() {
  return <footer className="sy-footer"><div className="sy-footer__main"><div className="sy-footer__brand"><span><Icon name="house-chimney-user" /></span><strong>ServicioYa <small>ECU</small></strong><p>Personas que necesitan ayuda. Personas que saben resolver. Una plataforma ecuatoriana para encontrarse con confianza.</p></div><div><h3>Para clientes</h3><Link to="/catalogo">Explorar servicios</Link><Link to="/registro">Crear una cuenta</Link><Link to="/ayuda">Cómo funciona</Link></div><div><h3>Para proveedores</h3><Link to="/registro">Ofrecer mis servicios</Link><Link to="/login">Gestionar solicitudes</Link><Link to="/ayuda">Proceso de verificación</Link></div><div><h3>Confianza</h3><p><Icon name="shield-halved" /> Perfiles revisados</p><p><Icon name="star" /> Opiniones visibles</p><p><Icon name="location-dot" /> Hecho para Ecuador</p></div></div><div className="sy-footer__bottom"><p>© 2026 ServicioYa ECU</p><p>Proyecto académico · Diseño centrado en las personas</p></div></footer>;
}
