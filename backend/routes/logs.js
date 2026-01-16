// routes/logs.js - Logs del sistema
const express = require("express");
const router = express.Router();
const { verifyToken, requireAdmin } = require("../middleware/auth");

// Almacenamiento de logs en memoria
const systemLogs = [];

/**
 * Agregar log al sistema
 */
function addSystemLog(nivel, modulo, mensaje, detalles = null, usuario = null) {
  const log = {
    id: systemLogs.length + 1,
    nivel,
    modulo,
    mensaje,
    detalles,
    usuario,
    timestamp: new Date().toISOString(),
  };
  systemLogs.unshift(log);
  // Mantener solo los últimos 500 logs
  if (systemLogs.length > 500) {
    systemLogs.pop();
  }
  return log;
}

// GET /logs - Obtener logs del sistema
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nivel, modulo, fechaDesde, fechaHasta } = req.query;
    let resultado = [...systemLogs];

    if (nivel) {
      resultado = resultado.filter((log) => log.nivel === nivel);
    }
    if (modulo) {
      resultado = resultado.filter((log) => log.modulo === modulo);
    }
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      resultado = resultado.filter((log) => new Date(log.timestamp) >= desde);
    }
    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      resultado = resultado.filter((log) => new Date(log.timestamp) <= hasta);
    }

    res.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo logs",
      error: error.message,
    });
  }
});

// DELETE /logs - Limpiar logs
router.delete("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    systemLogs.length = 0;
    res.json({
      success: true,
      message: "Logs limpiados correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error limpiando logs",
      error: error.message,
    });
  }
});

// Exportar función para uso en otros módulos
router.addSystemLog = addSystemLog;

module.exports = router;
