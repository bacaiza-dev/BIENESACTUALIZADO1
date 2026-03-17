// routes/periodos.js - CRUD de periodos académicos
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { mapPeriodoRow } = require("../helpers/mappers");

// GET /periodos-academicos - Listar periodos
// Por defecto devuelve solo periódicos activos; use ?inactive=1 para solo inactivos
router.get("/", verifyToken, async (req, res) => {
  try {
    const onlyInactive = req.query.inactive === '1' || req.query.inactive === 'true'
    const whereClause = onlyInactive ? 'WHERE p.activo = 0' : 'WHERE p.activo = 1'

    const rows = await query(`
      SELECT p.*,
      (SELECT COUNT(*) FROM bienes b WHERE b.periodo_id = p.id_periodo AND b.estado != 'BAJA') as bienes_count
      FROM periodos_academicos p
      ${whereClause}
      ORDER BY p.fecha_inicio DESC
    `);

    res.json({ success: true, data: rows.map(mapPeriodoRow) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo periodos",
      error: error.message,
    });
  }
});

// GET /periodos-academicos/:id - Obtener periodo por ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(
      "SELECT * FROM periodos_academicos WHERE id_periodo = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Periodo no encontrado",
      });
    }

    res.json({ success: true, data: mapPeriodoRow(rows[0]) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo periodo",
      error: error.message,
    });
  }
});

// POST /periodos-academicos - Crear periodo
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nombre_periodo, nombre, tipo, anio, fecha_inicio, fecha_fin, descripcion, activo } = req.body;

    const nombreValue = nombre_periodo || nombre;
    if (!nombreValue) {
      return res.status(400).json({
        success: false,
        message: "Nombre del periodo es requerido",
      });
    }

    // Validar nombre único (case-insensitive)
    const existing = await query(
      "SELECT id_periodo FROM periodos_academicos WHERE LOWER(nombre_periodo) = LOWER(?) LIMIT 1",
      [nombreValue]
    );
    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: "ya existe ese nombre",
      });
    }

    const result = await query(
      `INSERT INTO periodos_academicos 
       (nombre_periodo, tipo, anio, fecha_inicio, fecha_fin, descripcion, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombreValue, tipo || "semestre", anio || new Date().getFullYear(), fecha_inicio || null, fecha_fin || null, descripcion || null, activo !== false ? 1 : 0]
    );

    res.json({
      success: true,
      message: "Periodo creado correctamente",
      data: { id: result.insertId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creando periodo",
      error: error.message,
    });
  }
});

// PUT /periodos-academicos/:id - Actualizar periodo
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_periodo, nombre, tipo, anio, fecha_inicio, fecha_fin, descripcion, activo } = req.body;

    const nombreValue = nombre_periodo || nombre;

    // Validar nombre único si cambia
    const existing = await query(
      "SELECT id_periodo FROM periodos_academicos WHERE LOWER(nombre_periodo) = LOWER(?) AND id_periodo != ? LIMIT 1",
      [nombreValue, id]
    );
    if (existing.length) {
      return res.status(400).json({
        success: false,
        message: "ya existe ese nombre",
      });
    }

    await query(
      `UPDATE periodos_academicos 
       SET nombre_periodo = ?, tipo = ?, anio = ?, fecha_inicio = ?, fecha_fin = ?, descripcion = ?, activo = ?
       WHERE id_periodo = ?`,
      [nombreValue, tipo, anio, fecha_inicio, fecha_fin, descripcion, activo ? 1 : 0, id]
    );

    res.json({
      success: true,
      message: "Periodo actualizado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error actualizando periodo",
      error: error.message,
    });
  }
});

// DELETE /periodos-academicos/:id - Eliminar periodo
// Por defecto realiza soft-delete (activo = 0). Para eliminar definitivamente usar ?permanent=1
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === '1' || req.query.permanent === 'true'

    if (permanent) {
      // Verificar si tiene bienes asignados antes de eliminar definitivamente
      const bienes = await query(
        "SELECT COUNT(*) as count FROM bienes WHERE periodo_id = ? AND estado != 'BAJA'",
        [id]
      );

      if (bienes[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar período en uso: hay ${bienes[0].count} bien(es) asignado(s) a este período`,
        });
      }

      await query("DELETE FROM periodos_academicos WHERE id_periodo = ?", [id]);

      return res.json({
        success: true,
        message: "Período eliminado definitivamente",
      });
    } else {
      // Soft delete: desactivar el periodo
      await query("UPDATE periodos_academicos SET activo = 0 WHERE id_periodo = ?", [id]);

      return res.json({
        success: true,
        message: "Período desactivado correctamente",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error eliminando periodo",
      error: error.message,
    });
  }
});

// POST /periodos-academicos/:id/reactivate - Reactivar periodo
router.post("/:id/reactivate", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("UPDATE periodos_academicos SET activo = 1 WHERE id_periodo = ?", [id]);
    res.json({ success: true, message: "Período reactivado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error reactivando periodo", error: error.message });
  }
});

module.exports = router;
