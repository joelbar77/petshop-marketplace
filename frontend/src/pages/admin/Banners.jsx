import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import client, { API_URL } from "../../api/client";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", linkUrl: "" });
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    client.get("/banners", { params: { admin: true } }).then((res) => setBanners(res.data));
  }

  useEffect(load, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!image) {
      setError("La imagen es requerida");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      data.append("image", image);
      await client.post("/banners", data);
      setForm({ title: "", subtitle: "", linkUrl: "" });
      setImage(null);
      e.target.reset();
      load();
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo crear el banner");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(banner) {
    await client.put(`/banners/${banner.id}`, { active: !banner.active });
    load();
  }

  async function move(banner, direction) {
    const index = banners.findIndex((b) => b.id === banner.id);
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;
    const other = banners[target];
    await Promise.all([
      client.put(`/banners/${banner.id}`, { position: other.position }),
      client.put(`/banners/${other.id}`, { position: banner.position }),
    ]);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar este banner?")) return;
    await client.delete(`/banners/${id}`);
    load();
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Banners promocionales</h1>

      <form onSubmit={handleCreate} className="bg-white border rounded-xl p-5 mb-6 space-y-3 max-w-xl">
        <div>
          <label className="text-sm font-medium text-stone-700">Imagen (recomendado: ancha, tipo banner)</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="block mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Título (opcional)</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Subtítulo (opcional)</label>
          <input name="subtitle" value={form.subtitle} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium text-stone-700">Link al hacer clic (opcional)</label>
          <input name="linkUrl" value={form.linkUrl} onChange={handleChange} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 mt-1" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button disabled={saving} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700">
          {saving ? "Creando..." : "+ Agregar banner"}
        </button>
      </form>

      <div className="space-y-3">
        {banners.map((b, i) => (
          <div key={b.id} className="bg-white border rounded-xl p-3 flex items-center gap-4">
            <img src={`${API_URL}${b.imageUrl}`} className="w-24 h-16 object-cover rounded-lg border" />
            <div className="flex-1">
              <div className="font-medium text-stone-800">{b.title || "(sin título)"}</div>
              <div className="text-sm text-stone-500">{b.subtitle}</div>
              <button onClick={() => toggleActive(b)} className={`text-xs mt-1 ${b.active ? "text-green-600" : "text-stone-400"}`}>
                {b.active ? "Activo (clic para ocultar)" : "Oculto (clic para activar)"}
              </button>
            </div>
            <div className="flex gap-1">
              <button onClick={() => move(b, -1)} disabled={i === 0} className="px-2 py-1 text-sm border rounded disabled:opacity-30">↑</button>
              <button onClick={() => move(b, 1)} disabled={i === banners.length - 1} className="px-2 py-1 text-sm border rounded disabled:opacity-30">↓</button>
            </div>
            <button onClick={() => handleDelete(b.id)} className="text-red-500 text-sm hover:underline">Eliminar</button>
          </div>
        ))}
        {banners.length === 0 && <p className="text-stone-500">Todavía no hay banners cargados.</p>}
      </div>
    </AdminLayout>
  );
}
