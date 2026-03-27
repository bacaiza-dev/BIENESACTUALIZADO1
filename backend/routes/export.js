// routes/export.js - Exportación e importación de datos
const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const multer = require("multer");

// Configuración de multer para archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv'
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no válido. Use Excel (.xlsx, .xls) o CSV.'), false);
    }
  }
});

// Historial de operaciones (en memoria para esta sesión)
const operationsHistory = [];

// GET /history - Obtener historial de operaciones
router.get("/history", verifyToken, (req, res) => {
  res.json({
    success: true,
    data: operationsHistory.slice(0, 50) // Últimas 50 operaciones
  });
});

// GET /:tabla - Exportar tabla a Excel/CSV
router.get("/:tabla", verifyToken, async (req, res) => {
  try {
    const { tabla } = req.params;
    const { formato = "excel", dateFrom, dateTo } = req.query;

    const tablasPermitidas = ["bienes", "usuarios", "ubicaciones", "categorias", "mantenimientos"];
    if (!tablasPermitidas.includes(tabla)) {
      return res.status(400).json({
        success: false,
        message: "Tabla no válida para exportación",
      });
    }

    // Queries corregidas según el esquema de la base de datos
    const queries = {
      bienes: `
        SELECT b.codigo_institucional, b.codigo_senescyt, b.nombre, b.descripcion,
               b.marca, b.modelo, b.serie, b.estado, COALESCE(b.valor, 0) as valor,
               c.nombre_categoria as categoria, u.area as ubicacion,
               CONCAT(us.nombres, ' ', COALESCE(us.apellidos, '')) as responsable
        FROM bienes b
        LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
        LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
        LEFT JOIN asignaciones_bien ab ON b.id_bien = ab.id_bien AND ab.activo = 1
        LEFT JOIN usuarios us ON ab.id_usuario = us.id_usuario
      `,
      usuarios: `
        SELECT id_usuario, nombres, apellidos, email, cedula, telefono, activo, 
               d.nombre as departamento, created_at
        FROM usuarios u
        LEFT JOIN departamentos d ON u.departamento_id = d.id_departamento
      `,
      ubicaciones: `
        SELECT id_ubicacion, area, descripcion, sede, piso, tipo, numero_aula, activo
        FROM ubicaciones
      `,
      categorias: `
        SELECT id_categoria, nombre_categoria, descripcion, codigo, tipo, activo
        FROM categorias
      `,
      mantenimientos: `
        SELECT m.id_mantenimiento, m.tipo, m.descripcion, m.estado, m.fecha_programada,
               m.prioridad, m.costo_estimado, b.nombre as bien_nombre
        FROM mantenimientos m
        LEFT JOIN bienes b ON m.id_bien = b.id_bien
      `,
    };

    let sql = queries[tabla];
    const params = [];

    // Añadir filtros de fecha si aplican
    if (dateFrom && tabla === "bienes") {
      sql += " WHERE b.created_at >= ?";
      params.push(dateFrom);
      if (dateTo) {
        sql += " AND b.created_at <= ?";
        params.push(dateTo);
      }
    } else if (dateTo && tabla === "bienes") {
      sql += " WHERE b.created_at <= ?";
      params.push(dateTo);
    }

    const rows = await query(sql, params);

const PDFDocument = require("pdfkit-table");

// ... inside the export endpoint ...

    if (formato === "pdf") {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=export_${tabla}_${Date.now()}.pdf`);

      doc.pipe(res);

      doc.fontSize(16).text(tabla.charAt(0).toUpperCase() + tabla.slice(1).replace(/_/g, ' '), { align: "center" });
      doc.moveDown();

      const headers = Object.keys(rows[0]);
      
      const table = {
        title: "",
        headers: headers.map(h => h.toUpperCase().replace(/_/g, " ")),
        rows: rows.map(r => Object.values(r))
      };

      await doc.table(table, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, i, isHeader, rectRow, rectCell) => {
              doc.font("Helvetica").fontSize(8);
              // striped rows
              if(i % 2 === 0 && !isHeader){ 
                  doc.addBackground(rectRow, 'blue', 0.15);
              }
          },
      });

      doc.end();
      return; 
    }

    // Existing Excel/CSV logic...
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Sistema de Gestión de Bienes';
    workbook.created = new Date();
    
    const sheet = workbook.addWorksheet(tabla.charAt(0).toUpperCase() + tabla.slice(1));

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      
      // Añadir encabezados con estilo
      const headerRow = sheet.addRow(headers);
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

      // Añadir datos
      rows.forEach((row, index) => {
        const dataRow = sheet.addRow(Object.values(row));
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

      // Ajustar anchos de columna
      sheet.columns.forEach((column, i) => {
        column.width = Math.max(headers[i]?.length || 10, 15);
      });
    }

    // Registrar en historial
    operationsHistory.unshift({
      id: Date.now(),
      fecha: new Date().toISOString(),
      tipo: 'Exportación',
      tabla,
      registros: rows.length,
      estado: 'completado',
      archivo_resultado: `export_${tabla}_${Date.now()}.${formato === 'csv' ? 'csv' : 'xlsx'}`,
      usuario: req.user?.email || 'Sistema'
    });

    // Enviar respuesta
    const ext = formato === "csv" ? "csv" : "xlsx";
    res.setHeader(
      "Content-Type",
      formato === "csv"
        ? "text/csv; charset=utf-8"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=export_${tabla}_${Date.now()}.${ext}`);

    if (formato === "csv") {
      await workbook.csv.write(res);
    } else {
      await workbook.xlsx.write(res);
    }
    res.end();
  } catch (error) {
    console.error("[ERROR] Exportando:", error.message);
    
    operationsHistory.unshift({
      id: Date.now(),
      fecha: new Date().toISOString(),
      tipo: 'Exportación',
      tabla: req.params.tabla,
      registros: 0,
      estado: 'error',
      error: error.message,
      usuario: req.user?.email || 'Sistema'
    });

    res.status(500).json({
      success: false,
      message: "Error exportando datos",
      error: error.message,
    });
  }
});

