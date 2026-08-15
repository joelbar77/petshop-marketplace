import { Link } from "react-router-dom";
import { API_URL } from "../api/client";

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url;

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="bg-white rounded-xl border hover:shadow-md transition-shadow overflow-hidden flex flex-col"
    >
      <div className="aspect-square bg-stone-100 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={`${API_URL}${image}`} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">🐾</span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <span className="text-xs text-stone-500">{product.category?.name}</span>
        <h3 className="font-semibold text-stone-800 line-clamp-2">{product.name}</h3>
        <div className="mt-auto pt-2 font-bold text-brand-600">
          ${product.price.toLocaleString("es-AR")}
        </div>
        {product.stock === 0 && (
          <span className="text-xs text-red-500 font-medium">Sin stock</span>
        )}
      </div>
    </Link>
  );
}
