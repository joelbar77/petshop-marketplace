import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import client from "../api/client";
import StoreHeader from "../components/StoreHeader.jsx";

export default function Checkout() {
  const { items, total } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) return <Navigate to="/carrito" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await client.post("/payments/create-preference", {
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      // Redirigimos al checkout de Mercado Pago (tarjeta, débito o transferencia)
      window.location.href = data.initPoint;
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo iniciar el pago. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div>
      <StoreHeader />
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Finalizar compra</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-6">
          <div>
            <label className="text-sm font-medium text-stone-700">Nombre y apellido</label>
            <input
              required
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Email</label>
            <input
              required
              type="email"
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Teléfono</label>
            <input
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Dirección de envío</label>
            <textarea
              name="shippingAddress"
              value={form.shippingAddress}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              rows={2}
            />
          </div>

          <div className="flex justify-between border-t pt-4 font-semibold">
            <span>Total a pagar</span>
            <span className="text-brand-600">${total.toLocaleString("es-AR")}</span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-brand-600 disabled:bg-stone-300 text-white py-3 rounded-lg font-semibold hover:bg-brand-700"
          >
            {loading ? "Redirigiendo a Mercado Pago..." : "Pagar con Mercado Pago"}
          </button>
          <p className="text-xs text-stone-400 text-center">
            Vas a poder elegir tarjeta de crédito, débito o transferencia en el siguiente paso.
          </p>
        </form>
      </div>
    </div>
  );
}
