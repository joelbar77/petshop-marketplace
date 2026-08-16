const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const settingsRoutes = require("./routes/settings");
const bannerRoutes = require("./routes/banners");

const app = express();

// ============================================
// CONFIGURACIÓN DE CORS (SOLUCIÓN COMPLETA)
// ============================================
const allowedOrigins = [
  'http://localhost:5173',           // Desarrollo local
  'http://localhost:3000',           // Alternativa local
  'https://petshop-marketplace-qw0yl41gc-tienda-juampi.vercel.app', // Tu frontend actual
  'https://petshop-marketplace-nu.vercel.app', // Tu otro dominio
  process.env.FRONTEND_URL           // Variable de entorno
].filter(Boolean); // Elimina valores undefined

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como Postman) o con origen permitido
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Origen bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ============================================
// MIDDLEWARES
// ============================================
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// ============================================
// RUTAS DE LA API
// ============================================
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/banners", bannerRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: err.message || "Error interno del servidor" 
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API de PetShop corriendo en http://localhost:${PORT}`);
  console.log(`📡 CORS permitido para:`, allowedOrigins);
});