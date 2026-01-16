// helpers/password.js - Funciones de hash y verificación de contraseñas
const bcrypt = require("bcrypt");
const crypto = require("crypto");

/**
 * Verificar contraseña contra hash
 */
function verifyPassword(password, hash) {
  if (!password || !hash) return false;

  // SHA256 fallback para hashes antiguos
  if (hash.length === 64) {
    const sha = crypto.createHash("sha256").update(password).digest("hex");
    return sha === hash;
  }

  // Bcrypt para hashes nuevos
  if (hash.startsWith("$2")) {
    try {
      return bcrypt.compareSync(password, hash);
    } catch {
      return false;
    }
  }

  // Hash MD5 legacy
  if (hash.length === 32) {
    const md5 = crypto.createHash("md5").update(password).digest("hex");
    return md5 === hash;
  }

  return false;
}

/**
 * Obtener número de rondas para bcrypt
 */
function getBcryptRounds() {
  const r = Number(process.env.BCRYPT_ROUNDS || 10);
  return Number.isInteger(r) && r >= 4 && r <= 15 ? r : 10;
}

/**
 * Hashear contraseña con bcrypt
 */
function hashPassword(password) {
  return bcrypt.hashSync(password, getBcryptRounds());
}

module.exports = {
  verifyPassword,
  getBcryptRounds,
  hashPassword,
};
