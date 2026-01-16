// routes/bienes.js - CRUD de bienes (activos)
const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { uploadDocument, UPLOAD_DIR } = require("../middleware/upload");
const { mapBienRow, mapDocumentoRow } = require("../helpers/mappers");

// GET /bienes - Listar bienes con filtros
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search, categoria, ubicacion, estado, responsable } = req.query;
    
    // Esquema real: categorias.nombre_categoria, usuarios.nombres/apellidos
    let sql = `
      SELECT b.*, 
             c.nombre_categoria as categoria_nombre, 
             u.area as ubicacion_nombre, u.sede as ubicacion_sede,
             CONCAT(us.nombres, ' ', us.apellidos) as responsable_nombre
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
      LEFT JOIN usuarios us ON b.responsable_id = us.id_usuario
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += " AND (b.nombre LIKE ? OR b.codigo_institucional LIKE ? OR b.serie LIKE ? OR b.marca LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (categoria) {
      sql += " AND b.categoria_id = ?";
      params.push(categoria);
    }
    
    if (ubicacion) {
      sql += " AND b.ubicacion_id = ?";
      params.push(ubicacion);
    }

    if (responsable) {
      sql += " AND b.responsable_id = ?";
      params.push(responsable);
    }

    if (estado) {
      sql += " AND b.estado = ?";
      params.push(estado);
    }

    sql += " ORDER BY b.created_at DESC";

    const rows = await query(sql, params);
    res.json({ success: true, data: rows.map(mapBienRow) });
  } catch (error) {
    console.error("[ERROR] GET /bienes:", error.message);
    res.json({ success: true, data: [] });
  }
});

// GET /bienes/:id - Obtener bien por ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query(`
      SELECT b.*, 
             c.nombre_categoria as categoria_nombre, 
             u.area as ubicacion_nombre, 
             CONCAT(us.nombres, ' ', us.apellidos) as responsable_nombre
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
      LEFT JOIN usuarios us ON b.responsable_id = us.id_usuario
      WHERE b.id_bien = ?
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Bien no encontrado" });
    }

    res.json({ success: true, data: mapBienRow(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo bien", error: error.message });
  }
});

// GET /bienes/:id/qr - Generar QR del bien
router.get("/:id/qr", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [bien] = await query("SELECT * FROM bienes WHERE id_bien = ?", [id]);
    
    if (!bien) {
      return res.status(404).json({ success: false, message: "Bien no encontrado" });
    }

    const qrData = JSON.stringify({
      id: bien.id_bien,
      codigo: bien.codigo_institucional,
      nombre: bien.nombre,
      serie: bien.serie
    });

    const qrImage = await QRCode.toDataURL(qrData);

    res.json({ success: true, qr: qrImage });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generando QR", error: error.message });
  }
});

