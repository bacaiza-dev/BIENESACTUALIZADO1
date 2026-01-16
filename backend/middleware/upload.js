// middleware/upload.js - Configuración de multer para uploads
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "documents");
const TMP_DIR = path.join(__dirname, "..", "tmp");

/**
 * Asegurar que directorios existan
 */
function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.warn(`[WARNING] Could not create directory ${dir}: ${err.message}`);
  }
}

// Asegurar directorios al cargar el módulo
ensureDir(UPLOAD_DIR);
ensureDir(TMP_DIR);

/**
 * Storage para documentos
 */
const documentStorage = multer.diskStorage({
  destination(req, file, cb) {
    ensureDir(UPLOAD_DIR);
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * Multer para documentos (hasta 20MB)
 */
const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

/**
 * Multer para importación (en memoria, hasta 10MB)
 */
const uploadImport = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = {
  uploadDocument,
  uploadImport,
  UPLOAD_DIR,
  TMP_DIR,
  ensureDir,
};
