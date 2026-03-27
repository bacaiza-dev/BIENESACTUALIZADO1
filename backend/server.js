// server.js - Servidor Express simplificado
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Logging simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Servir archivos estáticos de uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Importar rutas API
let apiRoutes;
let routesLoadError = null;
try {
  apiRoutes = require("./routes/index.js");
} catch (e) {
  routesLoadError = e;
  console.error("[ERROR] No se pudo cargar rutas:", e?.message || e);
  console.error(e?.stack || "stack no disponible");
  apiRoutes = (req, res) => {
    const payload = {
      success: false,
      message: "API no disponible",
      error: e?.message || "Error desconocido al cargar rutas",
    };
    if (process.env.NODE_ENV !== "production") {
      payload.details = e?.stack || "stack no disponible";
    }
    res.status(501).json(payload);
  };
}

// Montar rutas bajo /api
app.use("/api", apiRoutes);

// Si hubo error al cargar las rutas, detener el proceso para evitar estado inconsistente
if (routesLoadError) {
  console.error("[FATAL] No se pudieron cargar las rutas. El servidor se apagará.");
  console.error(routesLoadError);
  setTimeout(() => process.exit(1), 100);
}

// Health check en raíz
app.get("/health", async (req, res) => {
  try {
    const { testConnection } = require("./config/database");
    await testConnection();
    res.json({ success: true, status: "OK", database: "connected" });
  } catch (error) {
    res.status(500).json({ success: false, status: "ERROR", error: error.message });
  }
});

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sistema de Gestión de Bienes - API",
    version: "2.2.0",
    endpoints: "/api"
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ success: false, message: "Error interno", error: err.message });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor iniciado en puerto ${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
});

module.exports = app;
