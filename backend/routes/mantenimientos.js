// routes/mantenimientos.js - CRUD de mantenimientos
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { mapMantenimientoRow } = require("../helpers/mappers");

// GET /mantenimientos - Listar mantenimientos
router.get("/", verifyToken, async (req, res) => {
  try {
    const { id_bien, estado, year, month } = req.query;
    
    // Esquema real: id_mantenimiento, id_bien, responsable_id, fecha_realizada
    let sql = `
      SELECT m.*, b.nombre as bien_nombre, b.codigo_institucional as bien_codigo, 
             CONCAT(u.nombres, ' ', u.apellidos) as responsable_nombre
      FROM mantenimientos m
      LEFT JOIN bienes b ON m.id_bien = b.id_bien
      LEFT JOIN usuarios u ON m.responsable_id = u.id_usuario
      WHERE 1=1
    `;
    const params = [];

    if (id_bien) {
      sql += " AND m.id_bien = ?";
      params.push(id_bien);
    }

    if (estado) {
      sql += " AND m.estado = ?";
      params.push(estado);
    }

    if (year) {
      sql += " AND YEAR(m.fecha_programada) = ?";
      params.push(year);
      
      if (month) {
        sql += " AND MONTH(m.fecha_programada) = ?";
        params.push(month);
      }
    }

    sql += " ORDER BY m.fecha_programada DESC";

    const rows = await query(sql, params);
    
    // Calcular estadísticas
    const stats = {
      total: rows.length,
      pendiente: rows.filter(r => r.estado === 'PENDIENTE' || r.estado === 'pendiente').length,
      en_proceso: rows.filter(r => r.estado === 'EN_PROCESO' || r.estado === 'en_proceso').length,
      completado: rows.filter(r => r.estado === 'COMPLETADO' || r.estado === 'completado').length,
      costo_total: rows.reduce((acc, curr) => acc + (Number(curr.costo_real) || 0), 0)
    };

    res.json({ 
      success: true, 
      data: rows.map(mapMantenimientoRow),
      stats
    });
  } catch (error) {
    console.error("[ERROR] GET /mantenimientos:", error.message);
    res.json({ success: true, data: [], stats: { total: 0, pendiente: 0, en_proceso: 0, completado: 0, costo_total: 0 } });
  }
});

// GET /mantenimientos/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(`
      SELECT m.*, b.nombre as bien_nombre, b.codigo_institucional as bien_codigo,
             CONCAT(u.nombres, ' ', u.apellidos) as responsable_nombre
      FROM mantenimientos m
      LEFT JOIN bienes b ON m.id_bien = b.id_bien
      LEFT JOIN usuarios u ON m.responsable_id = u.id_usuario
      WHERE m.id_mantenimiento = ?
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Mantenimiento no encontrado" });
    }

    res.json({ success: true, data: mapMantenimientoRow(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo mantenimiento", error: error.message });
  }
});

// POST /mantenimientos
router.post("/", verifyToken, async (req, res) => {
  try {
    const { 
      id_bien, tipo, descripcion, fecha_programada, fecha_limite,
      costo_estimado, prioridad, observaciones
    } = req.body;

    if (!id_bien || !tipo || !fecha_programada) {
      return res.status(400).json({ success: false, message: "Bien, tipo y fecha programada son requeridos" });
    }

    const result = await query(
      `INSERT INTO mantenimientos 
       (id_bien, responsable_id, tipo, descripcion, estado, fecha_programada, fecha_limite, 
        costo_estimado, prioridad, observaciones)
       VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?, ?)`,
      [
        id_bien, 
        req.user.id, 
        tipo, 
        descripcion || null, 
        fecha_programada, 
        fecha_limite || null,
        costo_estimado || 0,
        prioridad || 'MEDIA',
        observaciones || null
      ]
    );

    res.json({ success: true, message: "Mantenimiento programado", data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creando mantenimiento", error: error.message });
  }
});

// PUT /mantenimientos/:id
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      tipo, descripcion, estado, fecha_programada, fecha_limite, fecha_realizada,
      costo_estimado, costo_real, prioridad, observaciones
    } = req.body;

    const [prev] = await query("SELECT estado, id_bien FROM mantenimientos WHERE id_mantenimiento = ?", [id]);
    
    if (!prev) {
      return res.status(404).json({ success: false, message: "Mantenimiento no encontrado" });
    }

    let fechaRealizadaVal = fecha_realizada;
    if (estado === 'COMPLETADO' && !fecha_realizada) {
      fechaRealizadaVal = new Date();
    }

    await query(
      `UPDATE mantenimientos 
       SET tipo = ?, descripcion = ?, estado = ?, fecha_programada = ?, fecha_limite = ?, 
           fecha_realizada = ?, costo_estimado = ?, costo_real = ?, prioridad = ?, observaciones = ?
       WHERE id_mantenimiento = ?`,
      [
        tipo, descripcion, estado, fecha_programada, fecha_limite || null,
        fechaRealizadaVal || null, costo_estimado, costo_real, prioridad, observaciones, id
      ]
    );

    res.json({ success: true, message: "Mantenimiento actualizado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando mantenimiento", error: error.message });
  }
});

// DELETE /mantenimientos/:id
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM mantenimientos WHERE id_mantenimiento = ?", [id]);
    res.json({ success: true, message: "Mantenimiento eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando mantenimiento", error: error.message });
  }
});

module.exports = router;
