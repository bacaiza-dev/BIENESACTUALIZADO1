// routes/usuarios.js - CRUD de usuarios
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { hashPassword } = require("../helpers/password");

// Mapper local para usuarios con todos los campos que el frontend espera
function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id_usuario,
    nombre: row.nombres,
    apellido: row.apellidos,
    nombres: row.nombres,
    apellidos: row.apellidos,
    email: row.email,
    cedula: row.cedula,
    documento: row.cedula, // Alias para frontend
    telefono: row.telefono,
    departamento_id: row.departamento_id,
    departamento: row.departamento_nombre || null,
    rol_id: row.rol_id,
    rol: row.rol_nombre || 'Sin rol',
    roles: row.rol_nombre ? [row.rol_nombre] : [],
    activo: row.activo === 1,
    estado: row.activo === 1 ? 'activo' : 'inactivo', // lowercase para comparación
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// GET /usuarios - Listar usuarios
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search, activo } = req.query;
    
    // Incluir JOIN con roles y departamentos para obtener nombres
    let sql = `
      SELECT u.*, r.nombre_rol as rol_nombre, d.nombre as departamento_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id_rol
      LEFT JOIN departamentos d ON u.departamento_id = d.id_departamento
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += " AND (u.nombres LIKE ? OR u.apellidos LIKE ? OR u.email LIKE ? OR u.cedula LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (activo !== undefined) {
      sql += " AND u.activo = ?";
      params.push(activo === "true" ? 1 : 0);
    }

    sql += " ORDER BY u.nombres, u.apellidos";

    const users = await query(sql, params);

    res.json({ success: true, data: users.map(mapUserRow) });
  } catch (error) {
    console.error("[ERROR] GET /usuarios:", error.message);
    res.json({ success: true, data: [] });
  }
});

// GET /usuarios/:id - Obtener usuario por ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const users = await query(`
      SELECT u.*, r.nombre_rol as rol_nombre, d.nombre as departamento_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id_rol
      LEFT JOIN departamentos d ON u.departamento_id = d.id_departamento
      WHERE u.id_usuario = ?
    `, [id]);

    if (!users.length) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, data: mapUserRow(users[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo usuario", error: error.message });
  }
});

// POST /usuarios - Crear usuario
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nombres, apellidos, email, password, cedula, telefono, rol_id, departamento_id, activo } = req.body;

    if (!nombres || !email || !password) {
      return res.status(400).json({ success: false, message: "Nombres, email y contraseña son requeridos" });
    }

    const existing = await query("SELECT id_usuario FROM usuarios WHERE LOWER(email) = ?", [email.toLowerCase()]);

    if (existing.length) {
      return res.status(400).json({ success: false, message: "El email ya está registrado" });
    }

    const passwordHash = hashPassword(password);

    const result = await query(
      `INSERT INTO usuarios (nombres, apellidos, email, password_hash, cedula, telefono, rol_id, departamento_id, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos || null, email.toLowerCase(), passwordHash, cedula || null, telefono || null, rol_id || null, departamento_id || null, activo !== false ? 1 : 0]
    );

    res.json({ success: true, message: "Usuario creado", data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creando usuario", error: error.message });
  }
});

// PUT /usuarios/:id - Actualizar usuario
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, email, password, cedula, telefono, activo, rol_id, departamento_id } = req.body;

    let sql = "UPDATE usuarios SET nombres = ?, apellidos = ?, email = ?, cedula = ?, telefono = ?, activo = ?, rol_id = ?, departamento_id = ?";
    const params = [nombres, apellidos || null, email, cedula || null, telefono || null, activo ? 1 : 0, rol_id || null, departamento_id || null];

    if (password) {
      sql += ", password_hash = ?";
      params.push(hashPassword(password));
    }

    sql += " WHERE id_usuario = ?";
    params.push(id);

    await query(sql, params);

    res.json({ success: true, message: "Usuario actualizado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando usuario", error: error.message });
  }
});

// DELETE /usuarios/:id - Desactivar usuario
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("UPDATE usuarios SET activo = 0 WHERE id_usuario = ?", [id]);
    res.json({ success: true, message: "Usuario desactivado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando usuario", error: error.message });
  }
});

// GET /usuarios/:id/roles
router.get("/:id/roles", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await query("SELECT rol_id FROM usuarios WHERE id_usuario = ?", [id]);
    if (user && user.rol_id) {
      const roles = await query("SELECT id_rol as id, nombre_rol as nombre FROM roles WHERE id_rol = ?", [user.rol_id]);
      res.json({ success: true, data: roles });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