// POST /import/:tabla - Importar datos desde Excel/CSV
router.post("/import/:tabla", verifyToken, requireAdmin, upload.single("file"), async (req, res) => {
  try {
    const { tabla } = req.params;
    const { hasHeaders = "true", updateExisting = "false" } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Archivo requerido",
      });
    }

    const tablasPermitidas = ["bienes", "usuarios", "ubicaciones", "categorias"];
    if (!tablasPermitidas.includes(tabla)) {
      return res.status(400).json({
        success: false,
        message: "Tabla no válida para importación",
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet(1);

    if (!sheet || sheet.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No se pudo leer la hoja de Excel o está vacía",
      });
    }

    let inserted = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails = [];

    const startRow = hasHeaders === "true" ? 2 : 1;

    // Mapeos de columnas esperadas por tabla
    const tablaMappings = {
      bienes: {
        cols: ['codigo_institucional', 'nombre', 'marca', 'modelo', 'serie', 'estado', 'valor', 'categoria_id', 'ubicacion_id'],
        insertQuery: `INSERT INTO bienes (codigo_institucional, nombre, marca, modelo, serie, estado, valor, categoria_id, ubicacion_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      },
      usuarios: {
        cols: ['nombres', 'apellidos', 'email', 'cedula', 'telefono', 'password', 'departamento_id'],
        insertQuery: `INSERT INTO usuarios (nombres, apellidos, email, cedula, telefono, password_hash, departamento_id) VALUES (?, ?, ?, ?, ?, '$2b$10$defaulthash', ?)`
      },
      ubicaciones: {
        cols: ['area', 'tipo', 'sede', 'piso', 'numero_aula', 'descripcion'],
        insertQuery: `INSERT INTO ubicaciones (area, tipo, sede, piso, numero_aula, descripcion) VALUES (?, ?, ?, ?, ?, ?)`
      },
      categorias: {
        cols: ['nombre_categoria', 'codigo', 'tipo', 'descripcion'],
        insertQuery: `INSERT INTO categorias (nombre_categoria, codigo, tipo, descripcion) VALUES (?, ?, ?, ?)`
      }
    };

    const mapping = tablaMappings[tabla];

    // Procesar cada fila
    for (let rowNum = startRow; rowNum <= sheet.rowCount; rowNum++) {
      try {
        const row = sheet.getRow(rowNum);
        const values = [];

        // Extraer valores de la fila
        for (let col = 1; col <= mapping.cols.length; col++) {
          const cellValue = row.getCell(col).value;
          // Manejar diferentes tipos de valores de ExcelJS
          if (cellValue && typeof cellValue === 'object' && cellValue.result !== undefined) {
            values.push(cellValue.result);
          } else if (cellValue && typeof cellValue === 'object' && cellValue.text !== undefined) {
            values.push(cellValue.text);
          } else {
            values.push(cellValue ?? null);
          }
        }

        // Verificar que al menos el primer campo tenga valor
        if (!values[0] && !values[1]) {
          continue; // Saltar filas vacías
        }

        await query(mapping.insertQuery, values);
        inserted++;
      } catch (rowError) {
        errors++;
        errorDetails.push({ row: rowNum, error: rowError.message });
      }
    }

    // Registrar en historial
    operationsHistory.unshift({
      id: Date.now(),
      fecha: new Date().toISOString(),
      tipo: 'Importación',
      tabla,
      registros: inserted,
      estado: errors > 0 ? (inserted > 0 ? 'parcial' : 'error') : 'completado',
      errores: errors,
      usuario: req.user?.email || 'Sistema'
    });

    res.json({
      success: true,
      message: `Importación completada: ${inserted} registros insertados${errors > 0 ? `, ${errors} errores` : ''}`,
      data: { inserted, updated, errors, errorDetails: errorDetails.slice(0, 10) },
    });
  } catch (error) {
    console.error("[ERROR] Importando:", error.message);
    
    operationsHistory.unshift({
      id: Date.now(),
      fecha: new Date().toISOString(),
      tipo: 'Importación',
      tabla: req.params.tabla,
      registros: 0,
      estado: 'error',
      error: error.message,
      usuario: req.user?.email || 'Sistema'
    });

    res.status(500).json({
      success: false,
      message: "Error importando datos",
      error: error.message,
    });
  }
});

// POST /init-db - Inicializar base de datos (solo desarrollo/testing)
router.post("/init-db", verifyToken, requireAdmin, async (req, res) => {
  try {
    // Por seguridad, solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: "Operación no permitida en producción"
      });
    }

    res.json({
      success: true,
      message: "Funcionalidad de reinicio de base de datos deshabilitada por seguridad. Use Docker para reiniciar los volúmenes.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error inicializando base de datos",
      error: error.message,
    });
  }
});

module.exports = router;
