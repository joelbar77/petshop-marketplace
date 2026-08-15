import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client, { API_URL } from "../api/client";
import StoreHeader from "../components/StoreHeader.jsx";
import ProductCard from "../components/ProductCard.jsx";
import PromoBanners from "../components/PromoBanners.jsx";
import { useSettings } from "../context/SettingsContext.jsx";

function HeroSection() {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const buscar = searchParams.get("buscar") || "";

  function handleSearch(e) {
    e.preventDefault();
    const value = e.target.buscar.value;
    setSearchParams(value ? { buscar: value } : {});
  }

  return (
    <section
      className="bg-brand-500 text-white py-10 bg-cover bg-center"
      style={settings.heroImageUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0.35)), url(${API_URL}${settings.heroImageUrl})` } : undefined}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">{settings.heroTitle}</h1>
        <p className="text-brand-50 mb-4">{settings.heroSubtitle}</p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <input
            name="buscar"
            defaultValue={buscar}
            placeholder="Buscar productos..."
            className="flex-1 rounded-lg px-4 py-2 text-stone-800"
          />
          <button className="bg-stone-900 px-4 py-2 rounded-lg font-medium">Buscar</button>
        </form>
      </div>
    </section>
  );
}

function CategoriesAndProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const mascota = searchParams.get("mascota") || "";
  const categoria = searchParams.get("categoria") || "";
  const buscar = searchParams.get("buscar") || "";

  useEffect(() => {
    client.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (mascota) params.mascota = mascota;
    if (categoria) params.categoria = categoria;
    if (buscar) params.buscar = buscar;
    client.get("/products", { params }).then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, [mascota, categoria, buscar]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
        <button
          onClick={() => setSearchParams({})}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border ${
            !categoria ? "bg-brand-600 text-white border-brand-600" : "bg-white text-stone-700"
          }`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSearchParams({ categoria: c.slug })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border ${
              categoria === c.slug ? "bg-brand-600 text-white border-brand-600" : "bg-white text-stone-700"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-stone-500">Cargando productos...</p>
      ) : products.length === 0 ? (
        <p className="text-stone-500">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

const SECTION_COMPONENTS = {
  hero: HeroSection,
  banners: PromoBanners,
};

export default function Home() {
  const { settings } = useSettings();
  const order = (settings.sectionsOrder || "hero,banners,categories,products")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // "categories" y "products" viven en un mismo bloque (el filtro de categorías
  // está pegado a la grilla de productos), así que solo renderizamos ese bloque
  // una vez, en la posición de la primera de las dos que aparezca en el orden.
  let productsBlockRendered = false;

  return (
    <div>
      <StoreHeader />
      {order.map((key) => {
        if (key === "categories" || key === "products") {
          if (productsBlockRendered) return null;
          productsBlockRendered = true;
          return <CategoriesAndProducts key={key} />;
        }
        const Component = SECTION_COMPONENTS[key];
        return Component ? <Component key={key} /> : null;
      })}
    </div>
  );
}
