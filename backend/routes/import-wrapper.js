// import-wrapper.js - Redirige al endpoint de importación en export.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExcelJS = require('exceljs');
const { query } = require('../config/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

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

// POST /import/:tabla - Importar datos desde Excel/CSV
router.post('/:tabla', verifyToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { tabla } = req.params;
    const { hasHeaders = 'true', updateExisting = 'false' } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Archivo requerido',
      });
    }

    const tablasPermitidas = ['bienes', 'usuarios', 'ubicaciones', 'categorias'];
    if (!tablasPermitidas.includes(tabla)) {
      return res.status(400).json({
        success: false,
        message: 'Tabla no válida para importación',
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet(1);

    if (!sheet || sheet.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo leer la hoja de Excel o está vacía',
      });
    }

    let inserted = 0;
    let updated = 0;
    let errors = 0;
    const errorDetails = [];

    const startRow = hasHeaders === 'true' ? 2 : 1;

    // Mapeos de columnas esperadas por tabla
    const tablaMappings = {
      bienes: {
        cols: ['codigo_institucional', 'nombre', 'marca', 'modelo', 'serie', 'estado', 'valor', 'categoria_id', 'ubicacion_id'],
        insertQuery: `INSERT INTO bienes (codigo_institucional, nombre, marca, modelo, serie, estado, valor, categoria_id, ubicacion_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      },
      usuarios: {
        cols: ['nombres', 'apellidos', 'email', 'cedula', 'telefono', 'departamento_id'],
        insertQuery: `INSERT INTO usuarios (nombres, apellidos, email, cedula, telefono, password_hash, departamento_id, activo) VALUES (?, ?, ?, ?, ?, '$2b$10$placeholderHashForImport', ?, 1)`
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

    res.json({
      success: true,
      message: `Importación completada: ${inserted} registros insertados${errors > 0 ? `, ${errors} errores` : ''}`,
      data: { inserted, updated, errors, errorDetails: errorDetails.slice(0, 10) },
    });
  } catch (error) {
    console.error('[ERROR] Importando:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error importando datos',
      error: error.message,
    });
  }
});

module.exports = router;
