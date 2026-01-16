// helpers/utils.js - Funciones utilitarias generales

/**
 * Formatear fecha para MySQL
 */
function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * Normalizar estado de bien
 */
function normalizeEstadoBien(estado) {
  if (!estado) return "bueno";
  const normalized = String(estado).trim().toLowerCase();
  const validStates = ["bueno", "malo", "regular", "en_reparacion", "dado_baja"];
  if (validStates.includes(normalized)) return normalized;
  if (normalized === "en reparacion") return "en_reparacion";
  if (normalized === "dado baja" || normalized === "baja") return "dado_baja";
  return "bueno";
}

/**
 * Normalizar estado de ubicación
 */
function normalizeEstadoUbicacion(estado, activo) {
  if (activo === 0 || activo === false) return "inactivo";
  return estado || "activo";
}

/**
 * Asegurar que un directorio exista
 */
const fs = require("fs");
function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn(`[WARNING] Could not create directory ${dir}: ${err.message}`);
  }
}

/**
 * Convertir valor a formato SQL para backup
 */
function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

module.exports = {
  formatDate,
  normalizeEstadoBien,
  normalizeEstadoUbicacion,
  ensureDir,
  sqlValue,
};
