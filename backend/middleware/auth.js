// middleware/auth.js - Middleware de autenticación
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "sistema_bienes_jwt_secret_2024";

/**
 * Verificar token JWT
 */
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }

    // Obtener roles del usuario
    let roles = [];
    try {
      roles = await query(
        `SELECT r.nombre_rol as nombre 
         FROM roles r 
         JOIN usuario_rol ur ON r.id_rol = ur.rol_id 
         WHERE ur.usuario_id = ?`,
        [decoded.id]
      );
    } catch (e) {
      if (e.code === 'ER_NO_SUCH_TABLE') {
        try {
          const [user] = await query("SELECT rol_id FROM usuarios WHERE id_usuario = ?", [decoded.id]);
          if (user && user.rol_id) {
             const rs = await query("SELECT id_rol as id, nombre_rol as nombre FROM roles WHERE id_rol = ?", [user.rol_id]);
             if (rs.length) roles = rs;
          }
        } catch (err) {
          // ignore
        }
      } else {
        throw e;
      }
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: roles.map((r) => r.nombre),
    };
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error verificando token",
      error: error.message,
    });
  }
}

/**
 * Verificar si el usuario es administrador
 */
function isAdminUser(user) {
  return user?.roles?.some((r) => String(r).toLowerCase() === "administrador");
}

/**
 * Middleware para requerir rol de administrador
 */
function requireAdmin(req, res, next) {
  if (!isAdminUser(req.user)) {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado: se requiere rol de administrador",
    });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  isAdminUser,
  JWT_SECRET,
};
