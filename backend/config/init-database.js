// =============================================
// INICIALIZACIÓN DE BASE DE DATOS
// =============================================

const { query, testConnection } = require('./database');

// SQL para crear tablas básicas
const createTables = async () => {
  try {
    console.log('📊 Iniciando creación de tablas...');

    // Tabla de usuarios
    await query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'usuario', 'supervisor') DEFAULT 'usuario',
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tabla de categorías
    await query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tabla de ubicaciones
    await query(`
      CREATE TABLE IF NOT EXISTS ubicaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Tabla de bienes
    await query(`
      CREATE TABLE IF NOT EXISTS bienes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        categoria_id INT,
        ubicacion_id INT,
        usuario_id INT,
        estado ENUM('activo', 'inactivo', 'mantenimiento', 'baja') DEFAULT 'activo',
        valor_adquisicion DECIMAL(10,2),
        fecha_adquisicion DATE,
        numero_serie VARCHAR(255),
        marca VARCHAR(255),
        modelo VARCHAR(255),
        observaciones TEXT,
        qr_code VARCHAR(255),
        imagen_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id),
        FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    // Tabla de movimientos
    await query(`
      CREATE TABLE IF NOT EXISTS movimientos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bien_id INT NOT NULL,
        usuario_id INT NOT NULL,
        tipo ENUM('asignacion', 'traslado', 'mantenimiento', 'baja') NOT NULL,
        ubicacion_origen INT,
        ubicacion_destino INT,
        fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        observaciones TEXT,
        FOREIGN KEY (bien_id) REFERENCES bienes(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (ubicacion_origen) REFERENCES ubicaciones(id),
        FOREIGN KEY (ubicacion_destino) REFERENCES ubicaciones(id)
      )
    `);

    console.log('✅ Tablas creadas exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
    return false;
  }
};

// Función para crear un usuario administrador por defecto
const createDefaultAdmin = async () => {
  try {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await query(`
      INSERT IGNORE INTO usuarios (nombre, email, password, rol)
      VALUES ('Administrador', 'admin@intbienes.com', ?, 'admin')
    `, [hashedPassword]);
    
    console.log('✅ Usuario administrador creado');
    return true;
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error.message);
    return false;
  }
};

// Función para crear categorías por defecto
const createDefaultCategories = async () => {
  try {
    const categorias = [
      { nombre: 'Equipos de Cómputo', descripcion: 'Computadoras, laptops, tablets' },
      { nombre: 'Mobiliario', descripcion: 'Escritorios, sillas, archivadores' },
      { nombre: 'Equipos Audiovisuales', descripcion: 'Proyectores, pantallas, equipos de sonido' },
      { nombre: 'Vehículos', descripcion: 'Automóviles, motocicletas, bicicletas' },
      { nombre: 'Herramientas', descripcion: 'Herramientas de trabajo y mantenimiento' }
    ];

    for (const categoria of categorias) {
      await query(`
        INSERT IGNORE INTO categorias (nombre, descripcion)
        VALUES (?, ?)
      `, [categoria.nombre, categoria.descripcion]);
    }

    console.log('✅ Categorías por defecto creadas');
    return true;
  } catch (error) {
    console.error('❌ Error creando categorías:', error.message);
    return false;
  }
};

// Función para crear ubicaciones por defecto
const createDefaultLocations = async () => {
  try {
    const ubicaciones = [
      { nombre: 'Oficina Principal', descripcion: 'Oficina administrativa principal' },
      { nombre: 'Laboratorio 1', descripcion: 'Laboratorio de computación' },
      { nombre: 'Laboratorio 2', descripcion: 'Laboratorio de electrónica' },
      { nombre: 'Biblioteca', descripcion: 'Biblioteca institucional' },
      { nombre: 'Almacén', descripcion: 'Almacén de bienes' }
    ];

    for (const ubicacion of ubicaciones) {
      await query(`
        INSERT IGNORE INTO ubicaciones (nombre, descripcion)
        VALUES (?, ?)
      `, [ubicacion.nombre, ubicacion.descripcion]);
    }

    console.log('✅ Ubicaciones por defecto creadas');
    return true;
  } catch (error) {
    console.error('❌ Error creando ubicaciones:', error.message);
    return false;
  }
};

// Función principal de inicialización
const initializeDatabase = async () => {
  console.log('🚀 Iniciando configuración de base de datos...');
  
  // Probar conexión
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ No se pudo conectar a la base de datos');
    return false;
  }

  // Crear tablas
  await createTables();
  
  // Crear datos por defecto
  await createDefaultAdmin();
  await createDefaultCategories();
  await createDefaultLocations();

  console.log('✅ Base de datos inicializada correctamente');
  return true;
};

module.exports = {
  initializeDatabase,
  createTables,
  createDefaultAdmin,
  createDefaultCategories,
  createDefaultLocations
};