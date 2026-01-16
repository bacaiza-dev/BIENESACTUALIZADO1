// routes/documentos.js - CRUD de documentos (tabla: documentos_bien)
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { uploadDocument, UPLOAD_DIR } = require("../middleware/upload");
const path = require("path");
const fs = require("fs");

// GET /documentos - Listar todos los documentos
router.get("/", verifyToken, async (req, res) => {
  try {
    const { tipo, bien_id, search } = req.query;
    
    // Tabla real: documentos_bien (no documentos_bienes)
    let sql = `
      SELECT d.*, b.nombre as bien_nombre, b.codigo_institucional as bien_codigo,
             CONCAT(u.nombres, ' ', u.apellidos) as subido_por_nombre
      FROM documentos_bien d
      LEFT JOIN bienes b ON d.id_bien = b.id_bien
      LEFT JOIN usuarios u ON d.subido_por = u.id_usuario
      WHERE 1=1
    `;
    const params = [];

    if (tipo) {
      sql += " AND d.tipo_documento = ?";
      params.push(tipo);
    }

    if (bien_id) {
      sql += " AND d.id_bien = ?";
      params.push(bien_id);
    }

    if (search) {
      sql += " AND (d.nombre_archivo LIKE ? OR d.descripcion LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += " ORDER BY d.uploaded_at DESC";

    const rows = await query(sql, params);
    
    // Calcular estadísticas
    const stats = {
      total: rows.length,
      facturas: rows.filter(r => r.tipo_documento === 'factura').length,
      garantias: rows.filter(r => r.tipo_documento === 'garantia').length,
      manuales: rows.filter(r => r.tipo_documento === 'manual').length,
      fotos: rows.filter(r => r.tipo_documento === 'foto').length,
      totalBytes: rows.reduce((acc, curr) => acc + (Number(curr.tamano) || 0), 0)
    };

    res.json({ 
      success: true, 
      data: rows.map(row => ({
        id: row.id_documento,
        bien_id: row.id_bien,
        bien_nombre: row.bien_nombre,
        bien_codigo: row.bien_codigo,
        nombre: row.nombre_archivo,
        nombre_archivo: row.nombre_archivo,
        tipo: row.tipo_documento,
        mime_type: row.mime_type,
        tamano: row.tamano,
        descripcion: row.descripcion,
        url: row.url_archivo || `/api/documentos/${row.id_documento}/download`,
        subido_por: row.subido_por,
        subido_por_nombre: row.subido_por_nombre,
        created_at: row.uploaded_at
      })),
      stats
    });
  } catch (error) {
    console.error("[ERROR] GET /documentos:", error.message);
    res.json({ 
      success: true, 
      data: [], 
      stats: { total: 0, facturas: 0, garantias: 0, manuales: 0, fotos: 0, totalBytes: 0 } 
    });
  }
});

// GET /documentos/:id
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [doc] = await query("SELECT * FROM documentos_bien WHERE id_documento = ?", [id]);
    
    if (!doc) {
      return res.status(404).json({ success: false, message: "Documento no encontrado" });
    }

    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo documento", error: error.message });
  }
});

// GET /documentos/:id/download
router.get("/:id/download", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [doc] = await query("SELECT * FROM documentos_bien WHERE id_documento = ?", [id]);
    
    if (!doc) {
      return res.status(404).json({ success: false, message: "Documento no encontrado" });
    }

    if (doc.url_archivo && fs.existsSync(doc.url_archivo)) {
      res.download(doc.url_archivo, doc.nombre_archivo);
    } else if (UPLOAD_DIR && fs.existsSync(path.join(UPLOAD_DIR, doc.nombre_archivo))) {
      res.download(path.join(UPLOAD_DIR, doc.nombre_archivo), doc.nombre_archivo);
    } else {
      res.status(404).json({ success: false, message: "Archivo físico no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error descargando", error: error.message });
  }
});

// POST /documentos
router.post("/", verifyToken, uploadDocument.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No se envió archivo" });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    const { id_bien, descripcion, tipo_documento } = req.body;

    const result = await query(
      `INSERT INTO documentos_bien 
       (id_bien, subido_por, tipo_documento, nombre_archivo, url_archivo, descripcion, tamano, mime_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id_bien || null, req.user.id, tipo_documento || 'otro', originalname, filePath || filename, descripcion || null, size, mimetype]
    );

    res.json({ success: true, message: "Documento subido", data: { id: result.insertId, filename } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error subiendo documento", error: error.message });
  }
});

// DELETE /documentos/:id
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [doc] = await query("SELECT * FROM documentos_bien WHERE id_documento = ?", [id]);

    if (doc) {
      if (doc.url_archivo && fs.existsSync(doc.url_archivo)) {
        fs.unlinkSync(doc.url_archivo);
      }
      await query("DELETE FROM documentos_bien WHERE id_documento = ?", [id]);
    }

    res.json({ success: true, message: "Documento eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando documento", error: error.message });
  }
});

module.exports = router;
