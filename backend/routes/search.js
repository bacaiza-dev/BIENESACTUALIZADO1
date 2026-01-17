// routes/search.js - Búsqueda global
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken } = require("../middleware/auth");

// GET /search?q=term&limit=50
router.get("/", verifyToken, async (req, res) => {
  try {
    const { q, limit = 50 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: { bienes: [], ubicaciones: [], usuarios: [] }
      });
    }

    const searchTerm = `%${q.trim()}%`;
    const limitNum = Math.min(parseInt(limit) || 50, 100);

    // Buscar bienes
    const bienes = await query(`
      SELECT 
        b.id_bien as id,
        b.codigo_institucional,
        b.nombre,
        b.clase_de_bien,
        b.estado,
        b.marca,
        b.modelo,
        c.nombre as categoria_nombre,
        u.nombre as ubicacion_nombre,
        CONCAT(usr.nombre, ' ', COALESCE(usr.apellido, '')) as responsable_nombre
      FROM bienes b
      LEFT JOIN categorias c ON b.id_categoria = c.id_categoria
      LEFT JOIN ubicaciones u ON b.id_ubicacion = u.id_ubicacion
      LEFT JOIN usuarios usr ON b.id_responsable = usr.id_usuario
      WHERE b.codigo_institucional LIKE ?
         OR b.nombre LIKE ?
         OR b.clase_de_bien LIKE ?
         OR b.marca LIKE ?
         OR b.modelo LIKE ?
         OR c.nombre LIKE ?
         OR u.nombre LIKE ?
         OR CONCAT(usr.nombre, ' ', COALESCE(usr.apellido, '')) LIKE ?
      ORDER BY b.nombre ASC
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);

    // Formatear bienes con estructura anidada
    const bienesFormatted = bienes.map(b => ({
      id: b.id,
      codigo_institucional: b.codigo_institucional,
      nombre: b.nombre,
      clase_de_bien: b.clase_de_bien,
      estado: b.estado,
      marca: b.marca,
      modelo: b.modelo,
      categoria: b.categoria_nombre ? { nombre: b.categoria_nombre } : null,
      ubicacion: b.ubicacion_nombre ? { nombre: b.ubicacion_nombre } : null,
      responsable: b.responsable_nombre ? { nombre: b.responsable_nombre } : null
    }));

    // Buscar ubicaciones
    const ubicaciones = await query(`
      SELECT 
        u.id_ubicacion as id,
        u.nombre,
        u.tipo,
        u.edificio,
        u.aula,
        u.piso,
        (SELECT COUNT(*) FROM bienes WHERE id_ubicacion = u.id_ubicacion) as bienesAsignados
      FROM ubicaciones u
      WHERE u.nombre LIKE ?
         OR u.tipo LIKE ?
         OR u.edificio LIKE ?
         OR u.aula LIKE ?
      ORDER BY u.nombre ASC
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);

    // Buscar usuarios (solo si es admin)
    let usuarios = [];
    const isAdmin = req.user?.roles?.includes('Admin') || req.user?.roles?.includes('Administrador');
    
    if (isAdmin) {
      usuarios = await query(`
        SELECT 
          id_usuario as id,
          nombre,
          apellido,
          email,
          cedula as documento,
          telefono,
          activo,
          departamento
        FROM usuarios
        WHERE nombre LIKE ?
           OR apellido LIKE ?
           OR email LIKE ?
           OR cedula LIKE ?
           OR departamento LIKE ?
        ORDER BY nombre ASC
        LIMIT ?
      `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    }

    res.json({
      success: true,
      data: {
        bienes: bienesFormatted,
        ubicaciones,
        usuarios
      }
    });

  } catch (error) {
    console.error("[ERROR] GET /search:", error.message);
    res.status(500).json({
      success: false,
      message: "Error en la búsqueda",
      error: error.message
    });
  }
});

module.exports = router;
