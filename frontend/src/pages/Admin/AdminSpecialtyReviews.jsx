import { useState, useEffect } from "react";
import api from "../../api/client";
import { useToast } from "../../components/UI/Toast";
import { Icon, Breadcrumb } from "../../components/UI/helpers";

const STATUS_STYLES = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobada: "bg-green-100 text-green-700",
  asociada: "bg-blue-100 text-blue-700",
  rechazada: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  asociada: "Asociada",
  rechazada: "Rechazada",
};

export default function AdminSpecialtyReviews() {
  const { showToast } = useToast();
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("pendiente");
  const [showAssociate, setShowAssociate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const load = async () => {
    try {
      const [specRes, catRes] = await Promise.all([
        api.get("/specialties/pending"),
        api.get("/categories"),
      ]);
      setSpecialties(specRes.data);
      setCategories(catRes.data);
    } catch {
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    if (!confirm("¿Aprovar esta especialidad y crear una nueva categoría?")) return;
    try {
      await api.put(`/specialties/${id}/approve`);
      showToast("Especialidad aprobada y categoría creada");
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al aprobar", "error");
    }
  };

  const handleAssociate = async (id) => {
    if (!selectedCategory) return showToast("Selecciona una categoría", "error");
    try {
      await api.put(`/specialties/${id}/associate`, { categoryId: selectedCategory });
      showToast("Especialidad asociada exitosamente");
      setShowAssociate(null);
      setSelectedCategory("");
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al asociar", "error");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Motivo de rechazo (opcional):");
    if (reason === null) return;
    try {
      await api.put(`/specialties/${id}/reject`, { reason });
      showToast("Especialidad rechazada");
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al rechazar", "error");
    }
  };

  const filtered = specialties.filter((s) => filter === "todos" || s.status === filter);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Icon name="spinner" /> Cargando especialidades...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin/inicio" }, { label: "Especialidades" }]} />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Revisión de especialidades personalizadas</h1>
        <p className="text-gray-500 mt-1">Aprueba, asocia o rechaza especialidades reportadas por proveedores.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["pendiente", "aprobada", "asociada", "rechazada", "todos"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "todos" ? "Todos" : STATUS_LABELS[f]}
            {f === "pendiente" && (
              <span className="ml-1.5 bg-yellow-400 text-yellow-900 text-xs px-1.5 rounded-full">
                {specialties.filter((s) => s.status === "pendiente").length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((spec) => (
          <article key={spec.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 text-xl shrink-0">
                <Icon name="star" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <strong className="text-sm font-bold text-gray-900">{spec.specialtyName}</strong>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[spec.status]}`}>
                    {STATUS_LABELS[spec.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Proveedor: {spec.providerName} ({spec.providerEmail}) — {new Date(spec.createdAt).toLocaleDateString("es-EC")}
                </p>
                {spec.adminNote && (
                  <p className="text-xs text-red-500 mt-1 italic">Motivo: {spec.adminNote}</p>
                )}
              </div>

              {spec.status === "pendiente" && (
                <div className="flex gap-2 shrink-0 flex-wrap">
                  <button onClick={() => handleApprove(spec.id)} className="btn btn-primary btn-small">
                    <Icon name="check" /> Aprobar
                  </button>
                  <button onClick={() => setShowAssociate(spec.id)} className="btn btn-outline btn-small">
                    <Icon name="link" /> Asociar
                  </button>
                  <button onClick={() => handleReject(spec.id)} className="btn btn-outline btn-small text-red-500 hover:bg-red-50">
                    <Icon name="xmark" /> Rechazar
                  </button>
                </div>
              )}
            </div>

            {showAssociate === spec.id && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Asociar a categoría existente:</p>
                <div className="flex gap-2 items-end flex-wrap">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button onClick={() => handleAssociate(spec.id)} className="btn btn-primary btn-small">
                    <Icon name="check" /> Confirmar
                  </button>
                  <button onClick={() => { setShowAssociate(null); setSelectedCategory(""); }} className="btn btn-outline btn-small">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <Icon name="star" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No hay especialidades con filtro "{STATUS_LABELS[filter] || filter}".</p>
        </div>
      )}
    </div>
  );
}
