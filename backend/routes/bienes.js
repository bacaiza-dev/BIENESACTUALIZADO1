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
    const { search, categoria, ubicacion, estado, responsable, periodo_id } = req.query;
    
    // Esquema real: categorias.nombre_categoria, usuarios.nombres/apellidos
    let sql = `
      SELECT b.*, 
             c.nombre_categoria as categoria_nombre, 
             u.area as ubicacion_nombre, u.sede as ubicacion_sede,
             CONCAT(us.nombres, ' ', us.apellidos) as responsable_nombre,
             ab.id_usuario as responsable_id
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
      LEFT JOIN asignaciones_bien ab ON b.id_bien = ab.id_bien AND ab.activo = 1
      LEFT JOIN usuarios us ON ab.id_usuario = us.id_usuario
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

    if (periodo_id) {
      sql += " AND b.periodo_id = ?";
      params.push(periodo_id);
    }

    if (responsable) {
      sql += " AND ab.id_usuario = ?";
      params.push(responsable);
    }

    if (estado) {
      // Si se especifica estado (incluso BAJA para auditoría), se usa ese filtro
      sql += " AND b.estado = ?";
      params.push(estado);
    } else {
      // Por defecto, NO mostrar los dados de baja (eliminados lógicamente)
      sql += " AND b.estado != 'BAJA'";
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
             CONCAT(us.nombres, ' ', us.apellidos) as responsable_nombre,
             ab.id_usuario as responsable_id
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
      LEFT JOIN asignaciones_bien ab ON b.id_bien = ab.id_bien AND ab.activo = 1
      LEFT JOIN usuarios us ON ab.id_usuario = us.id_usuario
      WHERE b.id_bien = ?
    `, [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Bien no encontrado" });
    }

    // Obtener documentos asociados
    const docs = await query("SELECT * FROM documentos_bien WHERE id_bien = ? ORDER BY uploaded_at DESC", [id]);
    
    const bien = mapBienRow(rows[0]);
    bien.documentos = docs.map(d => ({
        id: d.id_documento,
        nombre: d.nombre_archivo,
        tipo: d.tipo_documento,
        tamano: d.tamano,
        mime_type: d.mime_type,
        url: `/api/documentos/${d.id_documento}/download`
    }));

    res.json({ success: true, data: bien });
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

// GET /bienes/estados - Obtener estados únicos
router.get("/estados/list", verifyToken, async (req, res) => {
    try {
        const rows = await query("SELECT DISTINCT estado FROM bienes WHERE estado IS NOT NULL ORDER BY estado ASC");
        const estados = rows.map(r => r.estado);
        // Default options if empty
        const defaults = ['ACTIVO', 'INACTIVO', 'DAÑADO', 'EN MANTENIMIENTO', 'BAJA'];
        const unique = [...new Set([...defaults, ...estados])].sort();
        
        res.json({ success: true, data: unique });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error obteniendo estados" });
    }
});

