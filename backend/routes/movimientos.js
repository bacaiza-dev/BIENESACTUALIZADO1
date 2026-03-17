// routes/movimientos.js - Gestión de ubicación de bienes (Schema V3)
// Nota: La tabla histórica 'bien_ubicacion' fue eliminada en V3.
// Este endpoint ahora gestiona la actualización de ubicación actual en la tabla 'bienes'.

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /movimientos - Historial no disponible en V3
router.get('/', verifyToken, async (req, res) => {
  // En Schema V3 no hay tabla de historial de ubicaciones.
  // Devolvemos array vacío para no romper el frontend.
  res.json({ success: true, data: [] });
});

// POST /movimientos - Actualizar ubicación del bien (Transferencia)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bien_id, ubicacion_destino_id, observaciones } = req.body;
    
    if (!bien_id || !ubicacion_destino_id) {
      return res.status(400).json({ success: false, message: 'Bien y ubicación destino son requeridos' });
    }

    // Actualizar ubicación actual en tabla bienes
    await query(
        'UPDATE bienes SET ubicacion_id = ?, observaciones = ? WHERE id_bien = ?', 
        [ubicacion_destino_id, observaciones || null, bien_id]
    );
    
    // Opcional: Registrar en auditoria si existiera tal funcionalidad automatizada
    // Por ahora, solo actualizamos el estado actual.

    res.json({ success: true, message: 'Ubicación actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error actualizando ubicación', error: error.message });
  }
});

module.exports = router;
