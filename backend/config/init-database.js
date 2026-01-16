const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { query, testConnection } = require("./database");

const SQL_PATH = path.join(__dirname, "..", "..", "shared", "database", "init", "01-intbienes.sql");

const splitStatements = (sql) => {
  const lines = sql
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !line.startsWith("--") &&
        // Mantener comentarios condicionales tipo /*!40101 ... */; porque MySQL los ejecuta.
        !(line.startsWith("/*") && !line.startsWith("/*!")) &&
        !line.startsWith("*/")
    );

  const joined = lines.join("\n");
  return joined
    .split(/;\s*\n/)
    .map((stmt) => stmt.trim())
    .filter(Boolean);
};

const ensureDatabaseExists = async () => {
  const dbName = process.env.DB_NAME || "intbienes";

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
    );
  } finally {
    await connection.end();
  }
};

const initializeDatabase = async () => {
  let connected = await testConnection();
  if (!connected) {
    // En instalaciones "desde cero" puede no existir la BD; intentamos crearla y reintentar.
    try {
      await ensureDatabaseExists();
    } catch (error) {
      console.error("Error creando base de datos:", error.message);
      return false;
    }

    connected = await testConnection();
    if (!connected) {
      return false;
    }
  }

  if (!fs.existsSync(SQL_PATH)) {
    throw new Error(`SQL file not found: ${SQL_PATH}`);
  }

  const sql = fs.readFileSync(SQL_PATH, "utf8");
  const statements = splitStatements(sql);

  for (const statement of statements) {
    await query(statement);
  }

  return true;
};

module.exports = {
  initializeDatabase,
};
