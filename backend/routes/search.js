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

    // Buscar bienes - usando columnas correctas del esquema
    const bienes = await query(`
      SELECT 
        b.id_bien as id,
        b.codigo_institucional,
        b.nombre,
        b.clase_de_bien,
        b.estado,
        b.marca,
        b.modelo,
        c.nombre_categoria as categoria_nombre,
        u.area as ubicacion_nombre,
        CONCAT(usr.nombres, ' ', COALESCE(usr.apellidos, '')) as responsable_nombre
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
      LEFT JOIN usuarios usr ON b.responsable_id = usr.id_usuario
      WHERE b.codigo_institucional LIKE ?
         OR b.nombre LIKE ?
         OR b.clase_de_bien LIKE ?
         OR b.marca LIKE ?
         OR b.modelo LIKE ?
         OR c.nombre_categoria LIKE ?
         OR u.area LIKE ?
         OR CONCAT(usr.nombres, ' ', COALESCE(usr.apellidos, '')) LIKE ?
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

    // Buscar ubicaciones - usando columna 'area' como nombre
    const ubicaciones = await query(`
      SELECT 
        u.id_ubicacion as id,
        u.area as nombre,
        u.tipo,
        u.sede as edificio,
        u.numero_aula as aula,
        u.piso,
        (SELECT COUNT(*) FROM bienes WHERE ubicacion_id = u.id_ubicacion) as bienesAsignados
      FROM ubicaciones u
      WHERE u.area LIKE ?
         OR u.tipo LIKE ?
         OR u.sede LIKE ?
         OR u.numero_aula LIKE ?
      ORDER BY u.area ASC
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);

    // Buscar usuarios (solo si es admin) - usando nombres/apellidos
    let usuarios = [];
    const isAdmin = req.user?.roles?.includes('Admin') || req.user?.roles?.includes('Administrador');
    
    if (isAdmin) {
      const usuariosResult = await query(`
        SELECT 
          u.id_usuario as id,
          u.nombres as nombre,
          u.apellidos as apellido,
          u.email,
          u.cedula as documento,
          u.telefono,
          u.activo,
          d.nombre as departamento
        FROM usuarios u
        LEFT JOIN departamentos d ON u.departamento_id = d.id_departamento
        WHERE u.nombres LIKE ?
           OR u.apellidos LIKE ?
           OR u.email LIKE ?
           OR u.cedula LIKE ?
           OR d.nombre LIKE ?
        ORDER BY u.nombres ASC
        LIMIT ?
      `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
      
      usuarios = usuariosResult;
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
