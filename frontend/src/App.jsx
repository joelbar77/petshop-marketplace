import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderStatus from "./pages/OrderStatus.jsx";
import AdminLogin from "./pages/admin/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import ProductForm from "./pages/admin/ProductForm.jsx";
import AdminCategories from "./pages/admin/Categories.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";
import AdminBanners from "./pages/admin/Banners.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";

export default function App() {
  return (
    <Routes>
      {/* Tienda pública */}
      <Route path="/" element={<Home />} />
      <Route path="/producto/:slug" element={<ProductPage />} />
      <Route path="/carrito" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/pedido/:id" element={<OrderStatus />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
      <Route path="/admin/productos" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
      <Route path="/admin/productos/:id" element={<RequireAdmin><ProductForm /></RequireAdmin>} />
      <Route path="/admin/categorias" element={<RequireAdmin><AdminCategories /></RequireAdmin>} />
      <Route path="/admin/pedidos" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
      <Route path="/admin/apariencia" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
      <Route path="/admin/banners" element={<RequireAdmin><AdminBanners /></RequireAdmin>} />
    </Routes>
  );
}
