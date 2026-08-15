import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/admin", label: "Resumen", exact: true },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/apariencia", label: "Apariencia" },
  { to: "/admin/banners", label: "Banners" },
];

export default function AdminLayout({ children }) {
  const { admin, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-stone-100">
      <aside className="w-56 bg-stone-900 text-stone-100 flex flex-col shrink-0">
        <div className="px-4 py-5 text-lg font-bold border-b border-stone-700">
          🐾 Admin PetShop
        </div>
        <nav className="flex-1 py-4">
          {links.map((l) => {
            const active = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`block px-4 py-2 text-sm ${
                  active ? "bg-brand-600 text-white" : "text-stone-300 hover:bg-stone-800"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-stone-700 text-sm">
          <div className="mb-2 text-stone-400">{admin?.name}</div>
          <button onClick={logout} className="text-red-400 hover:text-red-300">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
