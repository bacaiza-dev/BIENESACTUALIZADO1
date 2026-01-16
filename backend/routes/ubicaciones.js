// routes/ubicaciones.js - CRUD de ubicaciones
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { mapUbicacionRow } = require("../helpers/mappers");

// GET /ubicaciones - Listar ubicaciones
router.get("/", verifyToken, async (req, res) => {
  try {
    const { tipo, activo, search } = req.query;
    
    let sql = `
      SELECT u.*, 
             (SELECT COUNT(*) FROM bienes WHERE ubicacion_id = u.id_ubicacion) as bienes_count
      FROM ubicaciones u
      WHERE 1=1
    `;
    const params = [];

    if (tipo) {
      sql += " AND u.tipo = ?";
      params.push(tipo.toLowerCase());
    }
    if (activo !== undefined) {
      sql += " AND u.activo = ?";
      params.push(activo === "true" ? 1 : 0);
    }
    if (search) {
      sql += " AND (u.descripcion LIKE ? OR u.numero_aula LIKE ? OR u.sede LIKE ? OR u.area LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += " ORDER BY u.tipo, u.numero_aula, u.descripcion";

    const rows = await query(sql, params);
    res.json({ success: true, data: rows.map(mapUbicacionRow) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener ubicaciones",
      error: error.message,
    });
  }
});

// GET /ubicaciones/:id - Obtener ubicación por ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(
      "SELECT * FROM ubicaciones WHERE id_ubicacion = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Ubicación no encontrada",
      });
    }

    res.json({ success: true, data: mapUbicacionRow(rows[0]) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener ubicación",
      error: error.message,
    });
  }
});

// POST /ubicaciones - Crear ubicación
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, tipo, sede, edificio, piso, aula, numero_aula, capacidad, area, activo, estado } = req.body;

    // Validación
    if (!tipo) {
      return res.status(400).json({
        success: false,
        message: "El tipo es requerido",
      });
    }

    // Convertir tipo a minúsculas para ENUM
    const tipoLower = tipo.toLowerCase();
    const tiposValidos = ["oficina", "laboratorio", "aula", "biblioteca", "almacen", "otro"];
    if (!tiposValidos.includes(tipoLower)) {
      return res.status(400).json({
        success: false,
        message: `Tipo inválido. Valores permitidos: ${tiposValidos.join(", ")}`,
      });
    }

    // Mapear campos
    const sedeValue = sede || edificio || null;
    const aulaValue = numero_aula || aula || null;
    const areaValue = nombre || area || `${tipoLower}-${Date.now()}`;
    
    let activoValue = 1;
    if (estado !== undefined) {
      activoValue = estado === "Activo" || estado === true || estado === 1 ? 1 : 0;
    } else if (activo !== undefined) {
      activoValue = activo ? 1 : 0;
    }

    const result = await query(
      `INSERT INTO ubicaciones (area, descripcion, tipo, sede, piso, numero_aula, capacidad, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [areaValue, descripcion || nombre || null, tipoLower, sedeValue, piso || null, aulaValue, capacidad || null, activoValue]
    );

    res.json({
      success: true,
      message: "Ubicación creada correctamente",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("Error creando ubicación:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear ubicación",
      error: error.message,
    });
  }
});

// PUT /ubicaciones/:id - Actualizar ubicación
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, tipo, sede, edificio, piso, aula, numero_aula, capacidad, area, activo, estado } = req.body;

    const tipoLower = tipo ? tipo.toLowerCase() : null;
    const sedeValue = sede || edificio || null;
    const aulaValue = numero_aula || aula || null;
    const areaValue = nombre || area || null;

    let activoValue = 1;
    if (estado !== undefined) {
      activoValue = estado === "Activo" || estado === true || estado === 1 ? 1 : 0;
    } else if (activo !== undefined) {
      activoValue = activo ? 1 : 0;
    }

    await query(
      `UPDATE ubicaciones 
       SET area = COALESCE(?, area), descripcion = ?, tipo = COALESCE(?, tipo), 
           sede = ?, piso = ?, numero_aula = ?, capacidad = ?, activo = ?
       WHERE id_ubicacion = ?`,
      [areaValue, descripcion || nombre || null, tipoLower, sedeValue, piso || null, aulaValue, capacidad || null, activoValue, id]
    );

    res.json({
      success: true,
      message: "Ubicación actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar ubicación",
      error: error.message,
    });
  }
});

// DELETE /ubicaciones/:id - Eliminar ubicación
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene bienes asignados
    const bienes = await query(
      "SELECT COUNT(*) as count FROM bienes WHERE ubicacion_id = ?",
      [id]
    );
    
    if (bienes[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar: hay ${bienes[0].count} bienes asignados`,
      });
    }

    await query("DELETE FROM ubicaciones WHERE id_ubicacion = ?", [id]);

    res.json({
      success: true,
      message: "Ubicación eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar ubicación",
      error: error.message,
    });
  }
});

module.exports = router;
