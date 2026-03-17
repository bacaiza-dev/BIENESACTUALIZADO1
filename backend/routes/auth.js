// routes/auth.js - Rutas de autenticación
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const { verifyToken, JWT_SECRET } = require("../middleware/auth");
const { verifyPassword, hashPassword } = require("../helpers/password");
const { mapUserRow } = require("../helpers/mappers");

// Función para registrar logs del sistema
async function logSystemEvent(nivel, modulo, mensaje, detalles = null, usuarioId = null, ipAddress = null) {
  try {
    await query(
      `INSERT INTO logs_sistema (nivel, modulo, mensaje, detalles, usuario_id, ip_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nivel, modulo, mensaje, detalles, usuarioId, ipAddress]
    );
  } catch (error) {
    console.error('[ERROR] logSystemEvent:', error.message);
  }
}

async function getRolesByUserId(userId) {
  try {
    // Schema uses usuarios.rol_id directly, NOT usuario_rol table
    const rows = await query(
      `SELECT r.id_rol as id, r.nombre_rol as nombre, r.descripcion
       FROM roles r
       JOIN usuarios u ON r.id_rol = u.rol_id
       WHERE u.id_usuario = ?`,
      [userId]
    );
    return rows;
  } catch (e) {
    console.error('[ERROR] getRolesByUserId:', e.message);
    return [];
  }
}

async function getPermissionsByUserId(userId) {
  try {
    // Schema uses usuarios.rol_id directly and permisos.nombre_permiso
    const rows = await query(
      `SELECT DISTINCT p.id_permiso as id, p.nombre_permiso as nombre, p.descripcion
       FROM permisos p
       JOIN rol_permiso rp ON p.id_permiso = rp.permiso_id
       JOIN usuarios u ON rp.rol_id = u.rol_id
       WHERE u.id_usuario = ?`,
      [userId]
    );
    return rows;
  } catch (e) {
    console.error('[ERROR] getPermissionsByUserId:', e.message);
    return [];
  }
}

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const email = String(rawEmail || '').trim().toLowerCase();
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
    }

    const users = await query("SELECT * FROM usuarios WHERE LOWER(email) = ? AND activo = 1 LIMIT 1", [email]);
    if (!users.length) {
      // Log failed login attempt
      await logSystemEvent('warning', 'auth', `Intento de login fallido: usuario no encontrado`, `Email: ${email}`, null, req.ip);
      return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo' });
    }

    const user = users[0];
    if (!verifyPassword(password, user.password_hash)) {
      // Log failed password attempt
      await logSystemEvent('warning', 'auth', `Intento de login fallido: contraseña incorrecta`, `Usuario: ${user.email}`, user.id_usuario, req.ip);
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    let roles = await getRolesByUserId(user.id_usuario);
    if (!roles.length && user.rol_id) {
      try {
        const rs = await query('SELECT id_rol as id, nombre_rol as nombre, descripcion FROM roles WHERE id_rol = ? LIMIT 1', [user.rol_id]);
        if (rs.length) roles = rs;
      } catch (err) { /* fallthrough */ }
    }

    const token = jwt.sign({ id: user.id_usuario, email: user.email, roles: roles.map(r => r.nombre) }, JWT_SECRET, { expiresIn: '24h' });
    const permissions = await getPermissionsByUserId(user.id_usuario);

    // Log successful login
    await logSystemEvent('info', 'auth', `Login exitoso`, `Usuario: ${user.email}, Rol: ${roles.map(r => r.nombre).join(', ')}`, user.id_usuario, req.ip);

    res.json({ success: true, message: 'Login exitoso', data: {
      token,
      user: mapUserRow(user, roles),
      roles,
      permissions: permissions,
    } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en login', error: error.message });
  }
});

// POST /auth/refresh
router.post('/refresh', verifyToken, async (req, res) => {
  try {
    const roles = await getRolesByUserId(req.user.id);
    const token = jwt.sign({ id: req.user.id, email: req.user.email, roles: roles.map(r => r.nombre) }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, data: { token } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error refrescando token', error: error.message });
  }
});

// GET /auth/me (perfil completo)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const users = await query('SELECT * FROM usuarios WHERE id_usuario = ? LIMIT 1', [req.user.id]);
    if (!users.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    const user = users[0];
    const roles = await getRolesByUserId(user.id_usuario);
    const permissions = await getPermissionsByUserId(user.id_usuario);
    res.json({ success: true, data: { user: mapUserRow(user, roles), roles, permissions } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo perfil', error: error.message });
  }
});

// GET /auth/verify
router.get('/verify', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Token válido', data: { user: req.user } });
});

// Compatibility wrappers and aliases for backward compatibility
router.get('/verify-token', verifyToken, (req, res) => {
  res.json({ success: true, valid: true, data: { user: req.user } });
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [user] = await query('SELECT * FROM usuarios WHERE id_usuario = ? LIMIT 1', [req.user.id]);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    const roles = await getRolesByUserId(user.id_usuario);
    const permissions = await getPermissionsByUserId(user.id_usuario);
    res.json({ success: true, data: { user: mapUserRow(user, roles), roles, permissions } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error obteniendo perfil', error: err.message });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { nombre, apellido, email, cedula, telefono } = req.body;
    await query("UPDATE usuarios SET nombres = ?, apellidos = ?, email = ?, cedula = ?, telefono = ? WHERE id_usuario = ?", [nombre, apellido || null, email, cedula || null, telefono || null, req.user.id]);
    res.json({ success: true, message: 'Perfil actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error actualizando perfil', error: err.message });
  }
});

// POST /auth/change-password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const rows = await query('SELECT password_hash FROM usuarios WHERE id_usuario = ?', [req.user.id]);
    if (!rows || !rows.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    if (!verifyPassword(currentPassword, rows[0].password_hash)) {
      return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
    }
    const hash = hashPassword(newPassword);
    await query('UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?', [hash, req.user.id]);
    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error cambiando contraseña', error: err.message });
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    // Se omite envío real de correo para mantener seguridad en este patch
    res.json({ success: true, message: 'Enlace de recuperación enviado si el correo existe' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al resetear', error: err.message });
  }
});

module.exports = router;