// POST /bienes - Crear bien
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { 
      nombre, codigo_institucional, codigo_senescyt: _codigo_senescyt, categoria_id, ubicacion_id,
      marca, modelo, serie, estado, descripcion, valor,
      fecha_adquisicion, responsable_id, vida_util, valor_residual,
      color, material, periodo_id, observaciones, nro_acta_entrega_recepcion,
      nro_acta_constatacion_fisica, depreciacion_acumulada
    } = req.body;

    // Normalize codigo_senescyt: treat 'N/A' or 'NA' (any case) as NULL (no aplica)
    let codigo_senescyt = null;
    if (typeof _codigo_senescyt === 'string') {
      const tmp = _codigo_senescyt.trim();
      codigo_senescyt = (/^n\/?a$/i.test(tmp) || tmp === '') ? null : tmp;
    } else {
      codigo_senescyt = _codigo_senescyt ?? null;
    }

    // NOTE: `codigo_senescyt` is optional — frontend sends `null` for "N/A".
    // Keep requiredFields limited to truly mandatory attributes.
    const requiredFields = {
        nombre, codigo_institucional, /* codigo_senescyt removed on purpose */ categoria_id,
        estado, marca, modelo, serie, color, material,
        nro_acta_entrega_recepcion
    };

    const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missingFields.length > 0) {
      console.log("[ERROR] Missing fields:", missingFields); // DEBUG
      return res.status(400).json({ 
          success: false, 
          message: `Campos requeridos faltantes: ${missingFields.join(', ')}` 
      });
    }

    const existing = await query(
      "SELECT id_bien FROM bienes WHERE codigo_institucional = ?",
      [codigo_institucional]
    );

    if (existing.length) {
      return res.status(400).json({ success: false, message: "El código institucional ya existe" });
    }

    // Only check SENESCYT uniqueness when a real code is provided
    if (codigo_senescyt) {
      const existingSenescyt = await query(
        "SELECT id_bien FROM bienes WHERE codigo_senescyt = ?",
        [codigo_senescyt]
      );

      if (existingSenescyt.length) {
        return res.status(400).json({ success: false, message: "El código SENESCYT ya existe", errors: { codigo_senescyt: 'El código SENESCYT ya existe' } });
      }
    }

    const result = await query(
      `INSERT INTO bienes 
       (nombre, codigo_institucional, codigo_senescyt, categoria_id, ubicacion_id,
        marca, modelo, serie, estado, descripcion, valor,
        fecha_adquisicion, vida_util, valor_residual,
        color, material, periodo_id, observaciones, nro_acta_entrega_recepcion,
        nro_acta_constatacion_fisica, depreciacion_acumulada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, codigo_institucional, codigo_senescyt || null, categoria_id || null, ubicacion_id || null,
        marca || null, modelo || null, serie || null, estado || 'ACTIVO', 
        descripcion || null, valor !== undefined ? valor : 0,
        fecha_adquisicion || null, vida_util || null, valor_residual !== undefined ? valor_residual : null,
        color || null, material || null, periodo_id || null,
        observaciones || null, nro_acta_entrega_recepcion || null, nro_acta_constatacion_fisica || null,
        depreciacion_acumulada !== undefined ? depreciacion_acumulada : null
      ]
    );

    // Si se envía responsable, crear asignación
    if (responsable_id) {
       await query(
         "INSERT INTO asignaciones_bien (id_bien, id_usuario, activo, observaciones) VALUES (?, ?, 1, 'Asignación inicial')",
         [result.insertId, responsable_id]
       );
    }

    res.json({ success: true, message: "Bien creado", data: { id: result.insertId } });
  } catch (error) {
    console.error("[ERROR] POST /bienes:", error.message);
    res.status(500).json({ success: false, message: "Error creando bien", error: error.message });
  }
});

// POST /bienes/batch-create - Crear múltiples bienes
router.post("/batch-create", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { 
      cantidad, 
      // Institucional
      codigo_prefix, codigo_start, 
      // Senescyt
      codigo_senescyt_prefix, codigo_senescyt_start,
      // Datos
      nombre, categoria_id, ubicacion_id, responsable_id,
      marca, modelo, serie_prefix, estado, descripcion, valor, 
      color, material, periodo_id,
      observaciones, fecha_adquisicion // New field
    } = req.body;

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ success: false, message: "Cantidad inválida" });
    }
    if (!nombre || !categoria_id) {
       return res.status(400).json({ success: false, message: "Nombre y Categoría son obligatorios" });
    }
    // Si no hay codigo_prefix, asumimos que puede ser opcional si el usuario lo decide (o validamos en frontend)
    // Pero por consistencia, mantengamos que el Institucional es requerido al menos el prefijo si se usa la lógica actual.
    // Si el usuario quiere manual TOTAL, igual necesitamos un patrón para el bucle.
    if (!codigo_prefix) {
        return res.status(400).json({ success: false, message: "El prefijo del código institucional es obligatorio" });
    }

    let createdCount = 0;
    let start = parseInt(codigo_start) || 1;
    let startSenescyt = parseInt(codigo_senescyt_start) || 1;

    for (let i = 0; i < cantidad; i++) {
        const currentCode = `${codigo_prefix}-${start + i}`;
        let currentSenescyt = null;
        if (codigo_senescyt_prefix) {
            currentSenescyt = `${codigo_senescyt_prefix}-${startSenescyt + i}`;
        }
        
        // Check uniqueness for this code (simple check)
        const existing = await query("SELECT id_bien FROM bienes WHERE codigo_institucional = ?", [currentCode]);
        if (existing.length) {
            continue; // Skip duplicates
        }

        // Check uniqueness for senescyt if exists
        if (currentSenescyt) {
            const existingSenescyt = await query("SELECT id_bien FROM bienes WHERE codigo_senescyt = ?", [currentSenescyt]);
            if (existingSenescyt.length) {
                // If senescyt clashes, maybe we should skip too to avoid integrity error?
                // For now let's skip code generation for this item or skip item entirely.
                // Skipping item allows user to retry with different range.
                continue;
            }
        }

        const result = await query(
            `INSERT INTO bienes 
            (nombre, codigo_institucional, codigo_senescyt, categoria_id, ubicacion_id,
                marca, modelo, serie, estado, descripcion, valor,
                color, material, periodo_id, observaciones, fecha_adquisicion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre, 
                currentCode, 
                currentSenescyt,
                categoria_id, 
                ubicacion_id || null,
                marca || null, 
                modelo || null, 
                serie_prefix ? `${serie_prefix}-${start + i}` : null, 
                estado || 'ACTIVO', 
                descripcion || null, 
                valor || 0, 
                color || null, 
                material || null, 
                periodo_id || null,
                observaciones || 'Creación por lotes',
                fecha_adquisicion || null
            ]
        );

        if (result.insertId && responsable_id) {
            await query(
                "INSERT INTO asignaciones_bien (id_bien, id_usuario, activo, observaciones) VALUES (?, ?, 1, 'Asignación por lote')",
                [result.insertId, responsable_id]
            );
        }
        createdCount++;
    }

    res.json({ success: true, message: `Se crearon ${createdCount} bienes exitosamente` });
  } catch (error) {
    console.error("[ERROR] POST /bienes/batch-create:", error);
    res.status(500).json({ success: false, message: "Error en creación por lotes", error: error.message });
  }
});

