import { useState, useEffect } from "react";
import api from "../../api/client";
import { useToast } from "../../components/UI/Toast";
import { Icon, Breadcrumb } from "../../components/UI/helpers";

const ICON_OPTIONS = [
  "wrench", "bolt", "broom", "paint-roller", "hammer", "seedling",
  "plug", "truck", "key", "house-user", "fan", "shower", "lock",
  "car", "heart-pulse", "dog", "baby", "building", "laptop", "camera",
];

export default function AdminCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "wrench", active: true });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data);
    } catch (err) {
      showToast("Error al cargar categorías", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", icon: "wrench", active: true });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", icon: cat.icon || "wrench", active: cat.active !== false });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast("El nombre es requerido", "error");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
        showToast("Categoría actualizada");
      } else {
        await api.post("/categories", form);
        showToast("Categoría creada");
      }
      setShowForm(false);
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cat) => {
    try {
      await api.put(`/categories/${cat.id}`, { active: !cat.active });
      showToast(cat.active ? "Categoría desactivada" : "Categoría activada");
      await load();
    } catch (err) {
      showToast("Error al cambiar estado", "error");
    }
  };

  const deleteCategory = async (cat) => {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      showToast("Categoría eliminada");
      await load();
    } catch (err) {
      showToast(err.response?.data?.error || "Error al eliminar", "error");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Icon name="spinner" /> Cargando categorías...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Breadcrumb items={[{ label: "Dashboard", href: "/admin/inicio" }, { label: "Categorías" }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Categorías de servicios</h1>
          <p className="text-gray-500 mt-1">Gestiona el catálogo de servicios de la plataforma.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Icon name="plus" /> Nueva categoría
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editing ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Plomería"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Descripción breve de la categoría"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ícono</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setForm({ ...form, icon: ic })}
                    className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-colors ${
                      form.icon === ic
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Icon name={ic} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded border-gray-300 text-blue-600"
              />
              <label className="text-sm font-semibold text-gray-700">Activa</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Guardando..." : editing ? "Actualizar" : "Crear"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <article
            key={cat.id}
            className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-lg transition-shadow flex flex-col items-center text-center gap-3 ${
              cat.active ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}
          >
            <span className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
              <Icon name={cat.icon || "wrench"} />
            </span>
            <strong className="block text-sm font-bold text-gray-900">{cat.name}</strong>
            {cat.description && (
              <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              cat.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {cat.active ? "Activa" : "Inactiva"}
            </span>
            <div className="flex gap-1.5 mt-1">
              <button onClick={() => openEdit(cat)} className="btn btn-outline btn-small">
                <Icon name="pencil" /> Editar
              </button>
              <button onClick={() => toggleActive(cat)} className="btn btn-outline btn-small">
                <Icon name={cat.active ? "eye-slash" : "eye"} />
              </button>
              <button onClick={() => deleteCategory(cat)} className="btn btn-outline btn-small text-red-500 hover:bg-red-50">
                <Icon name="trash" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
          <Icon name="tags" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No hay categorías creadas.</p>
        </div>
      )}
    </div>
  );
}
