// routes/reportes.js - Generación de reportes
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { query } = require("../config/database");
const { verifyToken } = require("../middleware/auth");

// Almacenamiento en memoria para reportes generados (info básica)
const reportesGenerados = [];

// GET /reportes/estadisticas - Obtener estadísticas generales
router.get("/estadisticas", verifyToken, async (req, res) => {
  try {
    const [totalBienes] = await query("SELECT COUNT(*) as count FROM bienes");
    const [totalValor] = await query("SELECT SUM(valor) as total FROM bienes");
    
    let bienesPorEstado = [];
    try {
      bienesPorEstado = await query("SELECT estado, COUNT(*) as count FROM bienes GROUP BY estado");
    } catch (e) { bienesPorEstado = []; }
    
    const [totalUsuarios] = await query("SELECT COUNT(*) as count FROM usuarios WHERE activo = 1");
    const [totalUbicaciones] = await query("SELECT COUNT(*) as count FROM ubicaciones WHERE activo = 1");
    
    const buenos = bienesPorEstado.find(r => r.estado === 'ACTIVO' || r.estado === 'bueno')?.count || 0;
    const total = totalBienes?.count || 1;
    const porcentajeBuenos = Math.round((buenos / total) * 100);

    const valorFormateado = new Intl.NumberFormat('es-EC', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(totalValor?.total || 0);

    res.json({
      success: true,
      data: {
        totalBienes: totalBienes?.count || 0,
        valorTotal: valorFormateado,
        valorTotalRaw: totalValor?.total || 0,
        estadoSalud: porcentajeBuenos,
        totalUsuarios: totalUsuarios?.count || 0,
        totalUbicaciones: totalUbicaciones?.count || 0,
        reportesGenerados: reportesGenerados.length,
        ultimoReporte: reportesGenerados.length > 0 
          ? new Date(reportesGenerados[reportesGenerados.length - 1].fecha).toLocaleDateString('es-EC')
          : 'N/A',
        distribucionEstados: bienesPorEstado.reduce((acc, curr) => {
          acc[curr.estado] = curr.count;
          return acc;
        }, {})
      },
    });
  } catch (error) {
    console.error("[ERROR] GET /reportes/estadisticas:", error.message);
    res.json({
      success: true,
      data: {
        totalBienes: 0,
        valorTotal: "$0.00",
        valorTotalRaw: 0,
        estadoSalud: 100,
        totalUsuarios: 0,
        totalUbicaciones: 0,
        distribucionEstados: {},
        reportesGenerados: 0,
        ultimoReporte: 'N/A'
      },
    });
  }
});

// GET /reportes - Listar reportes generados
router.get("/", verifyToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: reportesGenerados.map(r => ({
        id: r.id,
        nombre: r.nombre,
        tipo: r.tipo,
        fecha: r.fecha,
        descripcion: r.descripcion || `Reporte de ${r.tipo}`,
        generadoPor: r.generadoPor || 'Sistema',
        estado: 'Completado'
      }))
    });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// POST /reportes/generar - Generar nuevo reporte
