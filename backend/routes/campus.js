// routes/campus.js - CRUD de campus (tabla: campus)
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /campus - Listar campus
router.get('/', verifyToken, async (req, res) => {
  try {
    // Tabla real: campus con columnas id_campus, nombre, descripcion, created_at, updated_at
    const rows = await query(`
      SELECT id_campus, nombre, descripcion, created_at, updated_at 
      FROM campus 
      ORDER BY nombre
    `);
    
    // Formatear para compatibilidad con frontend
    const data = rows.map(r => ({
      id: r.id_campus,
      id_campus: r.id_campus,
      nombre: r.nombre,
      descripcion: r.descripcion
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] GET /campus:", error.message);
    res.status(500).json({ success: false, message: 'Error al cargar campus', error: error.message });
  }
});

// GET /campus/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query('SELECT * FROM campus WHERE id_campus = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Campus no encontrado' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// POST /campus
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }

    const nombreClean = nombre.trim();

    // Verificar duplicado (case-insensitive)
    const dup = await query(
      'SELECT id_campus FROM campus WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) LIMIT 1',
      [nombreClean]
    );

    if (dup.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe un campus con ese nombre' });
    }
    
    const result = await query(
      'INSERT INTO campus (nombre, descripcion) VALUES (?, ?)',
      [nombreClean, descripcion || null]
    );
    
    res.json({ success: true, message: 'Campus creado', data: { id: result.insertId } });
  } catch (error) {
    // Manejar conflicto por índice único si existiera (doble protección)
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Ya existe un campus con ese nombre', error: error.message });
    }

    res.status(500).json({ success: false, message: 'Error creando campus', error: error.message });
  }
});

// PUT /campus/:id
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }

    const nombreClean = nombre.trim();

    // Verificar que no exista otro campus con el mismo nombre (case-insensitive)
    const dup = await query(
      'SELECT id_campus FROM campus WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND id_campus != ? LIMIT 1',
      [nombreClean, id]
    );

    if (dup.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe un campus con ese nombre' });
    }

    // Actualizar el campus
    await query(
      'UPDATE campus SET nombre = ?, descripcion = ? WHERE id_campus = ?',
      [nombreClean, descripcion || null, id]
    );

    res.json({ success: true, message: 'Campus actualizado' });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Ya existe un campus con ese nombre', error: error.message });
    }
    res.status(500).json({ success: false, message: 'Error actualizando', error: error.message });
  }
});

// DELETE /campus/:id
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el campus existe
    const campusRows = await query('SELECT * FROM campus WHERE id_campus = ?', [id]);
    if (campusRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campus no encontrado',
        inUse: false
      });
    }
    
    // Verificar si el campus está en uso (ubicaciones asociadas)
    const ubicacionesResult = await query(
      'SELECT COUNT(*) as count FROM ubicaciones WHERE id_campus = ?',
      [id]
    );
    
    const ubicacionesCount = ubicacionesResult[0]?.count || 0;
    
    if (ubicacionesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar. Este campus tiene ${ubicacionesCount} ubicación(es) asignada(s). Por favor, reasigne o elimine las ubicaciones primero.`,
        inUse: true,
        ubicacionesCount
      });
    }
    
    // Eliminar el campus
    await query('DELETE FROM campus WHERE id_campus = ?', [id]);
    res.json({ success: true, message: 'Campus eliminado correctamente' });
  } catch (error) {
    console.error("[ERROR] DELETE /campus/:id:", error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error eliminando campus', 
      error: error.message,
      inUse: false
    });
  }
});

module.exports = router;
