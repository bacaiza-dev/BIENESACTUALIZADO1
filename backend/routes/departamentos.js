// routes/departamentos.js - CRUD de departamentos (tabla: departamentos)
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /departamentos - Listar departamentos
router.get('/', verifyToken, async (req, res) => {
  try {
    // Tabla real: departamentos con columnas id_departamento, nombre, descripcion, activo
    const rows = await query(`
      SELECT id_departamento, nombre, descripcion, activo 
      FROM departamentos 
      WHERE activo = 1
      ORDER BY nombre
    `);
    
    // Formatear para compatibilidad con frontend
    const data = rows.map(r => ({
      id: r.id_departamento,
      id_departamento: r.id_departamento,
      nombre: r.nombre,
      descripcion: r.descripcion
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] GET /departamentos:", error.message);
    // Fallback si hay error
    res.json({ success: true, data: [
      { id: 1, id_departamento: 1, nombre: 'Administracion' },
      { id: 2, id_departamento: 2, nombre: 'Sistemas' }
    ]});
  }
});

// GET /departamentos/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [row] = await query('SELECT * FROM departamentos WHERE id_departamento = ?', [id]);
    
    if (!row) {
      return res.status(404).json({ success: false, message: 'Departamento no encontrado' });
    }
    
    res.json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// POST /departamentos
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }
    
    const result = await query(
      'INSERT INTO departamentos (nombre, descripcion, activo) VALUES (?, ?, 1)',
      [nombre, descripcion || null]
    );
    
    res.json({ success: true, message: 'Departamento creado', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creando departamento', error: error.message });
  }
});

// PUT /departamentos/:id
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    // Obtener el nombre anterior para actualizar ubicaciones
    const [dept] = await query('SELECT nombre FROM departamentos WHERE id_departamento = ?', [id]);
    const nombreAnterior = dept?.nombre;
    
    // Actualizar el departamento
    await query(
      'UPDATE departamentos SET nombre = ?, descripcion = ? WHERE id_departamento = ?',
      [nombre, descripcion || null, id]
    );
    
    // Si cambió el nombre, actualizar también las ubicaciones que usen este campus
    if (nombreAnterior && nombreAnterior !== nombre) {
      await query(
        'UPDATE ubicaciones SET sede = ? WHERE sede = ?',
        [nombre, nombreAnterior]
      );
    }
    
    res.json({ success: true, message: 'Campus actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error actualizando', error: error.message });
  }
});

// DELETE /departamentos/:id - Desactivar departamento
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el campus está en uso (tiene ubicaciones asociadas)
    const ubicaciones = await query(
      'SELECT COUNT(*) as count FROM ubicaciones WHERE sede = (SELECT nombre FROM departamentos WHERE id_departamento = ?)',
      [id]
    );
    
    if (ubicaciones[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Campus en uso: hay ${ubicaciones[0].count} ubicación(es) asignada(s)`
      });
    }
    
    // Desactivar el campus
    await query('UPDATE departamentos SET activo = 0 WHERE id_departamento = ?', [id]);
    res.json({ success: true, message: 'Campus desactivado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error desactivando campus', error: error.message });
  }
});

module.exports = router;
