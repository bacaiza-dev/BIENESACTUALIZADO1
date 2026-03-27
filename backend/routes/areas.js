// routes/areas.js - CRUD de áreas (tabla: areas)
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /areas - Listar todas las áreas
router.get('/', verifyToken, async (req, res) => {
  try {
    // Tabla real: areas con columnas id, nombre, descripcion, created_at
    const rows = await query(`
      SELECT id, nombre, descripcion, created_at 
      FROM areas 
      ORDER BY nombre
    `);
    
    // Formatear para compatibilidad con frontend (soportar id_area también)
    const data = rows.map(r => ({
      id: r.id,
      id_area: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] GET /areas:", error.message);
    res.status(500).json({ success: false, message: 'Error al cargar áreas', error: error.message });
  }
});

// GET /areas/:id - Obtener una área específica
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query('SELECT * FROM areas WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Área no encontrada' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// POST /areas - Crear una nueva área
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }

    const nombreClean = nombre.trim();

    // Verificar duplicado (case-insensitive)
    const dup = await query(
      'SELECT id FROM areas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) LIMIT 1',
      [nombreClean]
    );

    if (dup.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe un área con ese nombre' });
    }
    
    const result = await query(
      'INSERT INTO areas (nombre, descripcion) VALUES (?, ?)',
      [nombreClean, descripcion || null]
    );
    
    res.json({ success: true, message: 'Área creada', data: { id: result.insertId } });
  } catch (error) {
    // Manejar conflicto por índice único si existiera
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Ya existe un área con ese nombre', error: error.message });
    }

    res.status(500).json({ success: false, message: 'Error creando área', error: error.message });
  }
});

// PUT /areas/:id - Actualizar una área
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }

    const nombreClean = nombre.trim();

    // Verificar que no exista otra área con el mismo nombre (case-insensitive)
    const dup = await query(
      'SELECT id FROM areas WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND id != ? LIMIT 1',
      [nombreClean, id]
    );

    if (dup.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe otro área con ese nombre' });
    }
    
    const result = await query(
      'UPDATE areas SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombreClean, descripcion || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Área no encontrada' });
    }
    
    res.json({ success: true, message: 'Área actualizada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error actualizando área', error: error.message });
  }
});

// DELETE /areas/:id - Eliminar un área
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que no hay usuarios asignados a esta área
    const usuariosEnArea = await query(
      'SELECT COUNT(*) as count FROM usuarios WHERE area_id = ?',
      [id]
    );
    
    if (usuariosEnArea[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `No se puede eliminar esta área. Hay ${usuariosEnArea[0].count} usuario(s) asignado(s) a ella` 
      });
    }
    
    const result = await query('DELETE FROM areas WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Área no encontrada' });
    }
    
    res.json({ success: true, message: 'Área eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error eliminando área', error: error.message });
  }
});

module.exports = router;
