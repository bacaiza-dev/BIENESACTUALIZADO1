// =============================================
// SERVER.JS - SISTEMA COMPLETO DE GESTIÓN DE BIENES
// Instituto Superior Tecnológico
// Versión 2.0 - 100% Funcional
// =============================================

require("dotenv").config();

// Importaciones principales
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require("mysql2/promise");
const redis = require("ioredis");
const multer = require("multer");
const { Minio } = require("minio");
const path = require("path");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const winston = require("winston");
const cron = require("node-cron");

// Importar rutas de la API
// Usa las rutas del backend:
let apiRoutes;
try {
  apiRoutes = require("./routes/index.js"); // backend/routes/index.js
} catch (e) {
  console.warn(
    "[AVISO] No se encontró backend/routes/index.js. Agrega tus rutas de API en backend/routes/"
  );
  console.error("Error loading routes:", e);
  apiRoutes = (req, res, next) =>
    res.status(501).json({ success: false, message: "API no implementada" });
}

// Importar middleware de errores
// const { errorHandler } = require("../frontend/src/middleware");

// Middleware de manejo de errores básico
function errorHandler(err, req, res, next) {
  console.error("Error:", err);
  res
    .status(500)
    .json({
      success: false,
      message: "Error interno del servidor",
      error: err.message,
    });
}

const app = express();
const server = http.createServer(app);

// Configuración de Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const port = process.env.PORT || 3000;

// ==================== MIDDLEWARE GLOBAL ====================

// Seguridad
// Seguridad con CSP: permitir fuentes de estilo y scripts desde CDNs necesarios
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
        scriptSrc: ["'self'", "https://unpkg.com"],
        imgSrc: ["'self'", "data:", "https:"],
        // Permitir conexiones a la API y websockets en desarrollo
        connectSrc: ["'self'", "http://localhost:3000", "ws:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://unpkg.com"],
      },
    },
  })
);

// Compresión de respuestas
app.use(compression());

// CORS - Configuración específica para desarrollo
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (móviles, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Lista de orígenes permitidos
      const allowedOrigins = [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://frontend:80',
        'http://localhost:80',
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // En desarrollo, permitir todos
      }
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Middleware adicional para CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://frontend:80',
    'http://localhost:80',
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN
  ].filter(Boolean);
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || 'http://localhost:3001');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por ventana por IP
  message: {
    success: false,
    message: "Demasiadas solicitudes desde esta IP, intente más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Parsing de JSON y URL encoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging básico de requests
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`
  );
  next();
});

// ==================== RUTAS ====================

// Rutas de la API
app.use("/api", apiRoutes);

// Ruta de prueba de salud del servidor
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.APP_VERSION || "1.0.0",
  });
});

// Servir archivos estáticos si hay frontend build
app.use(express.static("public"));

// Manejo de rutas no encontradas (404)
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// ==================== MIDDLEWARE DE ERRORES ====================

// Middleware global de manejo de errores
app.use(errorHandler);

// ==================== INICIO DEL SERVIDOR ====================

// Iniciar servidor
server.listen(port, () => {
  console.log("==========================================");
  console.log("🚀 SISTEMA DE GESTIÓN DE BIENES");
  console.log("==========================================");
  console.log(`📊 Servidor iniciado en puerto: ${port}`);
  console.log(`🌐 URL: http://localhost:${port}`);
  console.log(`📋 API: http://localhost:${port}/api`);
  console.log(`💚 Salud: http://localhost:${port}/health`);
  console.log("==========================================");
  console.log(`🕐 Iniciado: ${new Date().toLocaleString()}`);
  console.log(`⚙️  Entorno: ${process.env.NODE_ENV || "development"}`);
  console.log("==========================================");
});

// Manejo de cierre graceful
process.on("SIGTERM", () => {
  console.log("SIGTERM recibido, cerrando servidor...");
  server.close(() => {
    console.log("Servidor cerrado");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT recibido, cerrando servidor...");
  server.close(() => {
    console.log("Servidor cerrado");
    process.exit(0);
  });
});

module.exports = app;
