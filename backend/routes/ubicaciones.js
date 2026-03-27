// routes/ubicaciones.js - CRUD de ubicaciones
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { mapUbicacionRow } = require("../helpers/mappers");

// GET /ubicaciones - Listar ubicaciones
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search } = req.query;
    
    let sql = `
      SELECT u.*, 
             c.nombre as campus_nombre,
             (SELECT COUNT(*) FROM bienes WHERE ubicacion_id = u.id_ubicacion) as bienes_count
      FROM ubicaciones u
      LEFT JOIN campus c ON u.id_campus = c.id_campus
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      sql += " AND (u.descripcion LIKE ? OR u.numero_aula LIKE ? OR u.sede LIKE ? OR u.area LIKE ? OR c.nombre LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    sql += " ORDER BY u.numero_aula, u.descripcion";

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
      `SELECT u.*, c.nombre as campus_nombre
       FROM ubicaciones u
       LEFT JOIN campus c ON u.id_campus = c.id_campus
       WHERE u.id_ubicacion = ?`,
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
    const { nombre, descripcion, tipo, sede, edificio, piso, aula, numero_aula, capacidad, area, activo, estado, id_campus } = req.body;

    const sedeValue = sede || edificio || null;
    const aulaValue = numero_aula || aula || null;
    const areaValue = nombre || area || `aula-${Date.now()}`;
    
    let activoValue = 1;
    if (estado !== undefined) {
      activoValue = estado === "Activo" || estado === true || estado === 1 ? 1 : 0;
    } else if (activo !== undefined) {
      activoValue = activo ? 1 : 0;
    }

    const sql = `INSERT INTO ubicaciones (area, descripcion, sede, piso, numero_aula, capacidad, activo, id_campus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const params = [areaValue, descripcion || nombre || null, sedeValue, piso || null, aulaValue, capacidad || null, activoValue, id_campus || null];

    const result = await query(sql, params);

    res.json({
      success: true,
      message: "Ubicación creada correctamente",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("[ERROR] POST /ubicaciones:", error.message, error);
    // Detección de entrada duplicada (clave única uk_area)
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: "ya existe ese nombre",
        error: error.message,
      });
    }
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
    const { nombre, descripcion, tipo, sede, edificio, piso, aula, numero_aula, capacidad, area, activo, estado, id_campus } = req.body;

    const sedeValue = sede || edificio || null;
    const aulaValue = numero_aula || aula || null;
    const areaValue = nombre || area || null;


    let activoValue = 1;
    if (estado !== undefined) {
      // Aceptar valores con tolerancia (ej. 'Activo', 'activo', true, 1)
      const estadoStr = String(estado).toLowerCase()
      activoValue = estado === true || estado === 1 || estadoStr === 'activo' ? 1 : 0;
    } else if (activo !== undefined) {
      activoValue = activo ? 1 : 0;
    }

    // Si se intenta inactivar, validar que no tenga bienes asignados
    if (activoValue === 0) {
      const bienes = await query(
        "SELECT COUNT(*) as count FROM bienes WHERE ubicacion_id = ?",
        [id]
      );
      if (bienes[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: `Ubicación en uso: hay ${bienes[0].count} bien(es) asignado(s)`
        });
      }
    }

    // Validar id_campus si fue enviado para evitar errores de FK
    if (id_campus !== undefined && id_campus !== null) {
      const campusRows = await query('SELECT id_campus FROM campus WHERE id_campus = ?', [id_campus]);
      if (!campusRows.length) {
        return res.status(400).json({
          success: false,
          message: 'Campus no encontrado',
          detail: `id_campus ${id_campus} no existe`,
        });
      }
    }

    // Actualizar id_campus solo si se envía; si no, conservar el valor actual (evita NULL accidental)
    // Nota: usamos COALESCE(?, id_campus) para tolerar parámetros NULL/undefined sin sobrescribir la FK.
    const sql = `UPDATE ubicaciones 
       SET area = COALESCE(?, area), descripcion = ?, 
           sede = ?, piso = ?, numero_aula = ?, capacidad = ?, activo = ?, id_campus = COALESCE(?, id_campus)
       WHERE id_ubicacion = ?`;

    // DEBUG: en development mostramos el body recibido para facilitar trazabilidad
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEBUG] PUT /ubicaciones/:id body:', req.body);
    }

    const params = [areaValue, descripcion || nombre || null, sedeValue, piso || null, aulaValue, capacidad || null, activoValue, id_campus === undefined ? null : id_campus, id];

    await query(sql, params);

    res.json({
      success: true,
      message: "Ubicación actualizada correctamente",
    });
  } catch (error) {
    console.error("[ERROR] PUT /ubicaciones/:id", error.message);
    console.error(error.stack || error);
    // Detección de entrada duplicada (clave única uk_area)
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: "ya existe ese nombre",
        error: error.message,
        stack: error.stack,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error al actualizar ubicación",
      error: error.message,
      stack: error.stack,
    });
  }
});

// GET /ubicaciones/:id/custodios - Obtener historial de custodios
router.get("/:id/custodios", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(
      `SELECT aa.*, 
              CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre, u.email as usuario_email,
              p.nombre_periodo
       FROM aulas_asignadas aa
       JOIN usuarios u ON aa.usuario_id = u.id_usuario
       JOIN periodos_academicos p ON aa.periodo_id = p.id_periodo
       WHERE aa.ubicacion_id = ?
       ORDER BY p.fecha_inicio DESC, aa.created_at DESC`,
      [id]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener custodios",
      error: error.message,
    });
  }
});

// POST /ubicaciones/:id/custodios - Asignar custodia
router.post("/:id/custodios", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id, periodo_id, observaciones } = req.body;

    if (!usuario_id || !periodo_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Usuario y Periodo son requeridos" 
      });
    }

    // Verificar si ya existe asignación para este periodo (UNIQUE constraint)
    const existing = await query(
      "SELECT id FROM aulas_asignadas WHERE ubicacion_id = ? AND periodo_id = ?",
      [id, periodo_id]
    );

    if (existing.length) {
      // Actualizar existente
      await query(
        "UPDATE aulas_asignadas SET usuario_id = ?, observaciones = ?, activo = 1 WHERE id = ?",
        [usuario_id, observaciones || null, existing[0].id]
      );
    } else {
      // Crear nueva
      await query(
        "INSERT INTO aulas_asignadas (ubicacion_id, usuario_id, periodo_id, observaciones, activo) VALUES (?, ?, ?, ?, 1)",
        [id, usuario_id, periodo_id, observaciones || null]
      );
    }

    res.json({
      success: true,
      message: "Custodia asignada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al asignar custodia",
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
        message: `Ubicación en uso: hay ${bienes[0].count} bien(es) asignado(s)`,
      });
    }

    // Eliminar ubicación
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
