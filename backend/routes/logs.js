// routes/logs.js - Logs del sistema (persistente en BD)
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");

/**
 * Agregar log al sistema (persistente en BD)
 */
async function addSystemLog(nivel, modulo, mensaje, detalles = null, usuarioId = null, ipAddress = null) {
  try {
    const result = await query(
      `INSERT INTO logs_sistema (nivel, modulo, mensaje, detalles, usuario_id, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nivel, modulo, mensaje, detalles, usuarioId, ipAddress]
    );
    return { id: result.insertId, nivel, modulo, mensaje, detalles, usuarioId };
  } catch (error) {
    console.error("[ERROR] addSystemLog:", error.message);
    return null;
  }
}

// GET /logs - Obtener logs del sistema desde BD
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nivel, modulo, fechaDesde, fechaHasta, limite = 500 } = req.query;
    
    let sql = `
      SELECT ls.id_log as id, ls.nivel, ls.modulo, ls.mensaje, ls.detalles,
             ls.usuario_id, ls.ip_address, ls.created_at as timestamp,
             CONCAT(u.nombres, ' ', u.apellidos) as usuario
      FROM logs_sistema ls
      LEFT JOIN usuarios u ON ls.usuario_id = u.id_usuario
      WHERE 1=1
    `;
    const params = [];

    if (nivel) {
      sql += " AND ls.nivel = ?";
      params.push(nivel);
    }
    if (modulo) {
      sql += " AND ls.modulo = ?";
      params.push(modulo);
    }
    if (fechaDesde) {
      sql += " AND DATE(ls.created_at) >= ?";
      params.push(fechaDesde);
    }
    if (fechaHasta) {
      sql += " AND DATE(ls.created_at) <= ?";
      params.push(fechaHasta);
    }

    sql += " ORDER BY ls.created_at DESC LIMIT ?";
    params.push(parseInt(limite));

    const logs = await query(sql, params);

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error("[ERROR] GET /logs:", error.message);
    res.json({
      success: true,
      data: [],
    });
  }
});

// POST /logs - Crear log manualmente (para uso interno/API)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { nivel = 'info', modulo, mensaje, detalles } = req.body;
    
    if (!modulo || !mensaje) {
      return res.status(400).json({ 
        success: false, 
        message: "Módulo y mensaje son requeridos" 
      });
    }

    const log = await addSystemLog(
      nivel,
      modulo,
      mensaje,
      detalles,
      req.user?.id || null,
      req.ip || null
    );

    if (log) {
      res.json({ success: true, message: "Log creado", data: log });
    } else {
      res.status(500).json({ success: false, message: "Error creando log" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creando log",
      error: error.message,
    });
  }
});

// DELETE /logs - Limpiar logs antiguos
router.delete("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { diasAntiguedad = 30 } = req.query;
    
    const result = await query(
      "DELETE FROM logs_sistema WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)",
      [parseInt(diasAntiguedad)]
    );

    res.json({
      success: true,
      message: `Logs limpiados correctamente. ${result.affectedRows} registros eliminados.`,
      data: { deleted: result.affectedRows }
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
