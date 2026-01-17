// routes/index.js - Archivo principal de rutas
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Importar módulos de rutas
const authRoutes = require("./auth");
const usuariosRoutes = require("./usuarios");
const bienesRoutes = require("./bienes");
const ubicacionesRoutes = require("./ubicaciones");
const categoriasRoutes = require("./categorias");
const mantenimientosRoutes = require("./mantenimientos");
const periodosRoutes = require("./periodos");
const aulasAsignadasRoutes = require("./aulas-asignadas");
const reportesRoutes = require("./reportes");
const dashboardRoutes = require("./dashboard"); // Nuevo módulo de dashboard
const logsRoutes = require("./logs");
const exportRoutes = require("./export");
const rolesRoutes = require("./roles");
const departamentosRoutes = require("./departamentos");
const movimientosRoutes = require("./movimientos");
const alertasRoutes = require("./alertas");
const documentosRoutes = require("./documentos");
const asignacionesRoutes = require("./asignaciones");
const searchRoutes = require("./search");

// Ruta pública de información
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API sistema de bienes (Refactorizado)",
    version: "2.2.0",
    timestamp: new Date().toISOString(),
  });
});

// Ruta de health check
router.get("/health", async (req, res) => {
  try {
    const { testConnection } = require("../config/database");
    await testConnection();
    res.json({
      success: true,
      message: "Sistema operativo",
      database: "conectado",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error probando conexion",
      error: error.message,
    });
  }
});

// Montar rutas modularizadas
// ======================================

// Autenticación
router.use("/auth", authRoutes);

// Usuarios
router.use("/usuarios", usuariosRoutes);

// Bienes (Activos)
router.use("/bienes", bienesRoutes);

// Ubicaciones (Aulas, Labs, Oficinas)
router.use("/ubicaciones", ubicacionesRoutes);

// Categorías
router.use("/categorias", categoriasRoutes);

// Mantenimientos
router.use("/mantenimientos", mantenimientosRoutes);

// Periodos Académicos
router.use("/periodos-academicos", periodosRoutes);

// Asignaciones de Aulas
router.use("/aulas-asignadas", aulasAsignadasRoutes);

// Reportes
router.use("/reportes", reportesRoutes);

// Dashboard
router.use("/dashboard", dashboardRoutes);

// Logs del Sistema
router.use("/logs", logsRoutes);

// Roles y Departamentos
router.use("/roles", rolesRoutes);
router.use("/departamentos", departamentosRoutes);

// Movimientos y Alertas
router.use("/movimientos", movimientosRoutes);
router.use("/alertas", alertasRoutes);

// Documentos y Asignaciones
router.use("/documentos", documentosRoutes);
router.use("/asignaciones", asignacionesRoutes);

// Búsqueda Global
router.use("/search", searchRoutes);

// Exportación
router.use("/export", exportRoutes);

// Import (wrapper placeholder)
const importWrapper = require("./import-wrapper");
router.use("/import", importWrapper);

// Test DB endpoint para frontend
router.get("/test-db", async (req, res) => {
  try {
    const { testConnection } = require("../config/database");
    await testConnection();
    res.json({ success: true, message: "Conexión OK" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error de conexión" });
  }
});

module.exports = router;
