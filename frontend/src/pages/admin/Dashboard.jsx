import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import client from "../../api/client";

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    async function load() {
      const [products, categories, orders] = await Promise.all([
        client.get("/products", { params: { admin: true } }),
        client.get("/categories"),
        client.get("/orders"),
      ]);
      const revenue = orders.data
        .filter((o) => o.status === "paid" || o.status === "shipped" || o.status === "delivered")
        .reduce((sum, o) => sum + o.total, 0);

      setStats({
        products: products.data.length,
        categories: categories.data.length,
        orders: orders.data.length,
        revenue,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Productos", value: stats.products },
    { label: "Categorías", value: stats.categories },
    { label: "Pedidos totales", value: stats.orders },
    { label: "Ingresos confirmados", value: `$${stats.revenue.toLocaleString("es-AR")}` },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Resumen</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border rounded-xl p-5">
            <div className="text-sm text-stone-500">{c.label}</div>
            <div className="text-2xl font-bold text-stone-800 mt-1">{c.value}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
