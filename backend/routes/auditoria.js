const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /auditoria/seleccionar - Agregar una selección de bien para auditoría
router.post('/seleccionar', async (req, res) => {
  const { id_usuario, id_bien } = req.body;

  if (!id_usuario || !id_bien) {
    return res.status(400).json({ success: false, message: 'id_usuario e id_bien son requeridos' });
  }

  try {
    // Insertar o actualizar si ya existe (ON DUPLICATE KEY UPDATE)
    const query = `
      INSERT INTO auditoria_selecciones (id_usuario, id_bien, estado)
      VALUES (?, ?, 'seleccionado')
      ON DUPLICATE KEY UPDATE fecha_seleccion = CURRENT_TIMESTAMP, estado = 'seleccionado'
    `;
    await db.query(query, [id_usuario, id_bien]);

    res.json({ success: true, message: 'Bien seleccionado para auditoría' });
  } catch (error) {
    console.error('Error al seleccionar bien para auditoría:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// DELETE /auditoria/deseleccionar - Remover una selección de bien para auditoría
router.delete('/deseleccionar', async (req, res) => {
  const { id_usuario, id_bien } = req.body;

  if (!id_usuario || !id_bien) {
    return res.status(400).json({ success: false, message: 'id_usuario e id_bien son requeridos' });
  }

  try {
    const query = 'DELETE FROM auditoria_selecciones WHERE id_usuario = ? AND id_bien = ?';
    const result = await db.query(query, [id_usuario, id_bien]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Bien removido de auditoría' });
    } else {
      res.status(404).json({ success: false, message: 'Selección no encontrada' });
    }
  } catch (error) {
    console.error('Error al deseleccionar bien de auditoría:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /auditoria/selecciones/:usuarioId - Obtener selecciones de bienes para un usuario
router.get('/selecciones/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;

  if (!usuarioId) {
    return res.status(400).json({ success: false, message: 'usuarioId es requerido' });
  }

  try {
    const query = `
      SELECT s.id, s.id_bien, b.nombre as nombre_bien, b.codigo_institucional as codigo, b.descripcion
      FROM auditoria_selecciones s
      LEFT JOIN bienes b ON s.id_bien = b.id_bien
      WHERE s.id_usuario = ? AND s.estado = 'seleccionado'
    `;
    const rows = await db.query(query, [usuarioId]);

    const bienesSeleccionados = [];

    for (const row of rows) {
      const bienId = row.id_bien;
      const asignacionQuery = 'SELECT id_usuario FROM asignaciones_bien WHERE id_bien = ? AND activo = 1 ORDER BY fecha_asignacion DESC LIMIT 1';
      const asignacion = await db.query(asignacionQuery, [bienId]);

      if (asignacion && asignacion.length > 0 && asignacion[0].id_usuario == usuarioId) {
        bienesSeleccionados.push({
          id_bien: bienId,
          nombre_bien: row.nombre_bien || '',
          codigo: row.codigo || '',
          descripcion: row.descripcion || ''
        });
      } else {
        // Si ya no pertenece al usuario actual, se limpia el registro para evitar duplicados
        await db.query('DELETE FROM auditoria_selecciones WHERE id = ?', [row.id]);
      }
    }

    res.json({ success: true, data: bienesSeleccionados });
  } catch (error) {
    console.error('Error al obtener selecciones de auditoría:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;