// POST /bienes - Crear bien
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { 
      nombre, codigo_institucional, codigo_senescyt, categoria_id, ubicacion_id,
      marca, modelo, serie, estado, descripcion, valor, clase_de_bien,
      fecha_adquisicion, responsable_id, vida_util, valor_residual, proveedor,
      color, material, periodo_id, observaciones, nro_acta_entrega_recepcion,
      nro_acta_constatacion_fisica, anio_fabricacion
    } = req.body;

    if (!nombre || !codigo_institucional) {
      return res.status(400).json({ success: false, message: "Campos requeridos faltantes" });
    }

    const existing = await query(
      "SELECT id_bien FROM bienes WHERE codigo_institucional = ?",
      [codigo_institucional]
    );

    if (existing.length) {
      return res.status(400).json({ success: false, message: "El código institucional ya existe" });
    }

    const result = await query(
      `INSERT INTO bienes 
       (nombre, codigo_institucional, codigo_senescyt, categoria_id, ubicacion_id,
        marca, modelo, serie, estado, descripcion, valor, clase_de_bien,
        fecha_adquisicion, responsable_id, vida_util, valor_residual, proveedor,
        color, material, periodo_id, observaciones, nro_acta_entrega_recepcion,
        nro_acta_constatacion_fisica, anio_fabricacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, codigo_institucional, codigo_senescyt || null, categoria_id || null, ubicacion_id || null,
        marca || null, modelo || null, serie || null, estado || 'ACTIVO', 
        descripcion || null, valor || 0, clase_de_bien || null,
        fecha_adquisicion || null, responsable_id || null, vida_util || null, valor_residual || null,
        proveedor || null, color || null, material || null, periodo_id || null,
        observaciones || null, nro_acta_entrega_recepcion || null, nro_acta_constatacion_fisica || null,
        anio_fabricacion || null
      ]
    );

    res.json({ success: true, message: "Bien creado", data: { id: result.insertId } });
  } catch (error) {
    console.error("[ERROR] POST /bienes:", error.message);
    res.status(500).json({ success: false, message: "Error creando bien", error: error.message });
  }
});

// PUT /bienes/:id - Actualizar bien
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, codigo_institucional, codigo_senescyt, categoria_id, ubicacion_id,
      marca, modelo, serie, estado, descripcion, valor, clase_de_bien,
      fecha_adquisicion, responsable_id, vida_util, valor_residual, proveedor,
      color, material, periodo_id, observaciones
    } = req.body;

    await query(
      `UPDATE bienes 
       SET nombre = ?, codigo_institucional = ?, codigo_senescyt = ?, categoria_id = ?, 
           ubicacion_id = ?, marca = ?, modelo = ?, serie = ?, estado = ?, 
           descripcion = ?, valor = ?, clase_de_bien = ?, fecha_adquisicion = ?, 
           responsable_id = ?, vida_util = ?, valor_residual = ?, proveedor = ?,
           color = ?, material = ?, periodo_id = ?, observaciones = ?
       WHERE id_bien = ?`,
      [
        nombre, codigo_institucional, codigo_senescyt || null, categoria_id, 
        ubicacion_id, marca || null, modelo || null, serie || null, estado,
        descripcion || null, valor, clase_de_bien || null, fecha_adquisicion,
        responsable_id || null, vida_util || null, valor_residual || null, proveedor || null,
        color || null, material || null, periodo_id || null, observaciones || null, id
      ]
    );

    res.json({ success: true, message: "Bien actualizado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando bien", error: error.message });
  }
});

// DELETE /bienes/:id
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("UPDATE bienes SET estado = 'BAJA' WHERE id_bien = ?", [id]);
    res.json({ success: true, message: "Bien dado de baja" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando bien", error: error.message });
  }
});

// ==================== DOCUMENTOS ====================

router.get("/:id/documentos", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query("SELECT * FROM documentos_bienes WHERE bien_id = ?", [id]);
    res.json({ success: true, data: rows.map(mapDocumentoRow) });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

router.post("/:id/documentos", verifyToken, uploadDocument.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se envió archivo" });
    }

    const { originalname, filename, mimetype, size } = req.file;
    const { descripcion, tipo } = req.body;

    const result = await query(
      `INSERT INTO documentos_bienes 
       (bien_id, nombre_original, nombre_archivo, tipo, mime_type, tamano, descripcion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, originalname, filename, tipo || 'otro', mimetype, size, descripcion || null]
    );

    res.json({ success: true, message: "Documento subido", data: { id: result.insertId, filename } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error subiendo documento", error: error.message });
  }
});

router.get("/:id/documentos/:docId/download", verifyToken, async (req, res) => {
  try {
    const { docId } = req.params;
    const [doc] = await query("SELECT * FROM documentos_bienes WHERE id = ?", [docId]);
    
    if (!doc) {
      return res.status(404).json({ success: false, message: "Documento no encontrado" });
    }

    const filePath = path.join(UPLOAD_DIR, doc.nombre_archivo);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, doc.nombre_original);
    } else {
      res.status(404).json({ success: false, message: "Archivo físico no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error descargando", error: error.message });
  }
});

router.delete("/:id/documentos/:docId", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { docId } = req.params;
    const [doc] = await query("SELECT * FROM documentos_bienes WHERE id = ?", [docId]);

    if(doc) {
      const filePath = path.join(UPLOAD_DIR, doc.nombre_archivo);
      if(fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await query("DELETE FROM documentos_bienes WHERE id = ?", [docId]);
    }

    res.json({ success: true, message: "Documento eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando documento", error: error.message });
  }
});

module.exports = router;
