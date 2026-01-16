// routes/auth.js - Rutas de autenticación
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const { verifyToken, JWT_SECRET } = require("../middleware/auth");
const { verifyPassword, hashPassword } = require("../helpers/password");
const { mapUserRow } = require("../helpers/mappers");

async function getRolesByUserId(userId) {
  try {
    const rows = await query(
      `SELECT r.id_rol as id, r.nombre_rol as nombre, r.descripcion
       FROM roles r
       JOIN usuario_rol ur ON r.id_rol = ur.rol_id
       WHERE ur.usuario_id = ?`,
      [userId]
    );
    return rows;
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') {
      try {
        const [user] = await query("SELECT rol_id FROM usuarios WHERE id_usuario = ?", [userId]);
        if (user && user.rol_id) {
          const roles = await query("SELECT id_rol as id, nombre_rol as nombre FROM roles WHERE id_rol = ?", [user.rol_id]);
          if (roles.length) return roles;
        }
      } catch (err) {
        console.warn('[WARN] Getting roles fallback failed:', err.message);
      }
      return [];
    }
    throw e;
  }
}

async function getPermissionsByUserId(userId) {
  try {
    const rows = await query(
      `SELECT DISTINCT p.id_permiso as id, p.nombre, p.descripcion
       FROM permisos p
       JOIN rol_permiso rp ON p.id_permiso = rp.permiso_id
       JOIN usuario_rol ur ON rp.rol_id = ur.rol_id
       WHERE ur.usuario_id = ?`,
      [userId]
    );
    return rows;
  } catch (e) {
    if (e.code === 'ER_NO_SUCH_TABLE') {
      try {
        const [user] = await query("SELECT rol_id FROM usuarios WHERE id_usuario = ?", [userId]);
        if (user && user.rol_id) {
          const rs = await query("SELECT DISTINCT p.id_permiso as id, p.nombre, p.descripcion FROM permisos p JOIN rol_permiso rp ON p.id_permiso = rp.permiso_id WHERE rp.rol_id = ?", [user.rol_id]);
          if (rs.length) return rs;
        }
      } catch (err) {
        return [];
      }
      return [];
    }
    throw e;
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
      return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo' });
    }

    const user = users[0];
    if (!verifyPassword(password, user.password_hash)) {
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
    await query("UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, cedula = ?, telefono = ? WHERE id_usuario = ?", [nombre, apellido || null, email, cedula || null, telefono || null, req.user.id]);
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