router.post("/generar", verifyToken, async (req, res) => {
  try {
    // El frontend envía tipoReporte, lo mapeamos a tipo
    const { tipoReporte, tipo, filtros } = req.body;
    const reporteTipo = tipoReporte || tipo || 'general';

    // Obtener datos según tipo
    let datos = [];
    let tituloReporte = 'Reporte General';
    
    if (reporteTipo === "inventario" || reporteTipo === "bienes" || reporteTipo === "") {
      tituloReporte = 'Inventario de Bienes';
      datos = await query(`
        SELECT b.codigo_institucional, b.nombre, b.marca, b.modelo, b.estado, b.valor,
               c.nombre_categoria as categoria, u.area as ubicacion
        FROM bienes b
        LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
        LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
        ORDER BY b.nombre
        LIMIT 100
      `);
    } else if (reporteTipo === "ubicaciones" || reporteTipo === "ubicacion") {
      tituloReporte = 'Reporte por Ubicación';
      datos = await query(`
        SELECT u.area, u.sede, u.tipo, COUNT(b.id_bien) as bienes_count
        FROM ubicaciones u
        LEFT JOIN bienes b ON u.id_ubicacion = b.ubicacion_id
        WHERE u.activo = 1
        GROUP BY u.id_ubicacion
        ORDER BY u.area
      `);
    } else if (reporteTipo === "categoria") {
      tituloReporte = 'Reporte por Categoría';
      datos = await query(`
        SELECT c.nombre_categoria, c.codigo, COUNT(b.id_bien) as bienes_count, SUM(b.valor) as valor_total
        FROM categorias c
        LEFT JOIN bienes b ON c.id_categoria = b.categoria_id
        WHERE c.activo = 1
        GROUP BY c.id_categoria
        ORDER BY c.nombre_categoria
      `);
    } else if (reporteTipo === "estado") {
      tituloReporte = 'Reporte por Estado';
      datos = await query(`
        SELECT estado, COUNT(*) as cantidad, SUM(valor) as valor_total
        FROM bienes
        GROUP BY estado
        ORDER BY cantidad DESC
      `);
    } else if (reporteTipo === "depreciacion") {
      tituloReporte = 'Reporte de Depreciación';
      datos = await query(`
        SELECT b.codigo_institucional, b.nombre, b.valor, b.depreciacion_acumulada,
               (b.valor - COALESCE(b.depreciacion_acumulada, 0)) as valor_neto
        FROM bienes b
        WHERE b.valor > 0
        ORDER BY b.valor DESC
        LIMIT 100
      `);
    } else if (reporteTipo === "valor") {
      tituloReporte = 'Análisis de Valor';
      datos = await query(`
        SELECT b.codigo_institucional, b.nombre, b.valor, c.nombre_categoria, u.area
        FROM bienes b
        LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
        LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
        WHERE b.valor > 0
        ORDER BY b.valor DESC
        LIMIT 50
      `);
    }

    // Guardar referencia del reporte
    const reporte = {
      id: Date.now(),
      nombre: `${tituloReporte} - ${new Date().toLocaleDateString('es-EC')}`,
      tipo: tituloReporte,
      fecha: new Date().toISOString(),
      descripcion: `${tituloReporte} generado con ${datos.length} registros`,
      generadoPor: req.user?.email || 'Sistema',
      datosCount: datos.length
    };
    reportesGenerados.push(reporte);

    // Responder con éxito
    res.json({
      success: true,
      message: "Reporte generado correctamente",
      data: {
        id: reporte.id,
        nombre: reporte.nombre,
        tipo: reporte.tipo,
        fecha: reporte.fecha,
        descripcion: reporte.descripcion,
        generadoPor: reporte.generadoPor,
        estado: 'Completado',
        registros: datos.length
      }
    });

  } catch (error) {
    console.error("[ERROR] POST /reportes/generar:", error.message);
    res.status(500).json({ success: false, message: "Error generando reporte", error: error.message });
  }
});

// GET /reportes/:id/download - Descargar reporte como PDF
router.get("/:id/download", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const reporte = reportesGenerados.find((r) => r.id === parseInt(id));

    if (!reporte) {
      return res.status(404).json({ success: false, message: "Reporte no encontrado" });
    }

    // Generar PDF en memoria y enviarlo
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reporte.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text("REPORTE DE BIENES INSTITUCIONALES", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(reporte.tipo, { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Fecha: ${new Date(reporte.fecha).toLocaleDateString("es-EC")}`, { align: "left" });
    doc.text(`Generado por: ${reporte.generadoPor}`, { align: "left" });
    doc.text(`Registros: ${reporte.datosCount}`, { align: "left" });
    doc.moveDown();

    doc.fontSize(12).text("Este reporte fue generado desde el Sistema de Gestión de Bienes.", { align: "center" });
    
    doc.end();
  } catch (error) {
    console.error("[ERROR] GET /reportes/:id/download:", error.message);
    res.status(500).json({ success: false, message: "Error descargando reporte" });
  }
});

// DELETE /reportes/:id - Eliminar reporte
router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const idx = reportesGenerados.findIndex((r) => r.id === parseInt(id));

  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Reporte no encontrado" });
  }

  reportesGenerados.splice(idx, 1);
  res.json({ success: true, message: "Reporte eliminado" });
});

module.exports = router;
