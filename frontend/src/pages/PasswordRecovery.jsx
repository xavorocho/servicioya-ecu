import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { Icon } from "../components/UI/helpers";

export default function PasswordRecovery({ reset = false }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      if (reset) {
        if (password !== confirm) throw new Error("Las contraseñas no coinciden");
        const { data } = await api.post("/auth/reset-password", { email, token: params.get("token"), password });
        setMessage(data.message); setTimeout(() => navigate("/login"), 1800);
      } else {
        const { data } = await api.post("/auth/forgot-password", { email });
        setMessage(data.message);
      }
    } catch (err) { setError(err.response?.data?.error || err.message || "No se pudo completar la operación"); }
    finally { setLoading(false); }
  };

  return <div className="max-w-md mx-auto px-4 py-12"><div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
    <div className="text-center mb-6"><Icon name="key" className="text-3xl text-blue-600 mb-3" /><h1 className="text-xl font-extrabold">{reset ? "Crear nueva contraseña" : "Recuperar contraseña"}</h1><p className="text-sm text-gray-500 mt-2">{reset ? "Usa al menos 8 caracteres, una letra y un número." : "Te enviaremos un enlace válido durante 30 minutos."}</p></div>
    <form onSubmit={submit} className="space-y-4"><div><label className="block text-sm font-semibold mb-1">Correo electrónico</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 px-3.5 rounded-lg border border-gray-200" /></div>
      {reset && <><div><label className="block text-sm font-semibold mb-1">Nueva contraseña</label><input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-11 px-3.5 rounded-lg border border-gray-200" /></div><div><label className="block text-sm font-semibold mb-1">Confirmar contraseña</label><input type="password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full h-11 px-3.5 rounded-lg border border-gray-200" /></div></>}
      {message && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">{message}</p>}{error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">{error}</p>}
      <button disabled={loading} className="btn btn-primary btn-full">{loading ? "Procesando..." : (reset ? "Actualizar contraseña" : "Enviar enlace")}</button>
    </form><p className="text-center mt-5 text-sm"><Link to="/login" className="text-blue-600 font-bold">Volver al inicio de sesión</Link></p>
  </div></div>;
}