// PUT /bienes/:id - Actualizar bien
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, codigo_institucional, codigo_senescyt, categoria_id, ubicacion_id,
      marca, modelo, serie, estado, descripcion, valor,
      fecha_adquisicion, responsable_id, vida_util, valor_residual,
      color, material, periodo_id, observaciones, nro_acta_entrega_recepcion,
      nro_acta_constatacion_fisica, depreciacion_acumulada
    } = req.body;

    // Log para depuración
    console.log('[PUT /bienes/:id] Validando duplicidad:', {
      id,
      codigo_institucional
    });
    const existing = await query(
      "SELECT id_bien FROM bienes WHERE codigo_institucional = ? AND id_bien != ?",
      [codigo_institucional, id]
    );
    console.log('[PUT /bienes/:id] Resultado de búsqueda de duplicados:', existing);

    if (existing.length) {
      console.log('[PUT /bienes/:id] Duplicado detectado para código institucional:', codigo_institucional, 'con id diferente:', existing);
      return res.status(400).json({ success: false, message: "El código institucional ya existe" });
    }

    // Normalize codigo_senescyt for update: treat 'N/A' or empty as NULL
    let normalizedSenescyt = null
    if (typeof codigo_senescyt === 'string') {
      const tmp = codigo_senescyt.trim()
      normalizedSenescyt = (/^n\/?a$/i.test(tmp) || tmp === '') ? null : tmp
    } else {
      normalizedSenescyt = codigo_senescyt ?? null
    }

    // Validar duplicidad sólo si viene un código real
    if (normalizedSenescyt) {
        const existingSenescyt = await query(
            "SELECT id_bien FROM bienes WHERE codigo_senescyt = ? AND id_bien != ?",
            [normalizedSenescyt, id]
        );
        if (existingSenescyt.length) {
            return res.status(400).json({ success: false, message: "El código SENESCYT ya existe", errors: { codigo_senescyt: 'El código SENESCYT ya existe' } });
        }
    }

    await query(
      `UPDATE bienes 
       SET nombre = ?, codigo_institucional = ?, codigo_senescyt = ?, categoria_id = ?, 
           ubicacion_id = ?, marca = ?, modelo = ?, serie = ?, estado = ?, 
           descripcion = ?, valor = ?, fecha_adquisicion = ?, 
           vida_util = ?, valor_residual = ?,
           color = ?, material = ?, periodo_id = ?, observaciones = ?,
           nro_acta_entrega_recepcion = ?, nro_acta_constatacion_fisica = ?,
           depreciacion_acumulada = ?
       WHERE id_bien = ?`,
      [
        nombre, codigo_institucional, normalizedSenescyt || null, categoria_id, 
        ubicacion_id || null, marca || null, modelo || null, serie || null, estado,
        descripcion || null, valor !== undefined ? valor : 0, fecha_adquisicion,
        vida_util || null, valor_residual !== undefined ? valor_residual : null,
        color || null, material || null, periodo_id || null, observaciones || null,
        nro_acta_entrega_recepcion || null, nro_acta_constatacion_fisica || null,
        depreciacion_acumulada !== undefined ? depreciacion_acumulada : null,
        id
      ]
    );

    // Actualizar responsable si cambió y registrar en historial
    if (responsable_id !== undefined) {
      // Obtener asignación actual con datos del usuario
      const currentAssignment = await query(
        `SELECT ab.id_usuario, CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre
         FROM asignaciones_bien ab
         LEFT JOIN usuarios u ON ab.id_usuario = u.id_usuario
         WHERE ab.id_bien = ? AND ab.activo = 1`, 
        [id]
      );
      
      const current = currentAssignment[0];
      const currentId = current ? current.id_usuario : null;
      const currentNombre = current ? current.usuario_nombre : null;

      // Si el responsable cambió
      if (parseInt(responsable_id) !== currentId) {
        // Obtener nombre del nuevo responsable
        let newResponsableName = null;
        if (responsable_id) {
          const [newUser] = await query(
            "SELECT CONCAT(nombres, ' ', apellidos) as usuario_nombre FROM usuarios WHERE id_usuario = ?",
            [responsable_id]
          );
          newResponsableName = newUser ? newUser.usuario_nombre : null;
        }

        // Registrar en historial
        await query(
          `INSERT INTO historial_responsables 
           (id_bien, id_usuario_anterior, id_usuario_nuevo, responsable_anterior, responsable_nuevo, usuario_que_cambio)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, currentId, responsable_id || null, currentNombre, newResponsableName, req.user?.id || null]
        );
        
        // Desactivar anterior
        await query(
            "UPDATE asignaciones_bien SET activo = 0, fecha_devolucion = NOW() WHERE id_bien = ? AND activo = 1",
            [id]
        );
        
        // Crear nueva si no es nulo
        if (responsable_id) {
            await query(
                "INSERT INTO asignaciones_bien (id_bien, id_usuario, activo) VALUES (?, ?, 1)",
                [id, responsable_id]
            );
        }
      }
    }

    res.json({ success: true, message: "Bien actualizado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando bien", error: error.message });
  }
});

// DELETE /bienes/:id
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM bienes WHERE id_bien = ?", [id]);
    res.json({ success: true, message: "Bien eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando bien", error: error.message });
  }
});

// POST /bienes/bulk-delete - Eliminar varios bienes por IDs (y sus relaciones básicas)
router.post("/bulk-delete", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere un arreglo de ids a eliminar' });
    }

    // Construir placeholders seguros
    const placeholders = ids.map(() => '?').join(',');

    // Eliminar relaciones que podrían quedar huérfanas
    await query(`DELETE FROM documentos_bien WHERE id_bien IN (${placeholders})`, ids);
    await query(`DELETE FROM asignaciones_bien WHERE id_bien IN (${placeholders})`, ids);

    // Eliminar bienes
    const result = await query(`DELETE FROM bienes WHERE id_bien IN (${placeholders})`, ids);

    res.json({ success: true, message: `Se eliminaron ${result.affectedRows || ids.length} bienes` });
  } catch (error) {
    console.error('[ERROR] POST /bienes/bulk-delete:', error.message);
    res.status(500).json({ success: false, message: 'Error eliminando bienes en lote', error: error.message });
  }
});


// GET /bienes/:id/pdf - Generate PDF for a single asset
router.get("/:id/pdf", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const PDFDocument = require("pdfkit-table");

        const rows = await query(`
            SELECT b.*, 
                   c.nombre_categoria as categoria_nombre, 
                   u.area as ubicacion_nombre, u.sede as ubicacion_sede,
                   CONCAT(us.nombres, ' ', us.apellidos) as responsable_nombre
            FROM bienes b
            LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
            LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
            LEFT JOIN asignaciones_bien ab ON b.id_bien = ab.id_bien AND ab.activo = 1
            LEFT JOIN usuarios us ON ab.id_usuario = us.id_usuario
            WHERE b.id_bien = ?
        `, [id]);

        if (!rows.length) {
            return res.status(404).json({ success: false, message: "Bien no encontrado" });
        }

        const bien = rows[0];

        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=bien_${bien.codigo_institucional}_${Date.now()}.pdf`);

        doc.pipe(res);

        // Header
        doc.fillColor("#1e3a8a").fontSize(20).text("REPORTE INDIVIDUAL DE BIEN", { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor("black").text(`Generado el: ${new Date().toLocaleString()}`, { align: "center" });
        doc.moveDown(2);

        // Section Helper
        const drawSection = (title, data) => {
            doc.fillColor("#1e3a8a").fontSize(14).text(title, { underline: true });
            doc.moveDown(0.5);
            
            doc.fontSize(10).fillColor("black");
            Object.entries(data).forEach(([key, value]) => {
                doc.font("Helvetica-Bold").text(`${key}: `, { continued: true })
                   .font("Helvetica").text(value || "N/A");
                doc.text(" "); // Force new line
            });
            doc.moveDown(1.5);
        };

        // 1. Información General
        drawSection("1. INFORMACIÓN GENERAL", {
            "Código Institucional": bien.codigo_institucional,
            "Código SENESCYT": bien.codigo_senescyt,
            "Nombre del Bien": bien.nombre,
            "Categoría": bien.categoria_nombre,
            "Estado": bien.estado,
            "Descripción": bien.descripcion
        });

        // 2. Ubicación y Responsable
        drawSection("2. UBICACIÓN Y RESPONSABLE", {
            "Ubicación": bien.ubicacion_nombre,
            "Sede/Edificio": bien.ubicacion_sede,
            "Responsable Actual": bien.responsable_nombre
        });

        // 3. Detalles Técnicos
        drawSection("3. DETALLES TÉCNICOS", {
            "Marca": bien.marca,
            "Modelo": bien.modelo,
            "Serie": bien.serie,
            "Año Fabricación": bien.anio_fabricacion,
            "Color": bien.color,
            "Material": bien.material,
            "Condición": bien.condicion || "Bueno"
        });

         // 4. Información Financiera
         drawSection("4. INFORMACIÓN FINANCIERA", {
            "Valor Adquisición": `$${bien.valor ? bien.valor.toFixed(2) : '0.00'}`,
            "Valor Residual": `$${bien.valor_residual ? bien.valor_residual.toFixed(2) : '0.00'}`,
            "Vida Útil": `${bien.vida_util || 0} años`,
            "Depreciación Acumulada": `$${bien.depreciacion_acumulada || 0}`,
            "Fecha Adquisición": bien.fecha_adquisicion ? new Date(bien.fecha_adquisicion).toLocaleDateString() : 'N/A'
        });

        // Add QR Code
        const qrContent = JSON.stringify({ 
            id: bien.id_bien, 
            codigo: bien.codigo_institucional 
        });
        
        try {
             const buffer = await QRCode.toBuffer(qrContent);
             doc.moveDown();
             doc.image(buffer, { fit: [100, 100], align: 'center' });
             doc.fontSize(8).text(bien.codigo_institucional, { align: "center" });
        } catch(e) {
             console.error("QR Generation error for PDF", e);
        }

        doc.end();

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ success: false, message: "Error creando PDF", error: error.message });
    }
});

// GET /bienes/:id/historial-responsables - Obtener historial de cambios de responsables
router.get("/:id/historial-responsables", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const rows = await query(
            `SELECT 
                hr.id,
                hr.id_bien,
                hr.responsable_anterior,
                hr.responsable_nuevo,
                hr.fecha_cambio,
                hr.motivo,
                CONCAT(u.nombres, ' ', u.apellidos) as usuario_que_cambio
            FROM historial_responsables hr
            LEFT JOIN usuarios u ON hr.usuario_que_cambio = u.id_usuario
            WHERE hr.id_bien = ?
            ORDER BY hr.fecha_cambio DESC`,
            [id]
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Error obtaining historial responsables:", error);
        res.status(500).json({ success: false, message: "Error obteniendo historial", error: error.message });
    }
});


module.exports = router;

