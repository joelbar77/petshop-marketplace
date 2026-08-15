import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout.jsx";
import client, { API_URL } from "../../api/client";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    client.get("/products", { params: { admin: true } }).then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    await client.delete(`/products/${id}`);
    load();
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Productos</h1>
        <Link
          to="/admin/productos/nuevo"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700"
        >
          + Nuevo producto
        </Link>
      </div>

      {loading ? (
        <p className="text-stone-500">Cargando...</p>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-left">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Estado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                      {p.images?.[0] ? (
                        <img src={`${API_URL}${p.images[0].url}`} className="w-full h-full object-cover" />
                      ) : (
                        <span>🐾</span>
                      )}
                    </div>
                    {p.name}
                  </td>
                  <td className="p-3">{p.category?.name}</td>
                  <td className="p-3">${p.price.toLocaleString("es-AR")}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <span className={p.active ? "text-green-600" : "text-stone-400"}>
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-3">
                    <Link to={`/admin/productos/${p.id}`} className="text-brand-600 hover:underline">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="p-6 text-center text-stone-500">Todavía no hay productos cargados.</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
