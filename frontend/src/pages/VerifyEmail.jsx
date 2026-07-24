import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { Icon } from "../components/UI/helpers";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get("email") || localStorage.getItem("pendingVerificationEmail") || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(localStorage.getItem("pendingVerificationHint") || "");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-email", { email, code });
      setSuccess("Correo verificado correctamente. Redirigiendo...");
      localStorage.removeItem("pendingVerificationEmail");
      localStorage.removeItem("pendingVerificationHint");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al verificar");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { data } = await api.post("/auth/resend-verification", { email });
      if (data.pendingAdminVerification) {
        setHint("");
        setSuccess("El correo no está disponible. Solicita a un administrador que verifique tu cuenta desde el panel de Usuarios.");
        return;
      }
      setHint(data.hint || "");
      if (data.hint) localStorage.setItem("pendingVerificationHint", data.hint);
      setSuccess(data.deliveryMode === "development" ? "Código local generado" : "Código enviado a tu correo");
    } catch (err) {
      setError(err.response?.data?.error || "Error al reenviar");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="envelope" className="text-blue-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Verifica tu correo</h1>
          <p className="text-gray-500 mt-2 text-sm">Ingresa el código de 6 dígitos para activar tu cuenta</p>
        </div>

        {hint && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm font-bold text-amber-800">Código de verificación:</p>
            <p className="text-2xl font-mono font-bold text-amber-600 text-center mt-1">{hint}</p>
            <p className="text-xs text-amber-600 mt-1">Modo local: el servicio de correo todavía no está configurado.</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Código de verificación</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required maxLength={6}
              placeholder="000000"
              className="w-full h-11 px-3.5 rounded-lg border border-gray-200 text-sm text-center text-2xl font-mono tracking-[0.5em] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
          </div>

          {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
          {success && <p className="text-green-600 text-sm font-semibold">{success}</p>}

          <button type="submit" disabled={loading || !code || code.length < 6}
            className="w-full h-11 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
            {loading ? "Verificando..." : "Verificar correo"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={handleResend} className="text-sm text-blue-600 hover:underline font-semibold">
            Reenviar código
          </button>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:underline">
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}
