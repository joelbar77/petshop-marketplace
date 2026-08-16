import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useSettings } from "../context/SettingsContext.jsx";
import { API_URL } from "../api/client";

export default function StoreHeader() {
  const { count } = useCart();
  const { settings } = useSettings();

  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="text-xl sm:text-2xl font-bold text-brand-600 flex items-center gap-2 min-w-0">
          {settings.logoUrl ? (
            <img src={`${API_URL}${settings.logoUrl}`} alt={settings.businessName} className="h-8 w-8 object-contain rounded shrink-0" />
          ) : (
            <span className="shrink-0">🐾</span>
          )}
          <span className="truncate">{settings.businessName}</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5 text-sm font-medium text-stone-700 shrink-0">
          <Link to="/?mascota=perro" className="hidden md:inline hover:text-brand-600">Perros</Link>
          <Link to="/?mascota=gato" className="hidden md:inline hover:text-brand-600">Gatos</Link>
          <Link to="/?mascota=otro" className="hidden md:inline hover:text-brand-600">Otras mascotas</Link>
          <Link to="/carrito" className="relative hover:text-brand-600">
            🛒<span className="hidden sm:inline"> Carrito</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
