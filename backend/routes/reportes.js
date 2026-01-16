// routes/reportes.js - Generación de reportes
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const { query } = require("../config/database");
const { verifyToken } = require("../middleware/auth");
const { TMP_DIR, ensureDir } = require("../middleware/upload");

// Almacenamiento en memoria para reportes generados
const reportesGenerados = [];

// GET /reportes/estadisticas - Obtener estadísticas generales
router.get("/estadisticas", verifyToken, async (req, res) => {
  try {
    // Esquema real: valor (no valor_adquisicion), NO hay columna activo en bienes
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
        distribucionEstados: {}
      },
    });
  }
});

// GET /reportes - Listar reportes generados
router.get("/", verifyToken, (req, res) => {
  try {
    const validReports = reportesGenerados.filter(rep => rep.path && fs.existsSync(rep.path));
    reportesGenerados.length = 0;
    reportesGenerados.push(...validReports);
    
    res.json({
      success: true,
      data: validReports.map(r => ({
        id: r.id,
        nombre: r.nombre,
        tipo: r.tipo,
        fecha: r.fecha
      }))
    });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// POST /reportes/generar - Generar nuevo reporte
router.post("/generar", verifyToken, async (req, res) => {
  try {
    const { tipo, filtros } = req.body;

    ensureDir(TMP_DIR);

    const filename = `reporte_${tipo}_${Date.now()}.pdf`;
    const filePath = path.join(TMP_DIR, filename);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Encabezado
    doc.fontSize(20).text("REPORTE DE BIENES INSTITUCIONALES", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Tipo: ${tipo}`, { align: "left" });
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-EC")}`, { align: "left" });
    doc.moveDown();

    // Obtener datos según tipo
    let datos = [];
    if (tipo === "inventario" || tipo === "bienes") {
      datos = await query(`
        SELECT b.codigo_institucional, b.nombre, b.marca, b.modelo, b.estado, b.valor,
               c.nombre_categoria as categoria, u.area as ubicacion
        FROM bienes b
        LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
        LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
        ORDER BY b.nombre
        LIMIT 100
      `);
    } else if (tipo === "ubicaciones") {
      datos = await query(`
        SELECT u.area, u.sede, u.tipo, COUNT(b.id_bien) as bienes_count
        FROM ubicaciones u
        LEFT JOIN bienes b ON u.id_ubicacion = b.ubicacion_id
        WHERE u.activo = 1
        GROUP BY u.id_ubicacion
        ORDER BY u.area
      `);
    }

    // Tabla simple
    let yPos = doc.y;
    datos.forEach((row, idx) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }
      const text = Object.values(row).join(" | ");
      doc.fontSize(9).text(text, 50, yPos);
      yPos += 15;
    });

    doc.end();

    stream.on("finish", () => {
      const reporte = {
        id: Date.now(),
        nombre: filename,
        tipo,
        fecha: new Date().toISOString(),
        path: filePath,
      };
      reportesGenerados.push(reporte);

      res.json({
        success: true,
        message: "Reporte generado",
        data: { id: reporte.id, nombre: reporte.nombre },
      });
    });

    stream.on("error", (err) => {
      res.status(500).json({ success: false, message: "Error generando PDF", error: err.message });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generando reporte", error: error.message });
  }
});

// GET /reportes/:id/download - Descargar reporte
router.get("/:id/download", verifyToken, (req, res) => {
  const { id } = req.params;
  const reporte = reportesGenerados.find((r) => r.id === parseInt(id));

  if (!reporte || !fs.existsSync(reporte.path)) {
    return res.status(404).json({ success: false, message: "Reporte no encontrado" });
  }

  res.download(reporte.path, reporte.nombre);
});

// DELETE /reportes/:id - Eliminar reporte
router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const idx = reportesGenerados.findIndex((r) => r.id === parseInt(id));

  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Reporte no encontrado" });
  }

  const reporte = reportesGenerados[idx];
  if (fs.existsSync(reporte.path)) {
    fs.unlinkSync(reporte.path);
  }
  reportesGenerados.splice(idx, 1);

  res.json({ success: true, message: "Reporte eliminado" });
});

module.exports = router;
