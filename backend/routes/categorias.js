// routes/categorias.js - CRUD de categorías
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { mapCategoriaRow } = require("../helpers/mappers");

// GET /categorias - Listar categorías
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search, activo } = req.query;
    
    // Columnas reales: id_categoria, nombre_categoria, codigo, descripcion, tipo, observaciones, activo
    let sql = "SELECT * FROM categorias WHERE 1=1";
    const params = [];

    if (search) {
      sql += " AND (nombre_categoria LIKE ? OR descripcion LIKE ? OR codigo LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (activo !== undefined) {
      sql += " AND activo = ?";
      params.push(activo === "true" ? 1 : 0);
    }

    sql += " ORDER BY nombre_categoria";

    const rows = await query(sql, params);
    res.json({ success: true, data: rows.map(mapCategoriaRow) });
  } catch (error) {
    console.error("[ERROR] GET /categorias:", error.message);
    res.json({ success: true, data: [] });
  }
});

// GET /categorias/:id - Obtener categoría por ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query("SELECT * FROM categorias WHERE id_categoria = ?", [id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Categoría no encontrada" });
    }

    res.json({ success: true, data: mapCategoriaRow(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo categoría", error: error.message });
  }
});

// POST /categorias - Crear categoría
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { nombre_categoria, nombre, descripcion, codigo, tipo, observaciones, activo } = req.body;
    
    const nombreFinal = nombre_categoria || nombre;

    if (!nombreFinal) {
      return res.status(400).json({ success: false, message: "Nombre es requerido" });
    }

    const result = await query(
      "INSERT INTO categorias (nombre_categoria, descripcion, codigo, tipo, observaciones, activo) VALUES (?, ?, ?, ?, ?, ?)",
      [nombreFinal, descripcion || null, codigo || null, tipo || null, observaciones || null, activo !== false ? 1 : 0]
    );

    res.json({ success: true, message: "Categoría creada", data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creando categoría", error: error.message });
  }
});

// PUT /categorias/:id - Actualizar categoría
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_categoria, nombre, descripcion, codigo, tipo, observaciones, activo } = req.body;
    
    const nombreFinal = nombre_categoria || nombre;

    await query(
      "UPDATE categorias SET nombre_categoria = ?, descripcion = ?, codigo = ?, tipo = ?, observaciones = ?, activo = ? WHERE id_categoria = ?",
      [nombreFinal, descripcion || null, codigo || null, tipo || null, observaciones || null, activo ? 1 : 0, id]
    );

    res.json({ success: true, message: "Categoría actualizada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando categoría", error: error.message });
  }
});

// DELETE /categorias/:id - Eliminar categoría
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const bienes = await query("SELECT COUNT(*) as count FROM bienes WHERE categoria_id = ?", [id]);

    if (bienes[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar: hay ${bienes[0].count} bienes en esta categoría`,
      });
    }

    await query("DELETE FROM categorias WHERE id_categoria = ?", [id]);

    res.json({ success: true, message: "Categoría eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando categoría", error: error.message });
  }
});

module.exports = router;
