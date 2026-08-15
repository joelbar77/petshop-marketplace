import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client, { API_URL } from "../api/client";
import StoreHeader from "../components/StoreHeader.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    client.get(`/products/${slug}`).then((res) => setProduct(res.data));
  }, [slug]);

  if (!product) {
    return (
      <div>
        <StoreHeader />
        <p className="max-w-4xl mx-auto px-4 py-10 text-stone-500">Cargando...</p>
      </div>
    );
  }

  const image = product.images?.[activeImage]?.url;

  return (
    <div>
      <StoreHeader />
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-stone-100 rounded-xl overflow-hidden flex items-center justify-center">
            {image ? (
              <img src={`${API_URL}${image}`} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">🐾</span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    i === activeImage ? "border-brand-600" : "border-transparent"
                  }`}
                >
                  <img src={`${API_URL}${img.url}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="text-sm text-stone-500">{product.category?.name}</span>
          <h1 className="text-2xl font-bold text-stone-800 mt-1">{product.name}</h1>
          <div className="text-2xl font-bold text-brand-600 mt-3">
            ${product.price.toLocaleString("es-AR")}
          </div>
          <p className="text-stone-600 mt-4 whitespace-pre-line">{product.description}</p>

          <div className="mt-3 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600">Stock disponible ({product.stock} unidades)</span>
            ) : (
              <span className="text-red-500">Sin stock</span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <input
              type="number"
              min={1}
              max={product.stock || 1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 border rounded-lg px-3 py-2"
            />
            <button
              disabled={product.stock === 0}
              onClick={() => {
                addItem(product, quantity);
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
              className="bg-brand-600 disabled:bg-stone-300 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700"
            >
              {added ? "¡Agregado! ✓" : "Agregar al carrito"}
            </button>
          </div>

          <button
            onClick={() => navigate("/carrito")}
            className="mt-3 text-sm text-brand-600 hover:underline"
          >
            Ir al carrito →
          </button>
        </div>
      </div>
    </div>
  );
}
