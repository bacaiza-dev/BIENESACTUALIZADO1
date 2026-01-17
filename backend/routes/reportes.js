// routes/reportes.js - Generación de reportes completa
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { query } = require("../config/database");
const { verifyToken } = require("../middleware/auth");

// Almacenamiento en memoria para reportes generados
const reportesGenerados = [];

// Función auxiliar para obtener datos según tipo
const obtenerDatosReporte = async (reporteTipo, filtros = {}) => {
  let datos = [];
  let tituloReporte = 'Reporte General';
  let columnas = [];
  
  if (reporteTipo === "inventario" || reporteTipo === "bienes" || reporteTipo === "" || !reporteTipo) {
    tituloReporte = 'Inventario de Bienes';
    columnas = ['Código', 'Nombre', 'Marca', 'Modelo', 'Estado', 'Valor', 'Categoría', 'Ubicación'];
    datos = await query(`
      SELECT b.codigo_institucional as codigo, b.nombre, b.marca, b.modelo, b.estado, 
             COALESCE(b.valor, 0) as valor,
             COALESCE(c.nombre_categoria, 'Sin categoría') as categoria, 
             COALESCE(u.area, 'Sin ubicación') as ubicacion
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
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
    
    const buenos = bienesPorEstado.find(r => r.estado === 'ACTIVO' || r.estado === 'bueno')?.count || 0;
    const total = totalBienes?.count || 1;
    const porcentajeBuenos = Math.round((buenos / total) * 100);

    res.json({
      success: true,
      data: {
        totalBienes: totalBienes?.count || 0,
        valorTotal: totalValor?.total || 0,
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
        estado: 'Completado',
        registros: r.datosCount || 0
      }))
    });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// POST /reportes/generar - Generar nuevo reporte
router.post("/generar", verifyToken, async (req, res) => {
  try {
    const { tipoReporte, tipo, fechaDesde, fechaHasta, categoria } = req.body;
    const reporteTipo = tipoReporte || tipo || 'inventario';

    const { datos, tituloReporte, columnas } = await obtenerDatosReporte(reporteTipo, { fechaDesde, fechaHasta, categoria });

    // Guardar referencia del reporte con los datos
    const reporte = {
      id: Date.now(),
      nombre: `${tituloReporte} - ${new Date().toLocaleDateString('es-EC')}`,
      tipo: tituloReporte,
      tipoKey: reporteTipo,
      fecha: new Date().toISOString(),
      descripcion: `${tituloReporte} con ${datos.length} registros`,
      generadoPor: req.user?.email || 'Sistema',
      datosCount: datos.length,
      columnas,
      datos // Guardamos los datos para poder descargar después
    };
    reportesGenerados.push(reporte);

    // Limitar a 50 reportes máximo en memoria
    if (reportesGenerados.length > 50) {
      reportesGenerados.shift();
    }

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

// POST /reportes/export - Exportar datos a Excel
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

// GET /reportes/:id/download - Descargar reporte como PDF
router.get("/:id/download", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const reporte = reportesGenerados.find((r) => r.id === parseInt(id));

    if (!reporte) {
      return res.status(404).json({ success: false, message: "Reporte no encontrado" });
    }

    // Generar PDF con tabla bien formateada
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${reporte.id}.pdf"`);
    
    doc.pipe(res);

    // Encabezado
    doc.fontSize(18).font('Helvetica-Bold').text("SISTEMA DE GESTIÓN DE BIENES", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica').text(reporte.tipo, { align: "center" });
    doc.moveDown(0.5);
    
    // Info
    doc.fontSize(9);
    doc.text(`Fecha: ${new Date(reporte.fecha).toLocaleDateString("es-EC")}   |   Generado por: ${reporte.generadoPor}   |   Total de registros: ${reporte.datosCount}`, { align: 'center' });
    doc.moveDown(0.5);

    // Línea separadora
    doc.moveTo(40, doc.y).lineTo(800, doc.y).stroke();
    doc.moveDown(0.5);

    // Tabla de datos
    if (reporte.datos && reporte.datos.length > 0 && reporte.columnas) {
      const startX = 40;
      const startY = doc.y;
      const pageWidth = 760;
      const numCols = Math.min(reporte.columnas.length, 8);
      const colWidth = pageWidth / numCols;
      const rowHeight = 18;
      
      // Dibujar encabezados con fondo azul
      doc.rect(startX, startY, pageWidth, rowHeight).fill('#2563EB');
      doc.fillColor('white').font('Helvetica-Bold').fontSize(8);
      
      reporte.columnas.slice(0, numCols).forEach((col, i) => {
        doc.text(col.substring(0, 15), startX + (i * colWidth) + 2, startY + 4, { 
          width: colWidth - 4, 
          align: 'center' 
        });
      });

      // Dibujar filas de datos
      let currentY = startY + rowHeight;
      doc.fillColor('black').font('Helvetica').fontSize(7);
      
      const maxRows = Math.min(reporte.datos.length, 40);
      
      reporte.datos.slice(0, maxRows).forEach((row, rowIndex) => {
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
      if (reporte.datos.length > maxRows) {
        doc.moveDown();
        doc.fontSize(8).fillColor('#666').text(`... y ${reporte.datos.length - maxRows} registros más. Descargue en Excel para ver todos.`, { align: 'center' });
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

// GET /reportes/:id/excel - Descargar reporte como Excel por ID
router.get("/:id/excel", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const reporte = reportesGenerados.find((r) => r.id === parseInt(id));

    if (!reporte) {
      return res.status(404).json({ success: false, message: "Reporte no encontrado" });
    }

    if (!reporte.datos || !reporte.columnas) {
      return res.status(404).json({ success: false, message: "Datos del reporte no disponibles" });
    }

    // Crear workbook de Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión de Bienes';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(reporte.tipo.substring(0, 31));

    // Título
    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = reporte.tipo;
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    // Info
    worksheet.mergeCells('A2:H2');
    const dateCell = worksheet.getCell('A2');
    dateCell.value = `Generado: ${new Date(reporte.fecha).toLocaleDateString('es-EC')} | Por: ${reporte.generadoPor} | Registros: ${reporte.datos.length}`;
    dateCell.font = { italic: true, size: 10 };
    dateCell.alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    // Encabezados
    const headerRow = worksheet.addRow(reporte.columnas);
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
    reporte.datos.forEach((row, index) => {
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
      column.width = Math.max(reporte.columnas[i]?.length || 10, 15);
    });

    // Enviar archivo
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_${reporte.id}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("[ERROR] GET /reportes/:id/excel:", error.message);
    res.status(500).json({ success: false, message: "Error descargando Excel", error: error.message });
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
