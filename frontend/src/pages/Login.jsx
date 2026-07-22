import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/UI/Toast";
import { Icon } from "../components/UI/helpers";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      showToast(`Bienvenido, ${user.name}.`);
      navigate(`/${user.role}/inicio`);
    } catch (err) {
      showToast(err.response?.data?.error || "Error al iniciar sesión", "error");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (email) => {
    setLoading(true);
    try {
      const user = await login(email, "123456");
      showToast(`Sesión iniciada como ${user.role}.`);
      navigate(`/${user.role}/inicio`);
    } catch (err) {
      showToast("Error al iniciar sesión demo", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xl mx-auto mb-4">
            <Icon name="house-chimney-user" />
          </span>
          <h1 className="text-xl font-extrabold text-gray-900">ServicioYa ECU</h1>
          <p className="text-sm text-gray-500 mt-1">Usa una cuenta demo o tus datos registrados.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "Cliente demo", email: "cliente@demo.com", icon: "user" },
            { label: "Proveedor demo", email: "proveedor@demo.com", icon: "toolbox" },
            { label: "Admin demo", email: "admin@demo.com", icon: "user-shield" },
          ].map((d) => (
            <button key={d.email} type="button" disabled={loading}
              onClick={() => demoLogin(d.email)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              <Icon name={d.icon} className="text-blue-600 text-lg" />
              <strong className="text-[0.65rem] text-gray-800">{d.label}</strong>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1"><Icon name="envelope" className="mr-1.5" />Correo electrónico</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1"><Icon name="lock" className="mr-1.5" />Contraseña</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tu contraseña" className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-full">
            {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <><Icon name="right-to-bracket" /> Ingresar</>}
          </button>
          <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 font-semibold">
            <Icon name="circle-info" className="mt-0.5 flex-shrink-0" />
            <span>Cuentas demo: <strong>cliente@demo.com</strong>, <strong>proveedor@demo.com</strong> y <strong>admin@demo.com</strong>. Contraseña: <strong>123456</strong>.</span>
          </p>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          ¿No tienes cuenta? <Link to="/registro" className="text-blue-600 font-bold hover:underline">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
