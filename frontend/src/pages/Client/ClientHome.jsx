import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { Icon } from "../../components/UI/helpers";
import { getFileUrl } from "../../utils/files";

const CITIES = ["Quito", "Latacunga", "Ambato", "Pelileo", "Sangolquí", "Riobamba"];

export default function ClientHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("todos");

  useEffect(() => {
    api.get("/requests").then(({ data }) => setRequests(data)).catch(() => {});
    api.get("/providers").then(({ data }) => setFeatured(data.slice(0, 3))).catch(() => {}).finally(() => setFeaturedLoading(false));
  }, []);

  const runSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (city !== "todos") params.set("city", city);
    navigate(`/cliente/catalogo?${params}`);
  };
  const counts = { pending: requests.filter((item) => item.status === "Pendiente").length, active: requests.filter((item) => ["Confirmada", "En proceso"].includes(item.status)).length, complete: requests.filter((item) => item.status === "Completada").length };

  return <div className="client-command-page">
    <section className="client-welcome"><div><p>Tu espacio de cliente</p><h1>Hola, {user?.name?.split(" ")[0]}.<br /><em>¿Qué resolvemos hoy?</em></h1></div><form onSubmit={runSearch}><label>Busca por servicio</label><div className="client-search-row"><span><Icon name="magnifying-glass" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ej: necesito reparar una fuga" /></span><select value={city} onChange={(event) => setCity(event.target.value)} aria-label="Ciudad"><option value="todos">Cualquier ciudad</option>{CITIES.map((item) => <option key={item}>{item}</option>)}</select><button>Encontrar ayuda <Icon name="chevron-right" /></button></div></form></section>

    <section className="client-overview"><header><div><p>Tu actividad</p><h2>Todo bajo control.</h2></div><Link to="/cliente/solicitudes">Ver solicitudes <Icon name="chevron-right" /></Link></header><div className="client-stat-list"><article><span>01</span><strong>{requests.length}</strong><p>Solicitudes totales</p></article><article><span>02</span><strong>{counts.pending}</strong><p>Esperando respuesta</p></article><article><span>03</span><strong>{counts.active}</strong><p>Servicios activos</p></article><article><span>04</span><strong>{counts.complete}</strong><p>Trabajos completados</p></article></div></section>

    <section className="client-recommended"><header><div><p>Recomendados para ti</p><h2>Profesionales listos para ayudar.</h2></div><Link to="/cliente/catalogo">Explorar todos <Icon name="chevron-right" /></Link></header><div>{featuredLoading ? <p className="client-provider-state">Buscando opciones disponibles...</p> : featured.length ? featured.map((provider) => <article key={provider.id}><span className="client-provider-avatar">{provider.profileImage ? <img src={getFileUrl(provider.profileImage)} alt={`Foto de ${provider.name}`} /> : provider.name?.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div className="client-provider-main"><p>{provider.categoryName} · {provider.city}</p><h3>{provider.name}</h3><small>{provider.description}</small><div><span><Icon name="star" /> {provider.rating || "Nuevo"}</span>{provider.verified && <span><Icon name="shield-halved" /> Verificado</span>}</div></div><div className="client-provider-actions"><Link to={`/perfil/${provider.id}`}>Ver perfil</Link>{provider.available && <Link to={`/cliente/solicitar/${provider.id}`}>Solicitar <Icon name="chevron-right" /></Link>}</div></article>) : <p className="client-provider-state">No hay recomendaciones disponibles. Puedes explorar el catálogo completo.</p>}</div></section>
  </div>;
}
