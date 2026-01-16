// routes/export.js - Exportación e importación de datos
const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { uploadImport } = require("../middleware/upload");
const { initializeDatabase } = require("../config/init-database");

// GET /export/:tabla - Exportar tabla a Excel/CSV
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

    const queries = {
      bienes: `
        SELECT b.codigo_institucional, b.codigo_senescyt, b.nombre, b.descripcion,
               b.marca, b.modelo, b.serie, b.estado, b.valor_adquisicion, b.fecha_adquisicion,
               c.nombre AS categoria, u.area AS ubicacion,
               CONCAT(us.nombre, ' ', us.apellido) AS responsable
        FROM bienes b
        LEFT JOIN categorias c ON b.categoria_id = c.id_cat
        LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
        LEFT JOIN usuarios us ON b.responsable_id = us.id_usuario
      `,
      usuarios: `SELECT id_usuario, nombre, apellido, email, activo, fecha_creacion FROM usuarios`,
      ubicaciones: `SELECT id_ubicacion, area as nombre, descripcion, sede as edificio, piso, tipo FROM ubicaciones`,
      categorias: `SELECT id_cat, nombre, descripcion, codigo FROM categorias`,
      mantenimientos: `
        SELECT m.id_mant, m.tipo, m.descripcion, m.estado, m.fecha_programada, m.fecha_limite,
               m.costo_estimado, m.prioridad, b.nombre AS bien
        FROM mantenimientos m
        LEFT JOIN bienes b ON m.bien_id = b.id_bien
      `,
    };

    let sql = queries[tabla];
    const params = [];

    if (dateFrom && tabla === "bienes") {
      sql += " WHERE b.fecha_adquisicion >= ?";
      params.push(dateFrom);
      if (dateTo) {
        sql += " AND b.fecha_adquisicion <= ?";
        params.push(dateTo);
      }
    } else if (dateTo && tabla === "bienes") {
      sql += " WHERE b.fecha_adquisicion <= ?";
      params.push(dateTo);
    }

    const rows = await query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(tabla);

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      sheet.addRow(headers);
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2563EB" },
      };
      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
      rows.forEach((row) => sheet.addRow(Object.values(row)));
      sheet.columns.forEach((col) => {
        col.width = 20;
      });
    }

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
    console.error("Error exportando:", error);
    res.status(500).json({
      success: false,
      message: "Error exportando datos",
      error: error.message,
    });
  }
});

// POST /import/:tabla - Importar datos desde Excel/CSV
router.post("/:tabla", verifyToken, requireAdmin, uploadImport.single("file"), async (req, res) => {
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

    if (!sheet) {
      return res.status(400).json({
        success: false,
        message: "No se pudo leer la hoja de Excel",
      });
    }

    let imported = 0;
    let errors = 0;

    // Procesar filas según la tabla
    // TODO: Implementar lógica específica para cada tabla

    res.json({
      success: true,
      message: `Importación completada: ${imported} registros importados, ${errors} errores`,
      data: { imported, errors },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error importando datos",
      error: error.message,
    });
  }
});

// POST /init-db - Inicializar base de datos
router.post("/init-db", verifyToken, requireAdmin, async (req, res) => {
  try {
    await initializeDatabase();
    res.json({
      success: true,
      message: "Base de datos inicializada correctamente",
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
