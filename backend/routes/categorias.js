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
    let sql = `
      SELECT c.*, 
      (SELECT COUNT(*) FROM bienes b WHERE b.categoria_id = c.id_categoria AND b.estado != 'BAJA') as bienes_count
      FROM categorias c 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += " AND (c.nombre_categoria LIKE ? OR c.descripcion LIKE ? OR c.codigo LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (activo !== undefined) {
      sql += " AND c.activo = ?";
      params.push(activo === "true" ? 1 : 0);
    } else {
      // Por defecto solo activos
      sql += " AND c.activo = 1";
    }

    sql += " ORDER BY c.nombre_categoria";

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
    
    const nombreFinal = (nombre_categoria || nombre || '').toString().trim();

    if (!nombreFinal) {
      return res.status(400).json({ success: false, message: "Nombre es requerido" });
    }

    // Verificar duplicado por nombre (case-insensitive, trim)
    const dup = await query(
      'SELECT id_categoria FROM categorias WHERE LOWER(TRIM(nombre_categoria)) = LOWER(TRIM(?)) LIMIT 1',
      [nombreFinal]
    );
    if (dup.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    }

    // Validar código único
    if (codigo) {
      const existing = await query("SELECT id_categoria FROM categorias WHERE codigo = ?", [codigo]);
      if (existing.length) {
        return res.status(400).json({ success: false, message: "El código ya existe" });
      }
    }

    const result = await query(
      "INSERT INTO categorias (nombre_categoria, descripcion, codigo, tipo, observaciones, activo) VALUES (?, ?, ?, ?, ?, ?)",
      [nombreFinal, descripcion || null, codigo || null, tipo || null, observaciones || null, activo !== false ? 1 : 0]
    );

    res.json({ success: true, message: "Categoría creada", data: { id: result.insertId } });
  } catch (error) {
    // Manejar conflicto por índice único si existiera
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre', error: error.message });
    }
    res.status(500).json({ success: false, message: "Error creando categoría", error: error.message });
  }
});

// PUT /categorias/:id - Actualizar categoría
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_categoria, nombre, descripcion, codigo, tipo, observaciones, activo } = req.body;
    
    const nombreFinal = (nombre_categoria || nombre || '').toString().trim();

    if (!nombreFinal) {
      return res.status(400).json({ success: false, message: 'Nombre es requerido' });
    }

    // Verificar duplicado por nombre (case-insensitive, trim), excluyendo el registro actual
    const dup = await query(
      'SELECT id_categoria FROM categorias WHERE LOWER(TRIM(nombre_categoria)) = LOWER(TRIM(?)) AND id_categoria != ? LIMIT 1',
      [nombreFinal, id]
    );
    if (dup.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    }

    // Validar código único
    if (codigo) {
      const existing = await query("SELECT id_categoria FROM categorias WHERE codigo = ? AND id_categoria != ?", [codigo, id]);
      if (existing.length) {
        return res.status(400).json({ success: false, message: "El código ya existe" });
      }
    }

    await query(
      "UPDATE categorias SET nombre_categoria = ?, descripcion = ?, codigo = ?, tipo = ?, observaciones = ?, activo = ? WHERE id_categoria = ?",
      [nombreFinal, descripcion || null, codigo || null, tipo || null, observaciones || null, activo ? 1 : 0, id]
    );

    res.json({ success: true, message: "Categoría actualizada" });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Ya existe una categoría con ese nombre', error: error.message });
    }
    res.status(500).json({ success: false, message: "Error actualizando categoría", error: error.message });
  }
});

// DELETE /categorias/:id - Eliminar categoría (soft delete). Si ?force=true => eliminación permanente (solo si no hay bienes asociados)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    if (force === 'true') {
      // Eliminación definitiva: verificar que NO exista ningún bien (cualquier estado)
      const allBienes = await query("SELECT COUNT(*) as count FROM bienes WHERE categoria_id = ?", [id]);
      const count = allBienes[0]?.count || 0;
      if (count > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar definitivamente: existen ${count} bien(es) asociados a esta categoría`,
        });
      }

      // Eliminar definitivamente
      await query('DELETE FROM categorias WHERE id_categoria = ?', [id]);
      return res.json({ success: true, message: 'Categoría eliminada definitivamente' });
    }

    // Comportamiento por defecto: soft-delete (inactivar) — verificar bienes activos
    const bienes = await query("SELECT COUNT(*) as count FROM bienes WHERE categoria_id = ? AND estado != 'BAJA'", [id]);

    if (bienes[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar categoría en uso: hay ${bienes[0].count} bien(es) asignado(s) a esta categoría`,
      });
    }

    // Soft delete - cambiar a inactivo en lugar de borrar
    await query("UPDATE categorias SET activo = 0 WHERE id_categoria = ?", [id]);

    res.json({ success: true, message: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando categoría", error: error.message });
  }
});

module.exports = router;
