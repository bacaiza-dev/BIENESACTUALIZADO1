// routes/alertas.js - CRUD de alertas (tabla: alertas)
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// GET /alertas - Listar alertas
router.get("/", verifyToken, async (req, res) => {
  try {
    const { estado, prioridad, tipo } = req.query;
    
    // Columnas reales: id_alerta, id_bien, tipo_alerta, prioridad, descripcion, estado, fecha_alerta
    let sql = `
      SELECT a.*, b.nombre as bien_nombre, b.codigo_institucional as bien_codigo
      FROM alertas a
      LEFT JOIN bienes b ON a.id_bien = b.id_bien
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      sql += " AND a.estado = ?";
      params.push(estado);
    }

    if (prioridad) {
      sql += " AND a.prioridad = ?";
      params.push(prioridad);
    }

    if (tipo) {
      sql += " AND a.tipo_alerta = ?";
      params.push(tipo);
    }

    sql += " ORDER BY a.fecha_alerta DESC, a.prioridad DESC";

    const rows = await query(sql, params);
    
    res.json({ 
      success: true, 
      data: rows.map(row => ({
        id: row.id_alerta,
        id_bien: row.id_bien,
        bien_nombre: row.bien_nombre,
        bien_codigo: row.bien_codigo,
        tipo: row.tipo_alerta,
        tipo_alerta: row.tipo_alerta,
        prioridad: row.prioridad,
        descripcion: row.descripcion,
        estado: row.estado,
        fecha_alerta: row.fecha_alerta,
        fecha_resolucion: row.fecha_resolucion
      }))
    });
  } catch (error) {
    console.error("[ERROR] GET /alertas:", error.message);
    res.json({ success: true, data: [] });
  }
});

// GET /alertas/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [row] = await query(`
      SELECT a.*, b.nombre as bien_nombre
      FROM alertas a
      LEFT JOIN bienes b ON a.id_bien = b.id_bien
      WHERE a.id_alerta = ?
    `, [id]);
    
    if (!row) {
      return res.status(404).json({ success: false, message: "Alerta no encontrada" });
    }

    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo alerta", error: error.message });
  }
});

// POST /alertas
router.post("/", verifyToken, async (req, res) => {
  try {
    const { id_bien, tipo_alerta, prioridad, descripcion } = req.body;

    const result = await query(
      `INSERT INTO alertas (id_bien, tipo_alerta, prioridad, descripcion, estado, fecha_alerta)
       VALUES (?, ?, ?, ?, 'pendiente', CURDATE())`,
      [id_bien || null, tipo_alerta, prioridad || 'media', descripcion || null]
    );

    res.json({ success: true, message: "Alerta creada", data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creando alerta", error: error.message });
  }
});

// PUT /alertas/:id
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, descripcion, fecha_resolucion } = req.body;

    let fechaRes = fecha_resolucion;
    if ((estado === 'resuelta' || estado === 'cerrada') && !fecha_resolucion) {
      fechaRes = new Date().toISOString().split('T')[0];
    }

    await query(
      `UPDATE alertas SET estado = ?, descripcion = ?, fecha_resolucion = ? WHERE id_alerta = ?`,
      [estado, descripcion, fechaRes || null, id]
    );

    res.json({ success: true, message: "Alerta actualizada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando alerta", error: error.message });
  }
});

// DELETE /alertas/:id
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM alertas WHERE id_alerta = ?", [id]);
    res.json({ success: true, message: "Alerta eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando alerta", error: error.message });
  }
});

module.exports = router;
