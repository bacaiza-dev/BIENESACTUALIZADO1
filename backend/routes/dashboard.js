// routes/dashboard.js - Estadísticas y métricas del dashboard
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken } = require("../middleware/auth");

// Función helper para computar estadísticas
async function computeDashboardStats() {
  let tBienes = 0, tValor = 0, tUbic = 0, tUsr = 0, salud = 100;
  
  try {
    const [rb] = await query("SELECT COUNT(*) as count FROM bienes");
    tBienes = rb?.count ?? 0;
  } catch (e) { tBienes = 0; }
  
  try {
    const [rv] = await query("SELECT SUM(valor) as total FROM bienes");
    tValor = rv?.total ?? 0;
  } catch (e) { tValor = 0; }
  
  try {
    const [ru] = await query("SELECT COUNT(*) as count FROM ubicaciones WHERE activo = 1");
    tUbic = ru?.count ?? 0;
  } catch (e) { tUbic = 0; }
  
  try {
    const [ru2] = await query("SELECT COUNT(*) as count FROM usuarios WHERE activo = 1");
    tUsr = ru2?.count ?? 0;
  } catch (e) { tUsr = 0; }
  
  try {
    const [rs] = await query("SELECT COUNT(*) as count FROM bienes WHERE estado = 'ACTIVO'");
    if (tBienes > 0 && rs && rs.count != null) salud = Math.round((rs.count / tBienes) * 100);
  } catch (e) { /* keep default 100 */ }
  
  return {
    totalBienes: tBienes,
    valorTotal: tValor,
    totalUbicaciones: tUbic,
    totalUsuarios: tUsr,
    usuariosActivos: tUsr,
    alertasActivas: 0,
    alertasCriticas: 0,
    alertasPendientes: 0,
    mantenimientosPendientes: 0,
    estadoSalud: salud,
    incrementoBienes: 0,
    incrementoValor: 0,
    nuevosUsuarios: 0
  };
}

// GET /dashboard/stats
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const data = await computeDashboardStats();
    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: true, data: {
      totalBienes: 0, valorTotal: 0, totalUbicaciones: 0, totalUsuarios: 0,
      alertasPendientes: 0, mantenimientosPendientes: 0, estadoSalud: 100
    }});
  }
});

// GET /dashboard/metrics - Alias
router.get("/metrics", verifyToken, async (req, res) => {
  try {
    const data = await computeDashboardStats();
    res.json({ success: true, data });
  } catch (e) {
    res.json({ success: true, data: {
      totalBienes: 0, valorTotal: 0, totalUbicaciones: 0, totalUsuarios: 0
    }});
  }
});

// GET /dashboard/bienes-por-categoria
router.get("/bienes-por-categoria", verifyToken, async (req, res) => {
  try {
    const data = await query(`
      SELECT c.nombre_categoria as categoria, COUNT(b.id_bien) as cantidad
      FROM categorias c
      LEFT JOIN bienes b ON c.id_categoria = b.categoria_id
      WHERE c.activo = 1
      GROUP BY c.id_categoria, c.nombre_categoria
      ORDER BY cantidad DESC
      LIMIT 10
    `);
    res.json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] bienes-por-categoria:", error.message);
    res.json({ success: true, data: [] });
  }
});

// GET /dashboard/categories - Alias
router.get("/categories", verifyToken, async (req, res) => {
  try {
    const data = await query(`
      SELECT c.nombre_categoria as label, COUNT(b.id_bien) as value
      FROM categorias c
      LEFT JOIN bienes b ON c.id_categoria = b.categoria_id
      WHERE c.activo = 1
      GROUP BY c.id_categoria, c.nombre_categoria
      ORDER BY value DESC
      LIMIT 10
    `);
    res.json({ 
      success: true, 
      labels: data.map(d => d.label),
      values: data.map(d => d.value),
      colors: ['#e63946', '#4361ee', '#38b000', '#f9c74f', '#9d4edd']
    });
  } catch (error) {
    res.json({ success: true, labels: [], values: [], colors: [] });
  }
});

