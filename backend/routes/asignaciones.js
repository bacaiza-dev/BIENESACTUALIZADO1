// routes/asignaciones.js - Asignaciones de bienes a usuarios (tabla: bien_usuario)
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// GET /asignaciones - Listar asignaciones de bienes
router.get("/", verifyToken, async (req, res) => {
  try {
    const { usuario_id, bien_id, activo, search } = req.query;
    
    // Tabla real: bien_usuario (no asignaciones_bienes)
    let sql = `
      SELECT bu.*, 
             b.nombre as bien_nombre, b.codigo_institucional as bien_codigo,
             CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre, u.email as usuario_email
      FROM bien_usuario bu
      LEFT JOIN bienes b ON bu.id_bien = b.id_bien
      LEFT JOIN usuarios u ON bu.id_usuario = u.id_usuario
      WHERE 1=1
    `;
    const params = [];

    if (usuario_id) {
      sql += " AND bu.id_usuario = ?";
      params.push(usuario_id);
    }

    if (bien_id) {
      sql += " AND bu.id_bien = ?";
      params.push(bien_id);
    }

    if (activo !== undefined) {
      sql += " AND bu.activo = ?";
      params.push(activo === 'true' || activo === '1' ? 1 : 0);
    }

    if (search) {
      sql += " AND (b.nombre LIKE ? OR b.codigo_institucional LIKE ? OR u.nombres LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += " ORDER BY bu.fecha_asignacion DESC";

    const rows = await query(sql, params);
    
    // Calcular estadísticas
    const stats = {
      total: rows.length,
      activas: rows.filter(r => r.activo === 1).length,
      pendientes: 0,
      devueltas: rows.filter(r => r.activo === 0 && r.fecha_devolucion).length,
      usuarios: [...new Set(rows.map(r => r.id_usuario))].length
    };

    res.json({ 
      success: true, 
      data: rows.map(row => ({
        id: row.id,
        bien_id: row.id_bien,
        bien_nombre: row.bien_nombre,
        bien_codigo: row.bien_codigo,
        usuario_id: row.id_usuario,
        usuario_nombre: row.usuario_nombre,
        usuario_email: row.usuario_email,
        fecha_asignacion: row.fecha_asignacion,
        fecha_devolucion: row.fecha_devolucion,
        estado: row.activo === 1 ? 'activa' : 'devuelta',
        activo: row.activo === 1,
        observaciones: row.observaciones,
        created_at: row.fecha_asignacion
      })),
      stats
    });
  } catch (error) {
    console.error("[ERROR] GET /asignaciones:", error.message);
    res.json({ 
      success: true, 
      data: [], 
      stats: { total: 0, activas: 0, pendientes: 0, devueltas: 0, usuarios: 0 } 
    });
  }
});

// GET /asignaciones/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [row] = await query(`
      SELECT bu.*, 
             b.nombre as bien_nombre, b.codigo_institucional as bien_codigo,
             CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre
      FROM bien_usuario bu
      LEFT JOIN bienes b ON bu.id_bien = b.id_bien
      LEFT JOIN usuarios u ON bu.id_usuario = u.id_usuario
      WHERE bu.id = ?
    `, [id]);
    
    if (!row) {
      return res.status(404).json({ success: false, message: "Asignación no encontrada" });
    }

    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo asignación", error: error.message });
  }
});

// POST /asignaciones
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id_bien, id_usuario, observaciones } = req.body;

    if (!id_bien || !id_usuario) {
      return res.status(400).json({ success: false, message: "Bien y usuario son requeridos" });
    }

    // Desactivar asignaciones anteriores del mismo bien
    await query("UPDATE bien_usuario SET activo = 0, fecha_devolucion = NOW() WHERE id_bien = ? AND activo = 1", [id_bien]);

    const result = await query(
      `INSERT INTO bien_usuario (id_bien, id_usuario, activo, observaciones)
       VALUES (?, ?, 1, ?)`,
      [id_bien, id_usuario, observaciones || null]
    );

    res.json({ success: true, message: "Asignación creada", data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creando asignación", error: error.message });
  }
});

// PUT /asignaciones/:id
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { activo, observaciones } = req.body;

    let sql = "UPDATE bien_usuario SET observaciones = ?";
    const params = [observaciones || null];

    if (activo !== undefined) {
      sql += ", activo = ?";
      params.push(activo ? 1 : 0);
      
      if (!activo) {
        sql += ", fecha_devolucion = NOW()";
      }
    }

    sql += " WHERE id = ?";
    params.push(id);

    await query(sql, params);

    res.json({ success: true, message: "Asignación actualizada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando asignación", error: error.message });
  }
});

// DELETE /asignaciones/:id
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM bien_usuario WHERE id = ?", [id]);
    res.json({ success: true, message: "Asignación eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando asignación", error: error.message });
  }
});

module.exports = router;
