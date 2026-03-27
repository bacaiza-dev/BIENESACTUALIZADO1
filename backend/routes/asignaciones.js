// routes/asignaciones.js - Asignaciones de bienes a usuarios (tabla: asignaciones_bien)
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// GET /asignaciones - Listar asignaciones de bienes
router.get("/", verifyToken, async (req, res) => {
  try {
    const { usuario_id, bien_id, activo, search } = req.query;
    
    console.log(`[DEBUG] GET /asignaciones - Query params: usuario_id=${usuario_id}, bien_id=${bien_id}, activo=${activo}`);
    
    // Tabla real: asignaciones_bien
    let sql = `
      SELECT bu.id_asignacion as id, bu.*, 
             b.nombre as bien_nombre, b.codigo_institucional as bien_codigo,
             b.codigo_senescyt, b.ubicacion_id,
             ub.area as ubicacion_nombre,
             CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre, u.email as usuario_email
      FROM asignaciones_bien bu
      LEFT JOIN bienes b ON bu.id_bien = b.id_bien
      LEFT JOIN usuarios u ON bu.id_usuario = u.id_usuario
      LEFT JOIN ubicaciones ub ON b.ubicacion_id = ub.id_ubicacion
      WHERE 1=1
    `;
    const params = [];

    // Filtrar por usuario si se proporciona
    if (usuario_id) {
      sql += " AND bu.id_usuario = ?";
      params.push(parseInt(usuario_id)); // Convertir a número
      console.log(`[DEBUG] Filtrando por usuario_id: ${usuario_id} (tipo: ${typeof parseInt(usuario_id)})`);
    }

    // Filtrar por bien si se proporciona
    if (bien_id) {
      sql += " AND bu.id_bien = ?";
      params.push(bien_id);
    }

    // Si el cliente explícitamente indica 'activo', respetarlo.
    // Si no indica nada, por seguridad devolvemos sólo asignaciones activas.
    if (activo !== undefined) {
      sql += " AND bu.activo = ?";
      params.push(activo === 'true' || activo === '1' ? 1 : 0);
    } else {
      // Por defecto: sólo asignaciones activas
      sql += " AND bu.activo = ?";
      params.push(1);
      console.log('[DEBUG] Parámetro activo no especificado - aplicando filtro por activo=1 (por defecto)');
    }

    if (search) {
      sql += " AND (b.nombre LIKE ? OR b.codigo_institucional LIKE ? OR u.nombres LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += " ORDER BY bu.fecha_asignacion DESC";

    console.log(`[DEBUG] SQL Query: ${sql}`);
    console.log(`[DEBUG] Params: ${JSON.stringify(params)}`);

    const rows = await query(sql, params);
    console.log('[DEBUG] Resultados SQL asignaciones:', rows);
    
    console.log(`[DEBUG] Resultados encontrados: ${rows.length}`);
    
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
        bien: {
            id: row.id_bien,
            nombre: row.bien_nombre,
            codigo_institucional: row.bien_codigo,
            codigo: row.bien_codigo, // Alias for frontend compatibility
            codigo_senescyt: row.codigo_senescyt,
            ubicacion_id: row.ubicacion_id,
            ubicacion: row.ubicacion_id ? {
              id: row.ubicacion_id,
              nombre: row.ubicacion_nombre || 'Sin ubicación'
            } : null
        },
        usuario_id: row.id_usuario,
        usuario: {
            id: row.id_usuario,
            nombre: row.usuario_nombre ? row.usuario_nombre.split(' ')[0] : 'Sin',
            apellido: row.usuario_nombre ? row.usuario_nombre.split(' ').slice(1).join(' ') : 'Nombre',
            email: row.usuario_email,
            documento: 'N/A' // Added placeholder as query doesn't fetch cedula yet
        },
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
      SELECT bu.id_asignacion as id, bu.*, 
             b.nombre as bien_nombre, b.codigo_institucional as bien_codigo,
             CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre
      FROM asignaciones_bien bu
      LEFT JOIN bienes b ON bu.id_bien = b.id_bien
      LEFT JOIN usuarios u ON bu.id_usuario = u.id_usuario
      WHERE bu.id_asignacion = ?
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

    // Obtener el usuario anterior del bien (si existe)
    const previousAssignments = await query(
      "SELECT id_usuario FROM asignaciones_bien WHERE id_bien = ? AND activo = 1 LIMIT 1",
      [id_bien]
    );

    // Desactivar asignaciones anteriores del mismo bien
    await query("UPDATE asignaciones_bien SET activo = 0, fecha_devolucion = NOW() WHERE id_bien = ? AND activo = 1", [id_bien]);

    // Si el bien estaba constatado por otro usuario, migrar la constatación al nuevo usuario
    if (previousAssignments && previousAssignments.length > 0) {
      const previousUserId = previousAssignments[0].id_usuario;
      if (previousUserId !== id_usuario) {
        const existingTarget = await query(
          "SELECT id FROM auditoria_selecciones WHERE id_bien = ? AND id_usuario = ?",
          [id_bien, id_usuario]
        );

        if (existingTarget && existingTarget.length > 0) {
          // Ya existe registro para el nuevo usuario, eliminar el viejo
          await query(
            "DELETE FROM auditoria_selecciones WHERE id_bien = ? AND id_usuario = ?",
            [id_bien, previousUserId]
          );
        } else {
          // Cambiar el usuario del registro de auditoría
          await query(
            "UPDATE auditoria_selecciones SET id_usuario = ? WHERE id_bien = ? AND id_usuario = ?",
            [id_usuario, id_bien, previousUserId]
          );
        }

        // eliminar cualquier duplicado ocasional para (id_bien,id_usuario)
        await query(
          `DELETE t1 FROM auditoria_selecciones t1
           INNER JOIN auditoria_selecciones t2
           ON t1.id_bien = t2.id_bien AND t1.id_usuario = t2.id_usuario
           AND t1.id > t2.id`
        );
      }
    }

    const result = await query(
      `INSERT INTO asignaciones_bien (id_bien, id_usuario, activo, observaciones)
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
    const { activo, observaciones, estado, fecha_devolucion, id_usuario } = req.body;

    // Obtener asignación actual antes de la modificación
    const existing = await query("SELECT id_bien, id_usuario FROM asignaciones_bien WHERE id_asignacion = ?", [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: "Asignación no encontrada" });
    }

    const previousIdUsuario = existing[0].id_usuario;
    const idBien = existing[0].id_bien;

    let sql = "UPDATE asignaciones_bien SET observaciones = ?";
    const params = [observaciones || null];

    // Handle 'activo' or 'estado'
    let isActivo = activo;
    if (estado === 'devuelta' || estado === 'inactiva') {
      isActivo = false;
    } else if (estado === 'activa') {
      isActivo = true;
    }

    if (isActivo !== undefined) {
      sql += ", activo = ?";
      params.push(isActivo ? 1 : 0);

      if (!isActivo) {
        // Use provided date or NOW()
        sql += ", fecha_devolucion = ?";
        params.push(fecha_devolucion || new Date());
      }
    }

    if (id_usuario !== undefined && id_usuario !== null && id_usuario !== previousIdUsuario) {
      sql += ", id_usuario = ?";
      params.push(id_usuario);

      // Migrar auditoria si se cambia usuario sobre un bien activo
      const existingTarget = await query(
        "SELECT id FROM auditoria_selecciones WHERE id_bien = ? AND id_usuario = ?",
        [idBien, id_usuario]
      );

      if (existingTarget && existingTarget.length > 0) {
        await query(
          "DELETE FROM auditoria_selecciones WHERE id_bien = ? AND id_usuario = ?",
          [idBien, previousIdUsuario]
        );
      } else {
        await query(
          "UPDATE auditoria_selecciones SET id_usuario = ? WHERE id_bien = ? AND id_usuario = ?",
          [id_usuario, idBien, previousIdUsuario]
        );
      }

      await query(
        `DELETE t1 FROM auditoria_selecciones t1
          INNER JOIN auditoria_selecciones t2
          ON t1.id_bien = t2.id_bien AND t1.id_usuario = t2.id_usuario
          AND t1.id > t2.id`
      );
    }

    sql += " WHERE id_asignacion = ?";
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
    await query("DELETE FROM asignaciones_bien WHERE id_asignacion = ?", [id]);
    res.json({ success: true, message: "Asignación eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando asignación", error: error.message });
  }
});

module.exports = router;