// GET /dashboard/valor-por-ubicacion
router.get("/valor-por-ubicacion", verifyToken, async (req, res) => {
  try {
    const sql = `
      SELECT u.area as ubicacion, SUM(b.valor) as valor
      FROM ubicaciones u
      JOIN bienes b ON u.id_ubicacion = b.ubicacion_id
      WHERE u.activo = 1
      GROUP BY u.id_ubicacion, u.area
      ORDER BY valor DESC
      LIMIT 10
    `;
    const data = await query(sql);
    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// GET /dashboard/alertas-recientes
router.get("/alertas-recientes", verifyToken, async (req, res) => {
  res.json({ success: true, data: [] });
});

// GET /dashboard/alerts - Alias
router.get("/alerts", verifyToken, async (req, res) => {
  res.json({ success: true, data: [] });
});

// GET /dashboard/espacios - Espacios físicos (aulas y laboratorios)
router.get("/espacios", verifyToken, async (req, res) => {
  try {
    // Contar aulas
    let aulasTotal = 0, aulasBienes = 0, aulasCapacidad = 0, aulasTop = [];
    let labsTotal = 0, labsBienes = 0, labsCapacidad = 0, labsTop = [];

    try {
      const [aulasCount] = await query("SELECT COUNT(*) as count FROM ubicaciones WHERE tipo = 'AULA' AND activo = 1");
      aulasTotal = aulasCount?.count ?? 0;
    } catch (e) {}

    try {
      const [labsCount] = await query("SELECT COUNT(*) as count FROM ubicaciones WHERE tipo = 'LABORATORIO' AND activo = 1");
      labsTotal = labsCount?.count ?? 0;
    } catch (e) {}

    try {
      const [ab] = await query(`
        SELECT COUNT(b.id_bien) as count 
        FROM bienes b 
        JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion 
        WHERE u.tipo = 'AULA' AND u.activo = 1
      `);
      aulasBienes = ab?.count ?? 0;
    } catch (e) {}

    try {
      const [lb] = await query(`
        SELECT COUNT(b.id_bien) as count 
        FROM bienes b 
        JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion 
        WHERE u.tipo = 'LABORATORIO' AND u.activo = 1
      `);
      labsBienes = lb?.count ?? 0;
    } catch (e) {}

    try {
      const [ac] = await query("SELECT SUM(capacidad) as cap FROM ubicaciones WHERE tipo = 'AULA' AND activo = 1");
      aulasCapacidad = ac?.cap ?? 0;
    } catch (e) {}

    try {
      const [lc] = await query("SELECT SUM(capacidad) as cap FROM ubicaciones WHERE tipo = 'LABORATORIO' AND activo = 1");
      labsCapacidad = lc?.cap ?? 0;
    } catch (e) {}

    try {
      aulasTop = await query(`
        SELECT u.id_ubicacion as id, u.area as nombre, u.sede as edificio, u.numero_aula as aula,
               COUNT(b.id_bien) as bienesAsignados
        FROM ubicaciones u
        LEFT JOIN bienes b ON u.id_ubicacion = b.ubicacion_id
        WHERE u.tipo = 'AULA' AND u.activo = 1
        GROUP BY u.id_ubicacion
        ORDER BY bienesAsignados DESC
        LIMIT 5
      `);
    } catch (e) { aulasTop = []; }

    try {
      labsTop = await query(`
        SELECT u.id_ubicacion as id, u.area as nombre, u.sede as edificio, u.numero_aula as aula,
               COUNT(b.id_bien) as bienesAsignados
        FROM ubicaciones u
        LEFT JOIN bienes b ON u.id_ubicacion = b.ubicacion_id
        WHERE u.tipo = 'LABORATORIO' AND u.activo = 1
        GROUP BY u.id_ubicacion
        ORDER BY bienesAsignados DESC
        LIMIT 5
      `);
    } catch (e) { labsTop = []; }

    res.json({
      success: true,
      data: {
        aulas: {
          total: aulasTotal,
          bienes_total: aulasBienes,
          capacidad_total: aulasCapacidad,
          top: aulasTop
        },
        laboratorios: {
          total: labsTotal,
          bienes_total: labsBienes,
          capacidad_total: labsCapacidad,
          top: labsTop
        }
      }
    });
  } catch (error) {
    console.error("[ERROR] espacios:", error.message);
    res.json({
      success: true,
      data: {
        aulas: { total: 0, bienes_total: 0, capacidad_total: 0, top: [] },
        laboratorios: { total: 0, bienes_total: 0, capacidad_total: 0, top: [] }
      }
    });
  }
});

// GET /dashboard/actividades-recientes
router.get("/actividades-recientes", verifyToken, async (req, res) => {
  res.json({ success: true, data: [] });
});

// GET /dashboard/activity - Alias
router.get("/activity", verifyToken, async (req, res) => {
  res.json({ success: true, data: [] });
});

// GET /dashboard/top-value
router.get("/top-value", verifyToken, async (req, res) => {
  try {
    const data = await query(`
      SELECT id_bien as id, nombre, codigo_institucional as codigo, valor, estado
      FROM bienes
      ORDER BY valor DESC
      LIMIT 5
    `);
    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// GET /dashboard/bienes-por-estado - Bienes agrupados por estado/condición
router.get("/bienes-por-estado", verifyToken, async (req, res) => {
  try {
    const data = await query(`
      SELECT estado, COUNT(*) as cantidad
      FROM bienes
      GROUP BY estado
      ORDER BY cantidad DESC
    `);
    
    const colors = {
      'ACTIVO': '#10b981',
      'NUEVO': '#3b82f6',
      'MANTENIMIENTO': '#f59e0b',
      'DESCARTADO': '#ef4444',
      'DEFECTUOSO': '#ec4899',
      'REPARACION': '#f97316',
      'DADO.BAJA': '#8b5cf6',
      'INACTIVO': '#6b7280',
      'PENDIENTE': '#06b6d4'
    };
    
    const result = data.map(item => ({
      estado: item.estado || 'Sin estado',
      cantidad: item.cantidad,
      porcentaje: 0,
      color: colors[item.estado] || '#84cc16'
    }));
    
    const total = result.reduce((sum, item) => sum + item.cantidad, 0);
    result.forEach(item => {
      item.porcentaje = total > 0 ? Math.round((item.cantidad / total) * 100) : 0;
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[ERROR] bienes-por-estado:", error.message);
    res.json({ success: true, data: [] });
  }
});

// GET /dashboard/actividad-reciente - Últimas acciones en el sistema
router.get("/actividad-reciente", verifyToken, async (req, res) => {
  try {
    const data = await query(`
      SELECT 
        l.id_log as id,
        u.nombre as usuario,
        CASE 
          WHEN l.tabla = 'bienes' AND l.accion = 'INSERT' THEN 'Creó un nuevo bien'
          WHEN l.tabla = 'bienes' AND l.accion = 'UPDATE' THEN 'Actualizó un bien'
          WHEN l.tabla = 'bienes' AND l.accion = 'DELETE' THEN 'Eliminó un bien'
          WHEN l.tabla = 'bienes' THEN 'Modificó inventario'
          ELSE l.accion
        END as accion,
        CONCAT(l.tabla, ': ', COALESCE(l.detalles, '')) as detalle,
        l.fecha_creacion as tiempo
      FROM logs l
      LEFT JOIN usuarios u ON l.usuario_id = u.id_usuario
      WHERE l.tabla IN ('bienes', 'ubicaciones', 'usuarios')
      ORDER BY l.fecha_creacion DESC
      LIMIT 10
    `);
    
    res.json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] actividad-reciente:", error.message);
    res.json({ success: true, data: [] });
  }
});

// GET /dashboard/movimientos-recientes - Últimos movimientos de bienes
router.get("/movimientos-recientes", verifyToken, async (req, res) => {
  try {
    const data = await query(`
      SELECT 
        m.id_movimiento as id,
        b.nombre as bien_nombre,
        b.codigo_institucional as bien_codigo,
        CASE 
          WHEN m.tipo_movimiento = 'ASIGNACION' THEN 'Asignación'
          WHEN m.tipo_movimiento = 'TRASLADO' THEN 'Traslado'
          WHEN m.tipo_movimiento = 'DEVOLUCION' THEN 'Devolución'
          WHEN m.tipo_movimiento = 'REPARACION' THEN 'Reparación'
          ELSE m.tipo_movimiento
        END as tipo_movimiento,
        COALESCE(u1.area, 'Almacén') as desde,
        COALESCE(u2.area, 'Almacén') as hacia,
        u.nombre as usuario,
        m.fecha_movimiento as fecha
      FROM movimientos m
      LEFT JOIN bienes b ON m.bien_id = b.id_bien
      LEFT JOIN ubicaciones u1 ON m.ubicacion_anterior_id = u1.id_ubicacion
      LEFT JOIN ubicaciones u2 ON m.ubicacion_nueva_id = u2.id_ubicacion
      LEFT JOIN usuarios u ON m.usuario_id = u.id_usuario
      WHERE m.fecha_movimiento >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY m.fecha_movimiento DESC
      LIMIT 15
    `);
    
    res.json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] movimientos-recientes:", error.message);
    res.json({ success: true, data: [] });
  }
});

module.exports = router;
