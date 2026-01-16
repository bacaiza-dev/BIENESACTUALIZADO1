// routes/periodos.js - CRUD de periodos académicos
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { mapPeriodoRow } = require("../helpers/mappers");

// GET /periodos-academicos - Listar periodos
router.get("/", verifyToken, async (req, res) => {
  try {
    const rows = await query(`
      SELECT * FROM periodos_academicos
      ORDER BY fecha_inicio DESC
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
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene asignaciones
    const asignaciones = await query(
      "SELECT COUNT(*) as count FROM aulas_asignadas WHERE periodo_id = ?",
      [id]
    );

    if (asignaciones[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar: hay ${asignaciones[0].count} asignaciones en este periodo`,
      });
    }

    await query("DELETE FROM periodos_academicos WHERE id_periodo = ?", [id]);

    res.json({
      success: true,
      message: "Periodo eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error eliminando periodo",
      error: error.message,
    });
  }
});

module.exports = router;
