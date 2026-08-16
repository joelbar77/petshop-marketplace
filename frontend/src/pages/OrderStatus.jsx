import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import client from "../api/client";
import StoreHeader from "../components/StoreHeader.jsx";
import { useCart } from "../context/CartContext.jsx";

const STATUS_LABELS = {
  pending: { text: "Pago pendiente", color: "text-yellow-600" },
  paid: { text: "¡Pago aprobado! 🎉", color: "text-green-600" },
  rejected: { text: "Pago rechazado", color: "text-red-600" },
  shipped: { text: "Enviado", color: "text-blue-600" },
  delivered: { text: "Entregado", color: "text-green-600" },
  cancelled: { text: "Cancelado", color: "text-red-600" },
};

export default function OrderStatus() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    client.get(`/orders/${id}`).then((res) => setOrder(res.data));
    if (searchParams.get("estado") === "exito") clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!order) {
    return (
      <div>
        <StoreHeader />
        <p className="max-w-xl mx-auto px-4 py-10 text-stone-500">Cargando pedido...</p>
      </div>
    );
  }

  const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

  return (
    <div>
      <StoreHeader />
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        <h1 className={`text-2xl font-bold ${status.color}`}>{status.text}</h1>
        <p className="text-stone-500 mt-2">Pedido #{order.id.slice(-8).toUpperCase()}</p>

        <div className="bg-white border rounded-xl p-5 mt-6 text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 py-1 text-sm">
              <span className="truncate">{item.quantity}x {item.product.name}</span>
              <span className="shrink-0">${(item.quantity * item.unitPrice).toLocaleString("es-AR")}</span>
            </div>
          ))}
          <div className="flex justify-between border-t mt-2 pt-2 font-semibold">
            <span>Total</span>
            <span>${order.total.toLocaleString("es-AR")}</span>
          </div>
        </div>

        <Link to="/" className="inline-block mt-6 text-brand-600 font-medium hover:underline">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
