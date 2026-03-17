// routes/reportes.js - Generación de reportes completa
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { query } = require("../config/database");
const { verifyToken } = require("../middleware/auth");

// Función auxiliar para obtener datos según tipo
const obtenerDatosReporte = async (reporteTipo, filtros = {}) => {
  let datos = [];
  let tituloReporte = 'Reporte General';
  let columnas = [];
  
  if (reporteTipo === "inventario" || reporteTipo === "bienes" || reporteTipo === "" || !reporteTipo) {
    tituloReporte = 'Inventario de Bienes';
    columnas = ['Código', 'Nombre', 'Marca', 'Modelo', 'Estado', 'Valor', 'Categoría', 'Ubicación', 'Responsable'];
    datos = await query(`
      SELECT b.codigo_institucional as codigo, b.nombre, b.marca, b.modelo, b.estado, 
             COALESCE(b.valor, 0) as valor,
             COALESCE(c.nombre_categoria, 'Sin categoría') as categoria, 
             COALESCE(u.area, 'Sin ubicación') as ubicacion,
             CONCAT(us.nombres, ' ', COALESCE(us.apellidos, '')) as responsable
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
      LEFT JOIN asignaciones_bien ab ON b.id_bien = ab.id_bien AND ab.activo = 1
      LEFT JOIN usuarios us ON ab.id_usuario = us.id_usuario
      ORDER BY b.nombre
      LIMIT 500
    `);
  } else if (reporteTipo === "ubicaciones" || reporteTipo === "ubicacion") {
    tituloReporte = 'Reporte por Ubicación';
    columnas = ['Área', 'Sede', 'Tipo', 'Cantidad de Bienes'];
    datos = await query(`
      SELECT u.area, COALESCE(u.sede, 'N/A') as sede, u.tipo, COUNT(b.id_bien) as bienes_count
      FROM ubicaciones u
      LEFT JOIN bienes b ON u.id_ubicacion = b.ubicacion_id
      WHERE u.activo = 1
      GROUP BY u.id_ubicacion, u.area, u.sede, u.tipo
      ORDER BY u.area
    `);
  } else if (reporteTipo === "categoria") {
    tituloReporte = 'Reporte por Categoría';
    columnas = ['Categoría', 'Código', 'Cantidad de Bienes', 'Valor Total'];
    datos = await query(`
      SELECT c.nombre_categoria as categoria, COALESCE(c.codigo, 'N/A') as codigo, 
             COUNT(b.id_bien) as bienes_count, COALESCE(SUM(b.valor), 0) as valor_total
      FROM categorias c
      LEFT JOIN bienes b ON c.id_categoria = b.categoria_id
      WHERE c.activo = 1
      GROUP BY c.id_categoria, c.nombre_categoria, c.codigo
      ORDER BY c.nombre_categoria
    `);
  } else if (reporteTipo === "estado") {
    tituloReporte = 'Reporte por Estado';
    columnas = ['Estado', 'Cantidad', 'Valor Total'];
    datos = await query(`
      SELECT estado, COUNT(*) as cantidad, COALESCE(SUM(valor), 0) as valor_total
      FROM bienes
      GROUP BY estado
      ORDER BY cantidad DESC
    `);
  } else if (reporteTipo === "depreciacion") {
    tituloReporte = 'Reporte de Depreciación';
    columnas = ['Código', 'Nombre', 'Valor Original', 'Depreciación', 'Valor Neto'];
    datos = await query(`
      SELECT b.codigo_institucional as codigo, b.nombre, 
             COALESCE(b.valor, 0) as valor, 
             COALESCE(b.depreciacion_acumulada, 0) as depreciacion,
             (COALESCE(b.valor, 0) - COALESCE(b.depreciacion_acumulada, 0)) as valor_neto
      FROM bienes b
      WHERE b.valor > 0
      ORDER BY b.valor DESC
      LIMIT 500
    `);
  } else if (reporteTipo === "valor") {
    tituloReporte = 'Análisis de Valor';
    columnas = ['Código', 'Nombre', 'Valor', 'Categoría', 'Ubicación'];
    datos = await query(`
      SELECT b.codigo_institucional as codigo, b.nombre, COALESCE(b.valor, 0) as valor, 
             COALESCE(c.nombre_categoria, 'Sin categoría') as categoria, 
             COALESCE(u.area, 'Sin ubicación') as ubicacion
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
      WHERE b.valor > 0
      ORDER BY b.valor DESC
      LIMIT 100
    `);
  }

  return { datos, tituloReporte, columnas };
};

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
    
    const [reportesInfo] = await query("SELECT COUNT(*) as count, MAX(created_at) as last_report FROM reportes");

    const buenos = bienesPorEstado.find(r => r.estado === 'ACTIVO' || r.estado === 'bueno')?.count || 0;
    const total = totalBienes?.count || 1;
    const porcentajeBuenos = Math.round((buenos / total) * 100);

    // Distribución
    const dist = bienesPorEstado.reduce((acc, curr) => {
      acc[curr.estado] = curr.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalBienes: totalBienes?.count || 0,
        valorTotal: totalValor?.total || 0,
        valorTotalRaw: totalValor?.total || 0,
        estadoSalud: porcentajeBuenos,
        totalUsuarios: totalUsuarios?.count || 0,
        totalUbicaciones: totalUbicaciones?.count || 0,
        reportesGenerados: reportesInfo?.count || 0,
        ultimoReporte: reportesInfo?.last_report 
          ? new Date(reportesInfo.last_report).toLocaleDateString('es-EC')
          : 'N/A',
        distribucionEstados: dist
      },
    });
  } catch (error) {
    console.error("[ERROR] GET /reportes/estadisticas:", error.message);
    res.json({
      success: true,
      data: {
        totalBienes: 0,
        valorTotal: 0,
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
router.get("/", verifyToken, async (req, res) => {
  try {
    const reportes = await query(
      `SELECT r.id_reporte as id, r.nombre, r.tipo, r.created_at as fecha, 
              u.email as generadoPor, r.parametros
       FROM reportes r
       LEFT JOIN usuarios u ON r.usuario_id = u.id_usuario
       ORDER BY r.created_at DESC`
    );

    const reportesMapeados = reportes.map(r => ({
        id: r.id,
        nombre: r.nombre,
        tipo: r.tipo,
        fecha: r.fecha,
        descripcion: r.nombre, // Usar nombre como descripción por ahora
        generadoPor: r.generadoPor || 'Sistema',
        estado: 'Completado',
        registros: 0 // No guardamos el count en la tabla reportes actualmente
    }));

    res.json({
      success: true,
      data: reportesMapeados
    });
  } catch (error) {
    console.error("Error listando reportes:", error);
    res.json({ success: true, data: [] });
  }
});

// POST /reportes/generar - Generar nuevo reporte
router.post("/generar", verifyToken, async (req, res) => {
  try {
    const { tipoReporte, tipo, fechaDesde, fechaHasta, categoria } = req.body;
    const reporteTipo = tipoReporte || tipo || 'inventario';

    const { datos, tituloReporte, columnas } = await obtenerDatosReporte(reporteTipo, { fechaDesde, fechaHasta, categoria });

    // Guardar referencia en BD
    const parametros = JSON.stringify({ fechaDesde, fechaHasta, categoria });
    const usuarioId = req.user ? req.user.id : null;
    const nombreReporte = `${tituloReporte}`;

    const insertResult = await query(
      "INSERT INTO reportes (nombre, tipo, parametros, usuario_id) VALUES (?, ?, ?, ?)",
      [nombreReporte, reporteTipo, parametros, usuarioId]
    );

    const nuevoReporteId = insertResult.insertId;

    res.json({
      success: true,
      message: "Reporte generado correctamente",
      data: {
        id: nuevoReporteId,
        nombre: nombreReporte,
        tipo: reporteTipo,
        fecha: new Date(),
        descripcion: `${tituloReporte}`,
        generadoPor: req.user?.email || 'Sistema',
        estado: 'Completado',
        registros: datos.length
      }
    });

  } catch (error) {
    console.error("[ERROR] POST /reportes/generar:", error.message);
    res.status(500).json({ success: false, message: "Error generando reporte", error: error.message });
  }
});

// POST /reportes/export - Exportar datos a Excel (Directo, sin guardar en BD opcionalmente)
// Se mantiene igual, ya que es "on the fly" basada en params del body
router.post("/export", verifyToken, async (req, res) => {
  try {
    const { tipoReporte, tipo, fechaDesde, fechaHasta, categoria } = req.body;
    const reporteTipo = tipoReporte || tipo || 'inventario';

    const { datos, tituloReporte, columnas } = await obtenerDatosReporte(reporteTipo, { fechaDesde, fechaHasta, categoria });

    // Crear workbook de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Bienes';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(tituloReporte.substring(0, 31)); // Max 31 chars

    // Título
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = tituloReporte;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    // Fecha
    worksheet.mergeCells('A2:H2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Generado: ${new Date().toLocaleDateString('es-EC')} - Total registros: ${datos.length}`;
    dateCell.font = { italic: true, size: 10 };
    dateCell.alignment = { horizontal: 'center' };

    // Espacio
    worksheet.addRow([]);

    // Encabezados
    const headerRow = worksheet.addRow(columnas);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Datos
    datos.forEach((row, index) => {
      const values = Object.values(row);
      const dataRow = worksheet.addRow(values);
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        // Alternar colores de fila
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        }
      });
    });

    // Ajustar anchos de columna
    worksheet.columns.forEach((column, i) => {
      column.width = Math.max(columnas[i]?.length || 10, 15);
    });

    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${reporteTipo}_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("[ERROR] POST /reportes/export:", error.message);
    res.status(500).json({ success: false, message: "Error exportando reporte", error: error.message });
  }
});

// GET /reportes/:id/download - Descargar reporte guardado como PDF
router.get("/:id/download", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener reporte de BD
    const [reporte] = await query("SELECT * FROM reportes WHERE id_reporte = ?", [id]);
    
    if (!reporte) {
      return res.status(404).json({ success: false, message: "Reporte no encontrado" });
    }
    
    const usuario = await query("SELECT email FROM usuarios WHERE id_usuario = ?", [reporte.usuario_id]);
    const generadoPor = usuario[0]?.email || 'Sistema';

    // Reconstruir datos usando los parámetros guardados
    let filtros = {};
    try {
        filtros = JSON.parse(reporte.parametros || '{}');
    } catch (e) { console.error("Error parsing params", e); }

    const { datos, tituloReporte, columnas } = await obtenerDatosReporte(reporte.tipo, filtros);

    // Generar PDF con tabla bien formateada
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${reporte.id_reporte}.pdf"`);
    
    doc.pipe(res);

    // Encabezado
    doc.fontSize(18).font('Helvetica-Bold').text("SISTEMA DE GESTIÓN DE BIENES", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica').text(tituloReporte, { align: "center" });
    doc.moveDown(0.5);
    
    // Info
    doc.fontSize(9);
    doc.text(`Fecha: ${new Date(reporte.created_at).toLocaleDateString("es-EC")}   |   Generado por: ${generadoPor}   |   Total de registros: ${datos.length}`, { align: 'center' });
    doc.moveDown(0.5);

    // Línea separadora
    doc.moveTo(40, doc.y).lineTo(800, doc.y).stroke();
    doc.moveDown(0.5);

    // Tabla de datos
    if (datos && datos.length > 0 && columnas) {
      const startX = 40;
      const startY = doc.y;
      const pageWidth = 760;
      const numCols = Math.min(columnas.length, 8);
      const colWidth = pageWidth / numCols;
      const rowHeight = 18;
      
      // Dibujar encabezados con fondo azul
      doc.rect(startX, startY, pageWidth, rowHeight).fill('#2563EB');
      doc.fillColor('white').font('Helvetica-Bold').fontSize(8);
      
      columnas.slice(0, numCols).forEach((col, i) => {
        doc.text(col.substring(0, 15), startX + (i * colWidth) + 2, startY + 4, { 
          width: colWidth - 4, 
          align: 'center' 
        });
      });

      // Dibujar filas de datos
      let currentY = startY + rowHeight;
      doc.fillColor('black').font('Helvetica').fontSize(7);
      
      const maxRows = Math.min(datos.length, 40);
      
      datos.slice(0, maxRows).forEach((row, rowIndex) => {
        // Nueva página si es necesario
        if (currentY > 550) {
          doc.addPage({ layout: 'landscape' });
          currentY = 40;
        }

        // Alternar color de fondo
        if (rowIndex % 2 === 0) {
          doc.rect(startX, currentY, pageWidth, rowHeight).fill('#F3F4F6');
        } else {
          doc.rect(startX, currentY, pageWidth, rowHeight).fill('white');
        }

        // Dibujar bordes
        doc.strokeColor('#E5E7EB').lineWidth(0.5);
        doc.rect(startX, currentY, pageWidth, rowHeight).stroke();

        // Dibujar datos
        doc.fillColor('black');
        const values = Object.values(row);
        values.slice(0, numCols).forEach((val, i) => {
          const text = String(val ?? '').substring(0, 18);
          doc.text(text, startX + (i * colWidth) + 2, currentY + 4, { 
            width: colWidth - 4, 
            align: i === 0 ? 'left' : 'center' 
          });
        });

        currentY += rowHeight;
      });

      // Mensaje si hay más registros
      if (datos.length > maxRows) {
        doc.moveDown();
        doc.fontSize(8).fillColor('#666').text(`... y ${datos.length - maxRows} registros más. Descargue en Excel para ver todos.`, { align: 'center' });
      }
    } else {
      doc.fontSize(10).text("No hay datos disponibles para mostrar.", { align: 'center' });
    }

    // Pie de página
    doc.fontSize(7).fillColor('#999');
    doc.text("Generado automáticamente por el Sistema de Gestión de Bienes Institucionales", 40, 560, { align: "center", width: 760 });
    
    doc.end();
  } catch (error) {
    console.error("[ERROR] GET /reportes/:id/download:", error.message);
    res.status(500).json({ success: false, message: "Error descargando reporte" });
  }
});

// GET /reportes/:id/excel - Descargar reporte guardado como Excel
router.get("/:id/excel", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [reporte] = await query("SELECT * FROM reportes WHERE id_reporte = ?", [id]);

    if (!reporte) {
      return res.status(404).json({ success: false, message: "Reporte no encontrado" });
    }

    const usuario = await query("SELECT email FROM usuarios WHERE id_usuario = ?", [reporte.usuario_id]);
    const generadoPor = usuario[0]?.email || 'Sistema';

    // Reconstruir datos
    let filtros = {};
    try {
        filtros = JSON.parse(reporte.parametros || '{}');
    } catch (e) { console.error("Error parsing params", e); }

    const { datos, tituloReporte, columnas } = await obtenerDatosReporte(reporte.tipo, filtros);

    // Crear workbook de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Bienes';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(tituloReporte.substring(0, 31));

    // Título
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = tituloReporte;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    // Info
    worksheet.mergeCells('A2:H2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Generado: ${new Date(reporte.created_at).toLocaleDateString('es-EC')} | Por: ${generadoPor} | Registros: ${datos.length}`;
    dateCell.font = { italic: true, size: 10 };
    dateCell.alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    // Encabezados
    const headerRow = worksheet.addRow(columnas);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Datos
    datos.forEach((row, index) => {
      const values = Object.values(row);
      const dataRow = worksheet.addRow(values);
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (index % 2 === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
        }
      });
    });

    // Ajustar anchos
    worksheet.columns.forEach((column, i) => {
      column.width = Math.max(columnas[i]?.length || 10, 15);
    });

    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${reporte.id_reporte}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("[ERROR] GET /reportes/:id/excel:", error.message);
    res.status(500).json({ success: false, message: "Error descargando Excel", error: error.message });
  }
});

// DELETE /reportes/:id - Eliminar reporte de BD
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM reportes WHERE id_reporte = ?", [id]);
    res.json({ success: true, message: "Reporte eliminado" });
  } catch (error) {
     res.status(500).json({ success: false, message: "Error eliminando reporte" });
  }
});

module.exports = router;
