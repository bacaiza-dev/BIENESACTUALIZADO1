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
      descripcion: r.descripcion,
      activo: r.activo === 1
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] GET /departamentos:", error.message);
    // Fallback si hay error
    res.json({ success: true, data: [
      { id: 1, id_departamento: 1, nombre: 'Administracion', activo: true },
      { id: 2, id_departamento: 2, nombre: 'Sistemas', activo: true }
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
    const { nombre, descripcion, activo } = req.body;
    
    await query(
      'UPDATE departamentos SET nombre = ?, descripcion = ?, activo = ? WHERE id_departamento = ?',
      [nombre, descripcion || null, activo !== false ? 1 : 0, id]
    );
    
    res.json({ success: true, message: 'Departamento actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error actualizando', error: error.message });
  }
});

// DELETE /departamentos/:id
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE departamentos SET activo = 0 WHERE id_departamento = ?', [id]);
    res.json({ success: true, message: 'Departamento desactivado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error eliminando', error: error.message });
  }
});

module.exports = router;
