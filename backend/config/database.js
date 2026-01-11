// =============================================
// CONFIGURACIÓN DE BASE DE DATOS
// =============================================

require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuración de la conexión
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'intbienes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: 'Z'
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos exitosa');
    console.log(`📊 Base de datos: ${dbConfig.database}`);
    console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    return false;
  }
}

// Función para ejecutar consultas
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error ejecutando consulta:', error.message);
    throw error;
  }
}

// Función para obtener una conexión del pool
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Error obteniendo conexión:', error.message);
    throw error;
  }
}

// Función para cerrar el pool de conexiones
async function closePool() {
  try {
    await pool.end();
    console.log('Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error cerrando pool:', error.message);
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  testConnection,
  closePool
};