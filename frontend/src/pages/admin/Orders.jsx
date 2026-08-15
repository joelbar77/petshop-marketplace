import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout.jsx";
import client from "../../api/client";

const STATUS_OPTIONS = ["pending", "paid", "rejected", "shipped", "delivered", "cancelled"];
const STATUS_LABELS = {
  pending: "Pendiente",
  paid: "Pagado",
  rejected: "Rechazado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    client.get("/orders").then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function handleStatusChange(id, status) {
    await client.put(`/orders/${id}/status`, { status });
    load();
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Pedidos</h1>

      {loading ? (
        <p className="text-stone-500">Cargando...</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border rounded-xl p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="font-semibold text-stone-800">
                    #{o.id.slice(-8).toUpperCase()} — {o.customerName}
                  </div>
                  <div className="text-sm text-stone-500">{o.customerEmail}</div>
                  <div className="text-xs text-stone-400 mt-1">
                    {new Date(o.createdAt).toLocaleString("es-AR")}
                    {o.paymentMethod ? ` · ${o.paymentMethod}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-brand-600">${o.total.toLocaleString("es-AR")}</div>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="border rounded-lg px-2 py-1 text-sm mt-1"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="border-t mt-3 pt-3 text-sm text-stone-600 space-y-1">
                {o.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.product?.name || "(producto eliminado)"}</span>
                    <span>${(item.quantity * item.unitPrice).toLocaleString("es-AR")}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-stone-500">Todavía no hay pedidos.</p>}
        </div>
      )}
    </AdminLayout>
  );
}
