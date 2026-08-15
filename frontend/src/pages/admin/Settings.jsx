import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import client, { API_URL } from "../../api/client";
import { useSettings } from "../../context/SettingsContext.jsx";

const SECTION_LABELS = {
  hero: "Banner principal (título + buscador)",
  banners: "Banners promocionales",
  categories: "Categorías",
  products: "Grilla de productos",
};

export default function AdminSettings() {
  const { settings, reload } = useSettings();
  const [form, setForm] = useState(null);
  const [logo, setLogo] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      businessName: settings.businessName,
      primaryColor: settings.primaryColor,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
    });
    setSections(
      (settings.sectionsOrder || "hero,banners,categories,products")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "categories") // categories y products se mueven juntas
    );
  }, [settings]);

  if (!form) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function moveSection(index, direction) {
    const newSections = [...sections];
    const target = index + direction;
    if (target < 0 || target >= newSections.length) return;
    [newSections[index], newSections[target]] = [newSections[target], newSections[index]];
    setSections(newSections);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      // reinsertamos "categories" pegado a "products" para mantener el bloque unido
      const fullOrder = sections.flatMap((s) => (s === "products" ? ["categories", "products"] : [s]));
      data.append("sectionsOrder", fullOrder.join(","));
      if (logo) data.append("logo", logo);
      if (heroImage) data.append("heroImage", heroImage);

      await client.put("/settings", data);
      await reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Apariencia del sitio</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 max-w-2xl space-y-5">
        <div>
          <label className="text-sm font-medium text-stone-700">Nombre del negocio</label>
          <input
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Logo</label>
          <div className="flex items-center gap-3 mt-1">
            {settings.logoUrl && (
              <img src={`${API_URL}${settings.logoUrl}`} className="w-10 h-10 object-contain rounded border" />
            )}
            <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Color principal</label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              name="primaryColor"
              value={form.primaryColor}
              onChange={handleChange}
              className="w-12 h-10 border rounded"
            />
            <input
              name="primaryColor"
              value={form.primaryColor}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2 w-32"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Título del banner principal</label>
          <input
            name="heroTitle"
            value={form.heroTitle}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Subtítulo del banner principal</label>
          <textarea
            name="heroSubtitle"
            value={form.heroSubtitle}
            onChange={handleChange}
            rows={2}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Imagen de fondo del banner (opcional)</label>
          <div className="flex items-center gap-3 mt-1">
            {settings.heroImageUrl && (
              <img src={`${API_URL}${settings.heroImageUrl}`} className="w-16 h-10 object-cover rounded border" />
            )}
            <input type="file" accept="image/*" onChange={(e) => setHeroImage(e.target.files[0])} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Orden de las secciones de la home</label>
          <div className="mt-2 space-y-2">
            {sections.map((key, i) => (
              <div key={key} className="flex items-center justify-between bg-stone-50 border rounded-lg px-3 py-2">
                <span className="text-sm">{SECTION_LABELS[key] || key}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveSection(i, -1)}
                    disabled={i === 0}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(i, 1)}
                    disabled={i === sections.length - 1}
                    className="px-2 py-1 text-sm border rounded disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          disabled={saving}
          className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700"
        >
          {saving ? "Guardando..." : saved ? "¡Guardado! ✓" : "Guardar cambios"}
        </button>
      </form>
    </AdminLayout>
  );
}
