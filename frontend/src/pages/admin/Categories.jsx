import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import client, { API_URL } from "../../api/client";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    client.get("/categories").then((res) => setCategories(res.data));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      data.append("name", name);
      if (image) data.append("image", image);
      await client.post("/categories", data);
      setName("");
      setImage(null);
      e.target.reset();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear la categoría");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await client.delete(`/categories/${id}`);
      load();
    } catch {
      alert("No se pudo eliminar: revisá que no tenga productos asociados.");
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Categorías</h1>

      <form onSubmit={handleCreate} className="bg-white border rounded-xl p-5 mb-6 flex items-end gap-4 flex-wrap">
        <div>
          <label className="text-sm font-medium text-stone-700">Nombre de la categoría</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-3 py-2 mt-1 block"
            placeholder="Ej: Alimento para aves"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Imagen (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="border rounded-lg px-3 py-2 mt-1 block"
          />
        </div>
        <button
          disabled={saving}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700"
        >
          {saving ? "Creando..." : "+ Agregar"}
        </button>
        {error && <p className="text-red-500 text-sm w-full">{error}</p>}
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white border rounded-xl overflow-hidden">
            <div className="aspect-video bg-stone-100 flex items-center justify-center">
              {c.imageUrl ? (
                <img src={`${API_URL}${c.imageUrl}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🐾</span>
              )}
            </div>
            <div className="p-3 flex justify-between items-center">
              <div>
                <div className="font-medium text-stone-800">{c.name}</div>
                <div className="text-xs text-stone-500">{c._count?.products ?? 0} productos</div>
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-red-500 text-sm hover:underline">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
