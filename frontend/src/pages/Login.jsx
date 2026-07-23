import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/UI/Toast";
import { Icon } from "../components/UI/helpers";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState("");
  const [googleRole, setGoogleRole] = useState("cliente");
  const [googleTerms, setGoogleTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      showToast(`Bienvenido, ${user.name}.`);
      navigate(`/${user.role}/inicio`);
    } catch (err) {
      if (err.response?.data?.requiresVerification) {
        localStorage.setItem("pendingVerificationEmail", err.response.data.email);
        showToast("Debes verificar tu correo electrónico", "error");
        navigate("/verificar-email?email=" + encodeURIComponent(err.response.data.email));
      } else {
        showToast(err.response?.data?.error || "Error al iniciar sesión", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      showToast(`Bienvenido, ${user.name}.`);
      navigate(`/${user.role}/inicio`);
    } catch (err) {
      if (err.response?.data?.requiresRoleSelection) {
        setPendingGoogleCredential(credentialResponse.credential);
        showToast("Selecciona el tipo de cuenta para completar tu registro");
      } else {
        showToast(err.response?.data?.error || "Error al autenticar con Google", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const completeGoogleRegistration = async () => {
    if (!googleTerms) return showToast("Debes aceptar los términos de uso", "error");
    setLoading(true);
    try {
      const user = await googleLogin(pendingGoogleCredential, { role: googleRole, termsAccepted: true });
      setPendingGoogleCredential("");
      showToast(`Cuenta creada. Bienvenido, ${user.name}.`);
      navigate(user.requiresProviderProfile ? "/proveedor/perfil" : `/${user.role}/inicio`);
    } catch (err) {
      showToast(err.response?.data?.error || "No se pudo completar el registro con Google", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xl mx-auto mb-4">
            <Icon name="house-chimney-user" />
          </span>
          <h1 className="text-xl font-extrabold text-gray-900">ServicioYa ECU</h1>
          <p className="text-sm text-gray-500 mt-1">Inicia sesión con Google o con tu cuenta registrada.</p>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-gray-400 font-semibold">O continúa con</span></div>
        </div>

        <div className="flex justify-center mb-5">
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast("Error al iniciar sesión con Google", "error")}
              text="continue_with"
              shape="rectangular"
              width="100%"
            />
          ) : (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 text-center font-medium">
              Google OAuth no configurado. Agrega <code>VITE_GOOGLE_CLIENT_ID</code> en .env.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1"><Icon name="envelope" className="mr-1.5" />Correo electrónico</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1"><Icon name="lock" className="mr-1.5" />Contraseña</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tu contraseña" className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
            <div className="text-right mt-1"><Link to="/recuperar-contrasena" className="text-xs text-blue-600 font-semibold hover:underline">¿Olvidaste tu contraseña?</Link></div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Icon name="right-to-bracket" /> Ingresar</>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          ¿No tienes cuenta? <Link to="/registro" className="text-blue-600 font-bold hover:underline">Regístrate aquí</Link>
        </p>
      </div>
      {pendingGoogleCredential && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"><h2 className="text-lg font-extrabold text-gray-900">Completa tu registro con Google</h2><p className="text-sm text-gray-500 mt-1 mb-5">Selecciona cómo utilizarás ServicioYa ECU.</p><div className="grid grid-cols-2 gap-3 mb-5">{[{ role: "cliente", label: "Soy cliente", icon: "user" }, { role: "proveedor", label: "Soy proveedor", icon: "toolbox" }].map((option) => <button key={option.role} type="button" onClick={() => setGoogleRole(option.role)} className={`p-4 rounded-xl border-2 font-bold text-sm ${googleRole === option.role ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"}`}><Icon name={option.icon} className="block text-xl mb-2 mx-auto" />{option.label}</button>)}</div><label className="flex items-start gap-2 text-xs text-gray-600 mb-5"><input type="checkbox" checked={googleTerms} onChange={(event) => setGoogleTerms(event.target.checked)} className="mt-0.5 accent-blue-600" /><span>Acepto los términos de uso y el tratamiento de datos.</span></label><div className="flex gap-3"><button type="button" onClick={completeGoogleRegistration} disabled={loading || !googleTerms} className="btn btn-primary flex-1">{loading ? "Procesando..." : "Crear cuenta"}</button><button type="button" onClick={() => setPendingGoogleCredential("")} className="btn btn-outline">Cancelar</button></div>{googleRole === "proveedor" && <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg mt-4">Después deberás completar tus datos profesionales y documentos de validación.</p>}</div></div>}
    </div>
  );
}
