// routes/roles.js - Roles de usuarios
const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

// GET /roles - Listar roles
router.get('/', verifyToken, async (req, res) => {
  try {
    const roles = await query('SELECT id_rol as id, nombre_rol as nombre, descripcion FROM roles ORDER BY nombre_rol');
    res.json({ success: true, data: roles });
  } catch (err) {
    // Fallback si la tabla no existe
    res.json({ success: true, data: [
      { id: 1, nombre: 'Administrador' },
      { id: 2, nombre: 'Usuario' }
    ]});
  }
});

// GET /roles/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [role] = await query('SELECT id_rol as id, nombre_rol as nombre, descripcion FROM roles WHERE id_rol = ?', [id]);
    if (!role) return res.status(404).json({ success: false, message: 'Rol no encontrado' });
    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

module.exports = router;
