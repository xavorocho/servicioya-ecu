import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { Icon } from "../components/UI/helpers";
import { getFileUrl } from "../utils/files";

const CATEGORIES = [
  ["plomeria", "Plomería", "wrench", "Fugas y tuberías"],
  ["electricidad", "Electricidad", "bolt", "Instalaciones y fallas"],
  ["limpieza", "Limpieza", "broom", "General o profunda"],
  ["pintura", "Pintura", "paint-roller", "Interiores y exteriores"],
  ["carpinteria", "Carpintería", "hammer", "Muebles y reparaciones"],
  ["jardineria", "Jardinería", "seedling", "Poda y mantenimiento"],
];
const CITIES = ["Quito", "Latacunga", "Ambato", "Pelileo", "Sangolquí", "Riobamba"];

function ProviderCard({ provider, index }) {
  const initials = provider.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <article className="sy-provider" style={{ "--delay": `${index * 70}ms` }}>
      <div className="sy-provider__top">
        <span className="sy-provider__avatar">{provider.profileImage ? <img src={getFileUrl(provider.profileImage)} alt={`Foto de ${provider.name}`} /> : initials}</span>
        <div>
          <div className="sy-provider__name"><h3>{provider.name}</h3>{provider.verified && <span><Icon name="shield-halved" /> Verificado</span>}</div>
          <p>{provider.categoryName} · {provider.city}</p>
        </div>
      </div>
      <p className="sy-provider__description">{provider.description}</p>
      <div className="sy-provider__facts">
        <span><Icon name="star" /> {provider.rating || "Nuevo"}</span>
        <span><Icon name="briefcase" /> {provider.experience || "Experiencia registrada"}</span>
        {provider.price && <span>Desde ${provider.price}/h</span>}
      </div>
      <div className="sy-provider__actions">
        <Link to={`/perfil/${provider.id}`}>Ver perfil <Icon name="chevron-right" /></Link>
        <Link to={`/perfil/${provider.id}`} className="sy-provider__request">Solicitar</Link>
      </div>
    </article>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("todos");
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    api.get("/providers").then(({ data }) => setFeatured(data.slice(0, 3))).catch(() => {}).finally(() => setFeaturedLoading(false));
  }, []);

  const search = (event) => {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city !== "todos") params.set("city", city);
    navigate(`/catalogo?${params}`);
  };

  return (
    <div className="sy-home">
      {/* THESIS: Red de barrio en movimiento. OWN-WORLD: interfaz de despacho confiable para hogares ecuatorianos. STORY: necesidad, búsqueda, comparación, solicitud. FIRST VIEWPORT: promesa humana más comando de búsqueda. FORM: panel de comando superpuesto y riel editorial. SEED: 6d52875a */}
      <section className="sy-hero" aria-labelledby="hero-title">
        <img src="/images/servicioya-hero-v2.png" alt="Cliente acompañando a un profesional mientras mejora su hogar" />
        <div className="sy-hero__shade" />
        <div className="sy-hero__copy">
          <p className="sy-kicker"><span /> Servicios confiables en Ecuador</p>
          <h1 id="hero-title">Lo necesitas.<br />Lo resolvemos <em>contigo.</em></h1>
          <p>Encuentra profesionales verificados cerca de ti y recupera el tiempo que tu hogar te está quitando.</p>
        </div>

        <form className="sy-command" onSubmit={search}>
          <div className="sy-command__intro"><span>01</span><p><strong>Cuéntanos qué necesitas</strong><small>Te mostramos las mejores opciones</small></p></div>
          <label><span>Servicio</span><div><Icon name="magnifying-glass" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Plomero, limpieza, electricista..." aria-label="Servicio que necesitas" /></div></label>
          <label><span>Ciudad</span><div><Icon name="location-dot" /><select value={city} onChange={(e) => setCity(e.target.value)} aria-label="Ciudad"><option value="todos">Todas las ciudades</option>{CITIES.map((item) => <option key={item}>{item}</option>)}</select></div></label>
          <button type="submit">Buscar ahora <Icon name="chevron-right" /></button>
        </form>
      </section>

      <section className="sy-trust" aria-label="Beneficios de ServicioYa">
        <p><strong>Más claridad.<br />Menos vueltas.</strong></p>
        <div><Icon name="shield-halved" /><span><strong>Documentos revisados</strong><small>Validación administrativa del perfil</small></span></div>
        <div><Icon name="star" /><span><strong>Opiniones visibles</strong><small>Compara experiencias publicadas</small></span></div>
        <div><Icon name="clipboard-list" /><span><strong>Seguimiento simple</strong><small>Tu solicitud siempre a la vista</small></span></div>
      </section>

      <section className="sy-services" aria-labelledby="services-title">
        <aside>
          <p className="sy-section-index">02 / EXPLORA</p>
          <h2 id="services-title">¿Qué quieres resolver hoy?</h2>
          <p>Entra por necesidad. Nosotros te acercamos a la persona indicada.</p>
          <Link to="/catalogo">Ver todos los servicios <Icon name="chevron-right" /></Link>
        </aside>
        <div className="sy-service-grid">
          {CATEGORIES.map(([id, name, icon, detail], index) => <Link key={id} to={`/catalogo?category=${id}`} className={index === 0 ? "is-featured" : ""}><span className="sy-service-grid__number">0{index + 1}</span><span className="sy-service-grid__icon"><Icon name={icon} /></span><strong>{name}</strong><small>{detail}</small><Icon name="chevron-right" className="sy-service-grid__arrow" /></Link>)}
        </div>
      </section>

      <section className="sy-flow" aria-labelledby="flow-title">
        <div><p className="sy-section-index">03 / ASÍ FUNCIONA</p><h2 id="flow-title">De pendiente a resuelto.</h2></div>
        <ol>
          <li><span>1</span><div><strong>Busca</strong><p>Servicio y ciudad, sin formularios eternos.</p></div></li>
          <li><span>2</span><div><strong>Compara</strong><p>Perfil, experiencia, precio y opiniones.</p></div></li>
          <li><span>3</span><div><strong>Solicita</strong><p>Envía los detalles y sigue cada avance.</p></div></li>
        </ol>
      </section>

      <section className="sy-featured" aria-labelledby="featured-title"><header><div><p className="sy-section-index">04 / CERCA DE TI</p><h2 id="featured-title">Profesionales para comparar con claridad.</h2></div><Link to="/catalogo">Explorar catálogo <Icon name="chevron-right" /></Link></header>{featuredLoading ? <div className="sy-provider-state" role="status">Buscando profesionales disponibles...</div> : featured.length > 0 ? <div className="sy-provider-grid">{featured.map((provider, index) => <ProviderCard key={provider.id} provider={provider} index={index} />)}</div> : <div className="sy-provider-state">Aún no hay recomendaciones para mostrar. <Link to="/catalogo">Explora el catálogo completo</Link>.</div>}</section>

      <section className="sy-provider-cta"><div><p>¿Tienes un oficio que mueve hogares?</p><h2>Convierte tu experiencia en nuevas oportunidades.</h2></div><div><p>Crea tu perfil, verifica tu trabajo y recibe solicitudes de clientes en tu ciudad.</p><Link to="/registro">Quiero ofrecer mis servicios <Icon name="chevron-right" /></Link></div></section>
    </div>
  );
}
