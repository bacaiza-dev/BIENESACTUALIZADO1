// routes/aulas-asignadas.js - Asignaciones de aulas a custodios
const express = require("express");
const router = express.Router();
const ExcelJS = require("exceljs");
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// GET /aulas-asignadas - Listar asignaciones
router.get("/", verifyToken, async (req, res) => {
  try {
    const { periodo_id, usuario_id } = req.query;

    // Columnas reales: us.nombres, us.apellidos (no us.nombre, us.apellido)
    let sql = `
      SELECT aa.id, aa.ubicacion_id, aa.usuario_id, aa.periodo_id, aa.observaciones, aa.activo,
             u.id_ubicacion as 'ubicacion.id', u.tipo as 'ubicacion.tipo', 
             CONCAT(u.tipo, ' - ', COALESCE(u.numero_aula, u.descripcion, '')) as 'ubicacion.nombre',
             u.piso as 'ubicacion.piso', u.sede as 'ubicacion.edificio', u.numero_aula as 'ubicacion.aula',
             u.capacidad as 'ubicacion.capacidad',
             us.id_usuario as 'custodio.id', us.nombres as 'custodio.nombre', 
             us.apellidos as 'custodio.apellido', us.email as 'custodio.email',
             pa.id_periodo as 'periodo.id', pa.nombre_periodo as 'periodo.nombre',
             (SELECT COUNT(*) FROM bienes WHERE ubicacion_id = aa.ubicacion_id) as bienes_count
      FROM aulas_asignadas aa
      JOIN ubicaciones u ON aa.ubicacion_id = u.id_ubicacion
      JOIN usuarios us ON aa.usuario_id = us.id_usuario
      JOIN periodos_academicos pa ON aa.periodo_id = pa.id_periodo
      WHERE aa.activo = 1
    `;
    const params = [];

    if (periodo_id) {
      sql += " AND aa.periodo_id = ?";
      params.push(periodo_id);
    }
    if (usuario_id) {
      sql += " AND aa.usuario_id = ?";
      params.push(usuario_id);
    }

    sql += " ORDER BY pa.fecha_inicio DESC, u.tipo, u.numero_aula";

    const rows = await query(sql, params);

    const data = rows.map((row) => {
      const result = {
        id: row.id,
        ubicacion_id: row.ubicacion_id,
        usuario_id: row.usuario_id,
        periodo_id: row.periodo_id,
        observaciones: row.observaciones,
        activo: row.activo === 1,
        bienes_count: row.bienes_count || 0,
        ubicacion: {},
        custodio: {},
        periodo: {},
      };

      Object.keys(row).forEach((key) => {
        if (key.startsWith("ubicacion.")) {
          result.ubicacion[key.replace("ubicacion.", "")] = row[key];
        } else if (key.startsWith("custodio.")) {
          result.custodio[key.replace("custodio.", "")] = row[key];
        } else if (key.startsWith("periodo.")) {
          result.periodo[key.replace("periodo.", "")] = row[key];
        }
      });

      return result;
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("[ERROR] GET /aulas-asignadas:", error.message);
    res.json({ success: true, data: [] });
  }
});

// GET /aulas-asignadas/export - Exportar asignaciones
router.get("/export", verifyToken, async (req, res) => {
  try {
    const { periodo_id, usuario_id } = req.query;

    let sql = `
      SELECT 
        CONCAT(u.tipo, ' - ', COALESCE(u.numero_aula, '')) as Aula,
        u.sede as Edificio, u.piso as Piso, u.capacidad as Capacidad,
        CONCAT(us.nombres, ' ', us.apellidos) as Custodio,
        us.email as Email,
        pa.nombre_periodo as Periodo, 
        aa.observaciones as Observaciones,
        (SELECT COUNT(*) FROM bienes WHERE ubicacion_id = aa.ubicacion_id) as Bienes
      FROM aulas_asignadas aa
      JOIN ubicaciones u ON aa.ubicacion_id = u.id_ubicacion
      JOIN usuarios us ON aa.usuario_id = us.id_usuario
      JOIN periodos_academicos pa ON aa.periodo_id = pa.id_periodo
      WHERE aa.activo = 1
    `;
    const params = [];

    if (periodo_id) {
      sql += " AND aa.periodo_id = ?";
      params.push(periodo_id);
    }
    if (usuario_id) {
      sql += " AND aa.usuario_id = ?";
      params.push(usuario_id);
    }

    const rows = await query(sql, params);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Aulas Asignadas");

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]);
      sheet.addRow(headers);
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "2563EB" } };
      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
      rows.forEach((row) => sheet.addRow(Object.values(row)));
      sheet.columns.forEach((col) => { col.width = 20; });
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=aulas_asignadas_${Date.now()}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: "Error exportando", error: error.message });
  }
});

// POST /aulas-asignadas
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { ubicacion_id, usuario_id, periodo_id, observaciones } = req.body;

    if (!ubicacion_id || !usuario_id || !periodo_id) {
      return res.status(400).json({ success: false, message: "Aula, custodio y periodo son requeridos" });
    }

    const result = await query(
      `INSERT INTO aulas_asignadas (ubicacion_id, usuario_id, periodo_id, observaciones) VALUES (?, ?, ?, ?)`,
      [ubicacion_id, usuario_id, periodo_id, observaciones || null]
    );

    res.json({ success: true, message: "Asignación creada", data: { id: result.insertId } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Esta aula ya está asignada en este periodo" });
    }
    res.status(500).json({ success: false, message: "Error creando asignación", error: error.message });
  }
});

// PUT /aulas-asignadas/:id
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { ubicacion_id, usuario_id, periodo_id, observaciones } = req.body;

    await query(
      `UPDATE aulas_asignadas SET ubicacion_id = ?, usuario_id = ?, periodo_id = ?, observaciones = ? WHERE id = ?`,
      [ubicacion_id, usuario_id, periodo_id, observaciones || null, id]
    );

    res.json({ success: true, message: "Asignación actualizada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando asignación", error: error.message });
  }
});

// DELETE /aulas-asignadas/:id
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("UPDATE aulas_asignadas SET activo = 0 WHERE id = ?", [id]);
    res.json({ success: true, message: "Asignación eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando asignación", error: error.message });
  }
});

module.exports = router;
