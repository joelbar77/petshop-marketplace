import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { API_URL } from "../api/client";
import StoreHeader from "../components/StoreHeader.jsx";

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const navigate = useNavigate();

  return (
    <div>
      <StoreHeader />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Tu carrito</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500 mb-4">Tu carrito está vacío.</p>
            <Link to="/" className="text-brand-600 font-medium hover:underline">
              Volver a la tienda
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="bg-white border rounded-xl p-3 flex items-center gap-3 sm:gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-stone-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {item.image ? (
                      <img src={`${API_URL}${item.image}`} className="w-full h-full object-cover" />
                    ) : (
                      <span>🐾</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-stone-800 truncate">{item.name}</div>
                    <div className="text-brand-600 font-semibold">
                      ${item.price.toLocaleString("es-AR")}
                    </div>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                    className="w-14 sm:w-16 border rounded-lg px-2 py-1 shrink-0"
                  />
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 text-sm hover:underline shrink-0"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 border-t pt-4">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-brand-600">
                ${total.toLocaleString("es-AR")}
              </span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-6 bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700"
            >
              Continuar a pagar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
