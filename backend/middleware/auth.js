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
    
    // DEBUG AUTH
    console.log(`[AUTH] Header received: ${authHeader ? 'YES' : 'NO'} - ${authHeader ? authHeader.substring(0, 20) + '...' : ''}`);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('[AUTH] Token missing or invalid format');
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


    // Obtener rol del usuario directamente desde usuarios.rol_id (la tabla usuario_rol no existe)
    let roles = [];
    try {
      // Consulta directa: usuarios tiene rol_id que apunta a roles.id_rol
      const result = await query(
        `SELECT r.nombre_rol as nombre 
         FROM usuarios u
         JOIN roles r ON u.rol_id = r.id_rol
         WHERE u.id_usuario = ?`,
        [decoded.id]
      );
      if (result && result.length > 0) {
        roles = result;
      }
    } catch (e) {
      console.error("[AUTH] Error obteniendo rol:", e.message);
      // Si falla, continuar sin roles (el usuario podrá acceder pero no tendrá permisos de admin)
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
