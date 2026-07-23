import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/UI/Toast";
import api from "../../api/client";
import { Icon, Breadcrumb } from "../../components/UI/helpers";
import { getFileUrl } from "../../utils/files";

export default function ProviderDocuments() {
  const { user, updateUser } = useAuth();
  const showToast = useToast();
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    api.get("/providers/me").then(({ data }) => setProvider(data));
  }, []);

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append(field, file);
    try {
      const { data } = await api.put("/providers/me/files", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setProvider(data);
      showToast("Documento subido correctamente.");
    } catch (err) {
      showToast(err.response?.data?.error || "Error", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Panel del proveedor" }, { label: "Verificación" }]} />
      <h1 className="text-2xl font-extrabold text-gray-900">Verificación del proveedor</h1>
      <p className="text-gray-500 mt-1 mb-6">Documentos enviados para generar confianza y permitir la aprobación del perfil.</p>

      <div className="grid sm:grid-cols-2 gap-5">
        <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Estado de revisión</h2>
          <p className="text-sm mb-2">Estado actual: <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${provider?.status === "Aprobado" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : provider?.status === "Pendiente" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>{provider?.status}</span></p>
          {provider?.status === "Pendiente" && (
            <p className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 font-semibold">
              <Icon name="circle-info" className="mt-0.5 flex-shrink-0" />
              <span>Tu perfil está en revisión por un administrador. Cuando sea aprobado, aparecerá en el catálogo de clientes.</span>
            </p>
          )}
          {provider?.status === "Aprobado" && (
            <p className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3 font-semibold">Tu perfil fue aprobado y ya puede mostrarse en el catálogo.</p>
          )}
          {provider?.status === "Rechazada" && (
            <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 font-semibold">Tu perfil fue rechazado. Revisa la documentación y vuelve a enviarla.</p>
          )}
          <ul className="space-y-2 text-sm mt-4 font-semibold text-gray-700">
            <li className="flex items-center gap-2"><Icon name="id-card" className="text-blue-600" /> Documento de identidad.</li>
            <li className="flex items-center gap-2"><Icon name="file-shield" className="text-blue-600" /> Certificado de no tener antecedentes penales.</li>
            <li className="flex items-center gap-2"><Icon name="star" className="text-blue-600" /> Experiencia o referencias.</li>
            <li className="flex items-center gap-2"><Icon name="tags" className="text-blue-600" /> Documento tributario opcional.</li>
          </ul>
        </section>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-5">
        <h2 className="font-bold text-gray-900 mb-4">Fotos del perfil</h2>
        <p className="text-sm text-gray-500 mb-4">Sube una foto frontal y una lateral para verificación de identidad.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Foto frontal</label>
            <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative">
              {provider?.verificationFrontImage ? (
                <img src={getFileUrl(provider.verificationFrontImage)} alt="Frontal" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <Icon name="camera" className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">Sin foto</span>
                </div>
              )}
            </div>
            <label className="mt-2 btn btn-outline btn-small w-full justify-center cursor-pointer">
              <Icon name="upload" /> Subir frontal
              <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleUpload(e, "verificationFrontImage")} className="hidden" />
            </label>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block">Foto lateral</label>
            <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative">
              {provider?.verificationSideImage ? (
                <img src={getFileUrl(provider.verificationSideImage)} alt="Lateral" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <Icon name="camera" className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">Sin foto</span>
                </div>
              )}
            </div>
            <label className="mt-2 btn btn-outline btn-small w-full justify-center cursor-pointer">
              <Icon name="upload" /> Subir lateral
              <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => handleUpload(e, "verificationSideImage")} className="hidden" />
            </label>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mt-5">
        <h2 className="font-bold text-gray-900 mb-4">Documentos registrados</h2>
          {
            [
              { label: "Copia de cédula", value: provider?.documents?.cedula, field: "docCedula" },
              { label: "Certificado de no antecedentes", value: provider?.documents?.antecedentes, field: "docAntecedentes" },
              { label: "Experiencia o referencias", value: provider?.documents?.oficio, field: "docOficio" },
              { label: "RUC/RIMPE opcional", value: provider?.documents?.ruc, field: "docRuc" },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-4 mb-4 p-3 rounded-lg border border-gray-200 bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0"><Icon name="file-pdf" /></div>
                <div className="min-w-0 flex-1"><strong className="block text-sm font-semibold text-gray-900">{d.label}</strong><small className="text-xs text-gray-500">{d.value || "No adjuntado"}</small></div>
                {d.value && d.value !== "No adjuntado" && (
                  <a href={getFileUrl(d.value)} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm font-semibold">Ver archivo</a>
                )}
                <label className="text-blue-600 text-sm font-semibold cursor-pointer">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleUpload(e, d.field)} className="hidden" />
                  Cambiar
                </label>
              </div>
            ))
          }
        </section>
    </div>
  );
}
