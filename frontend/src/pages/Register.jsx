import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/UI/Toast";
import { Icon } from "../components/UI/helpers";
import { GoogleLogin } from "@react-oauth/google";

const CATEGORIES = [
  { id: "plomeria", name: "Plomería" }, { id: "electricidad", name: "Electricidad" },
  { id: "limpieza", name: "Limpieza" }, { id: "pintura", name: "Pintura" },
  { id: "carpinteria", name: "Carpintería" }, { id: "jardineria", name: "Jardinería" },
  { id: "electrodomesticos", name: "Electrodomésticos" }, { id: "mudanzas", name: "Mudanzas" },
  { id: "cerrajeria", name: "Cerrajería" }, { id: "cuidado", name: "Cuidado del hogar" },
  { id: "otra", name: "Otra especialidad" },
];

const CITIES = [
  "Quito", "Guayaquil", "Cuenca", "Santo Domingo", "Machala", "Manta", "Portoviejo",
  "Loja", "Ambato", "Riobamba", "Latacunga", "Ibarra", "Esmeraldas", "Tulcán",
  "Puyo", "Tena", "Nueva Loja", "Babahoyo", "Quevedo", "Milagro", "Salinas",
  "Santa Elena", "Sangolquí", "Pelileo", "Baños", "Otavalo",
];

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("cliente");
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", password: "", confirm: "" });
  const [provider, setProvider] = useState({ category: "", sector: "", experience: "", price: "", description: "", customCategory: "" });
  const [files, setFiles] = useState({ docCedula: null, docAntecedentes: null, docOficio: null, docRuc: null, profileImage: null, verificationFrontImage: null, verificationSideImage: null });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      if (!termsAccepted) throw new Error("TERMS_REQUIRED");
      const user = await googleLogin(credentialResponse.credential, { role, termsAccepted: true });
      showToast(`Bienvenido, ${user.name}.`);
      navigate(user.requiresProviderProfile ? "/proveedor/perfil" : `/${user.role}/inicio`);
    } catch (err) {
      showToast(err.message === "TERMS_REQUIRED" ? "Acepta los términos antes de continuar" : (err.response?.data?.error || "Error al autenticar con Google"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return showToast("Las contraseñas no coinciden.", "error");
    if (role === "proveedor") {
      const requiredFiles = ["docCedula", "docAntecedentes", "docOficio", "profileImage", "verificationFrontImage", "verificationSideImage"];
      const missing = requiredFiles.filter((key) => !files[key]);
      if (missing.length) return showToast("Selecciona los tres documentos y las tres fotografías obligatorias", "error");
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries({ name: form.name, email: form.email, password: form.password, role, phone: form.phone, city: form.city, termsAccepted: true }).forEach(([key, value]) => fd.append(key, value));
      if (role === "proveedor") {
        Object.entries(provider).forEach(([key, value]) => fd.append(key, value));
        fd.append("categoryName", CATEGORIES.find((item) => item.id === provider.category)?.name || provider.customCategory);
        Object.entries(files).forEach(([key, value]) => { if (value) fd.append(key, value); });
      }
      const data = await register(fd);
      localStorage.setItem("pendingVerificationEmail", form.email);
      if (data.hint) localStorage.setItem("pendingVerificationHint", data.hint);
      showToast(data.deliveryMode === "development" ? "Cuenta creada. Usa el código mostrado en pantalla." : "Cuenta creada. Verifica tu correo electrónico.");
      navigate("/verificar-email?email=" + encodeURIComponent(form.email));
    } catch (err) {
      showToast(err.response?.data?.error || "Error al registrarse", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xl mx-auto mb-4"><Icon name="user-plus" /></span>
          <h1 className="text-xl font-extrabold text-gray-900">ServicioYa ECU</h1>
          <p className="text-sm text-gray-500 mt-1">Selecciona el tipo de cuenta que deseas crear.</p>
        </div>

        <div className="flex justify-center mb-5">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast("Error al iniciar sesión con Google", "error")}
              text="signup_with"
              shape="rectangular"
              width="100%"
            />
          ) : (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 text-center font-medium w-full">
              Google OAuth no configurado. Agrega <code>VITE_GOOGLE_CLIENT_ID</code> en .env.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {[{ r: "cliente", i: "user", t: "Soy cliente", d: "Necesito contratar servicios" }, { r: "proveedor", i: "toolbox", t: "Soy proveedor", d: "Quiero ofrecer mis servicios" }].map((opt) => (
            <button key={opt.r} type="button" onClick={() => setRole(opt.r)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${role === opt.r ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
              <Icon name={opt.i} className={`text-2xl mb-2 ${role === opt.r ? "text-blue-600" : "text-gray-400"}`} />
              <strong className="block text-sm text-gray-900">{opt.t}</strong>
              <span className="text-xs text-gray-500">{opt.d}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900"><Icon name="id-card" className="text-blue-600" /> Datos de acceso</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[{ n: "name", l: "Nombre completo", t: "text", p: "Ej: Justin Medina" }, { n: "email", l: "Correo electrónico", t: "email", p: "correo@ejemplo.com" }, { n: "phone", l: "Teléfono", t: "tel", p: "09XXXXXXXX" }, { n: "city", l: "Ciudad", t: "select", opts: CITIES }, { n: "password", l: "Contraseña", t: "password", p: "Mínimo 6 caracteres" }, { n: "confirm", l: "Confirmar contraseña", t: "password", p: "Repite la contraseña" }].map((f) => (
                <div key={f.n}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">{f.l}</label>
                  {f.t === "select" ? (
                    <select value={form[f.n]} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
                      <option value="">Selecciona</option>
                      {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.t} value={form[f.n]} onChange={(e) => setForm({ ...form, [f.n]: e.target.value })} placeholder={f.p} minLength={f.n === "password" || f.n === "confirm" ? 6 : undefined} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {role === "proveedor" && (
            <>
              <section className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900"><Icon name="briefcase" className="text-blue-600" /> Datos profesionales</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Especialidad principal</label>
                    <select value={provider.category} onChange={(e) => setProvider({ ...provider, category: e.target.value })} required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
                      <option value="">Selecciona una especialidad</option>
                      {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {provider.category === "otra" && (
                    <div className="sm:col-span-2">
                      <input type="text" value={provider.customCategory || ""} onChange={(e) => setProvider({ ...provider, customCategory: e.target.value })} placeholder="Escribe tu especialidad (ej: Reparación de piscinas)" required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                    </div>
                  )}
                  <input type="text" value={provider.sector} onChange={(e) => setProvider({ ...provider, sector: e.target.value })} placeholder="Sector o zona de cobertura" required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={provider.experience} onChange={(e) => setProvider({ ...provider, experience: e.target.value })} placeholder="Años de exp." min="0" required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                    <input type="number" value={provider.price} onChange={(e) => setProvider({ ...provider, price: e.target.value })} placeholder="Precio $/h" min="1" required className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  </div>
                  <div className="sm:col-span-2">
                    <textarea value={provider.description} onChange={(e) => setProvider({ ...provider, description: e.target.value })} rows={3} placeholder="Describe qué servicios ofreces y tu experiencia." required className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-y" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                  {[{ n: "profileImage", l: "Foto de perfil" }, { n: "verificationFrontImage", l: "Foto frontal" }, { n: "verificationSideImage", l: "Foto lateral" }].map((f) => (
                    <div key={f.n}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{f.l}</label>
                      <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setFiles((current) => ({ ...current, [f.n]: e.target.files[0] }))} required className="w-full text-xs text-gray-500 file:mb-1 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900"><Icon name="file-shield" className="text-blue-600" /> Documentos para validación</h3>
                <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 font-semibold">
                  <Icon name="circle-info" className="mt-0.5 flex-shrink-0" />
                  <span>Serán revisados por un administrador antes de aprobar el perfil.</span>
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[{ n: "docCedula", l: "Copia de cédula" }, { n: "docAntecedentes", l: "Certificado de no antecedentes" }, { n: "docOficio", l: "Certificado de experiencia" }, { n: "docRuc", l: "RUC/RIMPE (opcional)" }].map((f) => (
                    <div key={f.n}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{f.l}</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFiles((current) => ({ ...current, [f.n]: e.target.files[0] }))} required={f.n !== "docRuc"} className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all" />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          <label className="flex items-start gap-2.5 text-xs text-gray-500 font-medium">
            <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600" />
            <span>Acepto los <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 font-bold hover:underline">términos de uso y tratamiento de datos</button> para la validación de la cuenta.</span>
          </label>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Icon name="user-plus" /> Crear cuenta</>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Inicia sesión</Link>
        </p>
      </div>
      {showTerms && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-lg max-h-[80vh] overflow-y-auto p-6 shadow-xl">
            <h2 className="text-lg font-extrabold mb-3">Términos de uso y privacidad</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>ServicioYa ECU conecta clientes con proveedores independientes. Cada parte conserva sus obligaciones profesionales y legales.</p>
              <p>Los datos de contacto, ubicación e identificación se utilizan para operar la cuenta, gestionar solicitudes, prevenir fraude y verificar proveedores.</p>
              <p>Los documentos de validación son privados y solo pueden ser revisados por administradores autorizados. Puedes solicitar la corrección o eliminación de tus datos conforme a la normativa ecuatoriana.</p>
              <p>Al aceptar confirmas que la información es verdadera y autorizas su tratamiento para estas finalidades. Versión: 23-07-2026.</p>
            </div>
            <button type="button" onClick={() => setShowTerms(false)} className="btn btn-primary btn-full mt-5">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
