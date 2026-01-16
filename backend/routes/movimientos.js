// routes/movimientos.js - Historial de movimientos de bienes (tabla: bien_ubicacion)
// Nota: No existe tabla "movimientos" en el esquema, usamos bien_ubicacion para el historial
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /movimientos - Listar movimientos/historial de ubicaciones
router.get('/', verifyToken, async (req, res) => {
  try {
    const { bien_id, ubicacion_id } = req.query;
    
    // Usar bien_ubicacion como tabla de historial de movimientos
    let sql = `
      SELECT bu.*, 
             b.nombre as bien_nombre, b.codigo_institucional as bien_codigo,
             u.area as ubicacion_nombre, u.sede as ubicacion_sede
      FROM bien_ubicacion bu
      LEFT JOIN bienes b ON bu.id_bien = b.id_bien
      LEFT JOIN ubicaciones u ON bu.id_ubicacion = u.id_ubicacion
      WHERE 1=1
    `;
    const params = [];

    if (bien_id) {
      sql += ' AND bu.id_bien = ?';
      params.push(bien_id);
    }

    if (ubicacion_id) {
      sql += ' AND bu.id_ubicacion = ?';
      params.push(ubicacion_id);
    }

    sql += ' ORDER BY bu.fecha_asignacion DESC LIMIT 100';

    const rows = await query(sql, params);
    
    res.json({ 
      success: true, 
      data: rows.map(row => ({
        id: row.id,
        bien_id: row.id_bien,
        bien_nombre: row.bien_nombre,
        bien_codigo: row.bien_codigo,
        ubicacion_id: row.id_ubicacion,
        ubicacion_nombre: row.ubicacion_nombre,
        ubicacion_sede: row.ubicacion_sede,
        tipo: row.activo === 1 ? 'asignacion' : 'retiro',
        fecha: row.fecha_asignacion,
        fecha_asignacion: row.fecha_asignacion,
        fecha_retiro: row.fecha_retiro,
        activo: row.activo === 1,
        observaciones: row.observaciones
      }))
    });
  } catch (error) {
    console.error("[ERROR] GET /movimientos:", error.message);
    res.json({ success: true, data: [] });
  }
});

// POST /movimientos - Crear movimiento (transferencia de ubicación)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bien_id, ubicacion_destino_id, observaciones } = req.body;
    
    if (!bien_id || !ubicacion_destino_id) {
      return res.status(400).json({ success: false, message: 'Bien y ubicación destino son requeridos' });
    }

    // Desactivar asignación actual
    await query(
      'UPDATE bien_ubicacion SET activo = 0, fecha_retiro = NOW() WHERE id_bien = ? AND activo = 1',
      [bien_id]
    );

    // Crear nueva asignación
    const result = await query(
      `INSERT INTO bien_ubicacion (id_bien, id_ubicacion, activo, observaciones)
       VALUES (?, ?, 1, ?)`,
      [bien_id, ubicacion_destino_id, observaciones || 'Transferencia de ubicación']
    );

    // Actualizar ubicación en bienes (si tiene columna ubicacion_id)
    try {
      await query('UPDATE bienes SET ubicacion_id = ? WHERE id_bien = ?', [ubicacion_destino_id, bien_id]);
    } catch (e) {
      // Ignorar si no existe la columna
    }

    res.json({ success: true, message: 'Movimiento registrado', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creando movimiento', error: error.message });
  }
});

module.exports = router;
