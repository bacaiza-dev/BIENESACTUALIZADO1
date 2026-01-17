// routes/search.js - Búsqueda global unificada
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken } = require("../middleware/auth");

// GET /search?q=term&limit=100
router.get("/", verifyToken, async (req, res) => {
  try {
    const { q, limit = 100 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: { resultados: [], total: 0 }
      });
    }

    const searchTerm = `%${q.trim()}%`;
    const limitNum = Math.min(parseInt(limit) || 100, 200);
    const isAdmin = req.user?.roles?.includes('Admin') || req.user?.roles?.includes('Administrador');

    let resultados = [];

    // 1. Buscar BIENES
    const bienes = await query(`
      SELECT 
        b.id_bien as id,
        'Bien' as tipo,
        b.nombre as titulo,
        CONCAT('Código: ', b.codigo_institucional, ' | Estado: ', b.estado, 
               COALESCE(CONCAT(' | Marca: ', b.marca), ''),
               COALESCE(CONCAT(' | Ubicación: ', u.area), '')) as descripcion,
        b.created_at as fecha
      FROM bienes b
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
      WHERE b.codigo_institucional LIKE ?
         OR b.nombre LIKE ?
         OR b.clase_de_bien LIKE ?
         OR b.marca LIKE ?
         OR b.modelo LIKE ?
         OR b.serie LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    resultados = resultados.concat(bienes);

    // 2. Buscar UBICACIONES/AULAS
    const ubicaciones = await query(`
      SELECT 
        id_ubicacion as id,
        'Ubicación' as tipo,
        area as titulo,
        CONCAT('Tipo: ', tipo, ' | Sede: ', COALESCE(sede, 'N/A'), 
               COALESCE(CONCAT(' | Aula: ', numero_aula), ''),
               COALESCE(CONCAT(' | Piso: ', piso), '')) as descripcion,
        created_at as fecha
      FROM ubicaciones
      WHERE area LIKE ?
         OR tipo LIKE ?
         OR sede LIKE ?
         OR numero_aula LIKE ?
         OR descripcion LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    resultados = resultados.concat(ubicaciones);

    // 3. Buscar USUARIOS (solo admin)
    if (isAdmin) {
      const usuarios = await query(`
        SELECT 
          u.id_usuario as id,
          'Usuario' as tipo,
          CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) as titulo,
          CONCAT('Email: ', u.email, 
                 COALESCE(CONCAT(' | Cédula: ', u.cedula), ''),
                 COALESCE(CONCAT(' | Depto: ', d.nombre), ''),
                 ' | ', IF(u.activo, 'Activo', 'Inactivo')) as descripcion,
          u.created_at as fecha
        FROM usuarios u
        LEFT JOIN departamentos d ON u.departamento_id = d.id_departamento
        WHERE u.nombres LIKE ?
           OR u.apellidos LIKE ?
           OR u.email LIKE ?
           OR u.cedula LIKE ?
        LIMIT ?
      `, [searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
      resultados = resultados.concat(usuarios);
    }

    // 4. Buscar CATEGORÍAS
    const categorias = await query(`
      SELECT 
        id_categoria as id,
        'Categoría' as tipo,
        nombre_categoria as titulo,
        CONCAT('Código: ', COALESCE(codigo, 'N/A'), ' | Tipo: ', COALESCE(tipo, 'N/A'),
               COALESCE(CONCAT(' | ', descripcion), '')) as descripcion,
        created_at as fecha
      FROM categorias
      WHERE nombre_categoria LIKE ?
         OR codigo LIKE ?
         OR tipo LIKE ?
         OR descripcion LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    resultados = resultados.concat(categorias);

    // 5. Buscar MANTENIMIENTOS
    const mantenimientos = await query(`
      SELECT 
        m.id_mantenimiento as id,
        'Mantenimiento' as tipo,
        CONCAT('Mantenimiento #', m.id_mantenimiento, ' - ', b.nombre) as titulo,
        CONCAT('Tipo: ', m.tipo, ' | Estado: ', m.estado, 
               ' | Prioridad: ', m.prioridad,
               COALESCE(CONCAT(' | ', m.descripcion), '')) as descripcion,
        m.created_at as fecha
      FROM mantenimientos m
      LEFT JOIN bienes b ON m.id_bien = b.id_bien
      WHERE m.descripcion LIKE ?
         OR m.observaciones LIKE ?
         OR m.tipo LIKE ?
         OR m.estado LIKE ?
         OR b.nombre LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    resultados = resultados.concat(mantenimientos);

    // 6. Buscar ALERTAS
    const alertas = await query(`
      SELECT 
        a.id_alerta as id,
        'Alerta' as tipo,
        CONCAT('Alerta: ', a.tipo_alerta, ' - ', COALESCE(b.nombre, 'Sin bien')) as titulo,
        CONCAT('Prioridad: ', a.prioridad, ' | Estado: ', a.estado,
               COALESCE(CONCAT(' | ', a.descripcion), '')) as descripcion,
        a.fecha_alerta as fecha
      FROM alertas a
      LEFT JOIN bienes b ON a.id_bien = b.id_bien
      WHERE a.tipo_alerta LIKE ?
         OR a.descripcion LIKE ?
         OR a.estado LIKE ?
         OR a.prioridad LIKE ?
         OR b.nombre LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    resultados = resultados.concat(alertas);

    // 7. Buscar DOCUMENTOS
    const documentos = await query(`
      SELECT 
        db.id_documento as id,
        'Documento' as tipo,
        db.nombre_archivo as titulo,
        CONCAT('Tipo: ', COALESCE(db.tipo_documento, 'N/A'), 
               ' | Bien: ', COALESCE(b.nombre, 'N/A'),
               COALESCE(CONCAT(' | ', db.descripcion), '')) as descripcion,
        db.uploaded_at as fecha
      FROM documentos_bien db
      LEFT JOIN bienes b ON db.id_bien = b.id_bien
      WHERE db.nombre_archivo LIKE ?
         OR db.tipo_documento LIKE ?
         OR db.descripcion LIKE ?
         OR b.nombre LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    resultados = resultados.concat(documentos);

    // 8. Buscar PERIODOS ACADÉMICOS
    const periodos = await query(`
      SELECT 
        id_periodo as id,
        'Período' as tipo,
        nombre_periodo as titulo,
        CONCAT('Año: ', COALESCE(anio, 'N/A'), ' | Tipo: ', COALESCE(tipo, 'N/A'),
               ' | Fechas: ', COALESCE(fecha_inicio, ''), ' a ', COALESCE(fecha_fin, '')) as descripcion,
        created_at as fecha
      FROM periodos_academicos
      WHERE nombre_periodo LIKE ?
         OR descripcion LIKE ?
         OR tipo LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, limitNum]);
    resultados = resultados.concat(periodos);

    // 9. Buscar DEPARTAMENTOS
    const departamentos = await query(`
      SELECT 
        id_departamento as id,
        'Departamento' as tipo,
        nombre as titulo,
        COALESCE(descripcion, 'Sin descripción') as descripcion,
        created_at as fecha
      FROM departamentos
      WHERE nombre LIKE ?
         OR descripcion LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, limitNum]);
    resultados = resultados.concat(departamentos);

    // 10. Buscar ROLES (solo admin)
    if (isAdmin) {
      const roles = await query(`
        SELECT 
          id_rol as id,
          'Rol' as tipo,
          nombre_rol as titulo,
          COALESCE(descripcion, 'Sin descripción') as descripcion,
          NULL as fecha
        FROM roles
        WHERE nombre_rol LIKE ?
           OR descripcion LIKE ?
        LIMIT ?
      `, [searchTerm, searchTerm, limitNum]);
      resultados = resultados.concat(roles);
    }

    // 11. Buscar AULAS ASIGNADAS
    const aulasAsignadas = await query(`
      SELECT 
        aa.id as id,
        'Aula Asignada' as tipo,
        CONCAT(u.area, ' - ', CONCAT(usr.nombres, ' ', COALESCE(usr.apellidos, ''))) as titulo,
        CONCAT('Período: ', p.nombre_periodo, 
               COALESCE(CONCAT(' | Obs: ', aa.observaciones), '')) as descripcion,
        aa.created_at as fecha
      FROM aulas_asignadas aa
      LEFT JOIN ubicaciones u ON aa.ubicacion_id = u.id_ubicacion
      LEFT JOIN usuarios usr ON aa.usuario_id = usr.id_usuario
      LEFT JOIN periodos_academicos p ON aa.periodo_id = p.id_periodo
      WHERE u.area LIKE ?
         OR CONCAT(usr.nombres, ' ', COALESCE(usr.apellidos, '')) LIKE ?
         OR p.nombre_periodo LIKE ?
         OR aa.observaciones LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    resultados = resultados.concat(aulasAsignadas);

    // Ordenar por fecha descendente y limitar total
    resultados.sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return new Date(b.fecha) - new Date(a.fecha);
    });
    resultados = resultados.slice(0, limitNum);

    res.json({
      success: true,
      data: {
        resultados,
        total: resultados.length,
        termino: q.trim()
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
