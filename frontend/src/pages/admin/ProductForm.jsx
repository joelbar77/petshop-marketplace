import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout.jsx";
import client, { API_URL } from "../../api/client";

const PET_TYPES = [
  { value: "perro", label: "Perro" },
  { value: "gato", label: "Gato" },
  { value: "otro", label: "Otra mascota" },
];

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = id && id !== "nuevo";
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    petType: "perro",
    categoryId: "",
    active: true,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    client.get("/products", { params: { admin: true } }).then((res) => {
      const product = res.data.find((p) => p.id === id);
      if (product) {
        setForm({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          petType: product.petType,
          categoryId: product.categoryId,
          active: product.active,
        });
        setExistingImages(product.images || []);
      }
    });
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  async function handleDeleteImage(imageId) {
    await client.delete(`/products/${id}/images/${imageId}`);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    newImages.forEach((file) => data.append("images", file));

    try {
      if (isEdit) {
        await client.put(`/products/${id}`, data);
      } else {
        await client.post("/products", data);
      }
      navigate("/admin/productos");
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar el producto");
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">
        {isEdit ? "Editar producto" : "Nuevo producto"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 max-w-2xl space-y-4">
        <div>
          <label className="text-sm font-medium text-stone-700">Nombre del producto</label>
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-stone-700">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-stone-700">Precio ($)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Stock</label>
            <input
              type="number"
              min="0"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-stone-700">Tipo de mascota</label>
            <select
              name="petType"
              value={form.petType}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              {PET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Categoría</label>
            <select
              required
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="">Seleccionar...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
          Producto visible en la tienda
        </label>

        {existingImages.length > 0 && (
          <div>
            <label className="text-sm font-medium text-stone-700">Imágenes actuales</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {existingImages.map((img) => (
                <div key={img.id} className="relative">
                  <img src={`${API_URL}${img.url}`} className="w-20 h-20 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-stone-700">
            {existingImages.length > 0 ? "Agregar más imágenes" : "Imágenes del producto"}
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setNewImages(Array.from(e.target.files))}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            disabled={saving}
            className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700"
          >
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/productos")}
            className="px-5 py-2 rounded-lg font-medium border"
          >
            Cancelar
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
