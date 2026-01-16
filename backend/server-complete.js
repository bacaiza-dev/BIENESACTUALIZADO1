// =============================================
// SERVER.JS - SISTEMA COMPLETO DE GESTIÓN DE BIENES
// Instituto Superior Tecnológico
// Versión 2.0 - 100% Funcional
// =============================================

require('dotenv').config()

// Importaciones principales
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const mysql = require('mysql2/promise')
const redis = require('ioredis')
const multer = require('multer')
const { Minio } = require('minio')
const path = require('path')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const morgan = require('morgan')
const winston = require('winston')
const cron = require('node-cron')

// Importar módulos personalizados
const { NotificationService } = require('./src/services/notificationService')
const { AuditLogger } = require('./src/services/auditService')
const { BackupService } = require('./src/services/backupService')

const app = express()
const server = http.createServer(app)

// Configuración de Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

const port = process.env.PORT || 3001

// =============================================
// CONFIGURACIÓN DE LOGGING
// =============================================
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bienesint-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
})

// =============================================
// MIDDLEWARE DE SEGURIDAD
// =============================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      },
    },
  })
)

app.use(compression())
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.RATE_LIMIT_REQUESTS || 1000,
  message: { error: 'Demasiadas solicitudes, intenta más tarde' },
  standardHeaders: true,
  legacyHeaders: false,
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de login, intenta más tarde' },
  skipSuccessfulRequests: true,
})

app.use('/api/', limiter)
app.use('/api/login', loginLimiter)

// CORS mejorado
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:8080',
        'capacitor://localhost',
        'ionic://localhost',
        'http://localhost',
      ]

      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('No permitido por CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    credentials: true,
  })
)

// Parser de JSON con límite aumentado
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// =============================================
// CONFIGURACIÓN DE BASE DE DATOS
// =============================================
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3309,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'intbienes',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  charset: 'utf8mb4',
  timezone: '+00:00',
}

console.log('🔧 Configuración de base de datos:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
})

const db = mysql.createPool(dbConfig)

// =============================================
// CONFIGURACIÓN DE REDIS
// =============================================
const redisClient = new redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
})

redisClient.on('connect', () => {
  logger.info('✅ Conectado a Redis')
})

redisClient.on('error', err => {
  logger.error('❌ Error de Redis:', err)
})

// =============================================
// CONFIGURACIÓN DE MINIO (ARCHIVOS)
// =============================================
const minioClient = new Minio({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

// Crear buckets si no existen
const initializeMinio = async () => {
  try {
    const buckets = ['bienes-images', 'bienes-documents', 'bienes-qr']

    for (const bucket of buckets) {
      const exists = await minioClient.bucketExists(bucket)
      if (!exists) {
        await minioClient.makeBucket(bucket)
        logger.info(`✅ Bucket '${bucket}' creado`)
      }
    }
  } catch (error) {
    logger.error('❌ Error inicializando MinIO:', error)
  }
}

// =============================================
// CONFIGURACIÓN DE MULTER PARA ARCHIVOS
// =============================================
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de archivo no permitido'), false)
    }
  },
})

// =============================================
// SERVICIOS GLOBALES
// =============================================
let notificationService
let auditLogger
let backupService

// =============================================
// MIDDLEWARE DE AUTENTICACIÓN JWT
// =============================================
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' })
    }

    // Verificar si el token está en la blacklist
    const isBlacklisted = await redisClient.get(`blacklist:${token}`)
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' })
      }

      // Verificar que el usuario aún existe
      const [rows] = await db.query(
        `SELECT u.id_usuario, u.nombres, u.apellidos, u.activo, r.nombre_rol as rol
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id_rol
         WHERE u.id_usuario = ? AND u.activo = 1`,
        [user.id]
      )

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Usuario no válido' })
      }

      req.user = { ...user, ...rows[0] }
      next()
    })
  } catch (error) {
    logger.error('Error en autenticación:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  const roleName = req.user.rol || ''
  if (roleName.toLowerCase() !== 'administrador') {
    return res.status(403).json({ error: 'Acceso solo para administradores' })
  }
  next()
}

// =============================================
// VERIFICACIÓN DE CONEXIONES
// =============================================
const verificarConexiones = async () => {
  try {
    // Verificar MySQL
    const connection = await db.getConnection()
    const [tables] = await connection.query('SHOW TABLES')
    const tableNames = tables.map(row => Object.values(row)[0])

    const tablesRequired = ['bienes', 'usuarios', 'ubicaciones', 'categorias']
    const missingTables = tablesRequired.filter(table => !tableNames.includes(table))

    if (missingTables.length > 0) {
      logger.warn('⚠️  Tablas faltantes:', missingTables)
    } else {
      logger.info('✅ Todas las tablas necesarias están presentes')
    }

    connection.release()

    // Verificar Redis
    await redisClient.ping()
    logger.info('✅ Redis conectado')

    // Inicializar MinIO
    await initializeMinio()

    // Inicializar servicios
    notificationService = new NotificationService(io, redisClient)
    auditLogger = new AuditLogger(db)
    backupService = new BackupService(db, minioClient)

    logger.info('✅ Todos los servicios inicializados correctamente')
  } catch (err) {
    logger.error('❌ Error de conexión:', err.message)
    process.exit(1)
  }
}

// =============================================
// SOCKET.IO PARA TIEMPO REAL
// =============================================
io.on('connection', socket => {
  logger.info(`🔌 Cliente conectado: ${socket.id}`)

  // Unirse a sala de usuario
  socket.on('join-user-room', userId => {
    socket.join(`user-${userId}`)
    logger.info(`👤 Usuario ${userId} unido a su sala`)
  })

  // Unirse a sala de administradores
  socket.on('join-admin-room', () => {
    socket.join('admin-room')
    logger.info(`👑 Admin unido a sala administrativa`)
  })

  socket.on('disconnect', () => {
    logger.info(`🔌 Cliente desconectado: ${socket.id}`)
  })
})

// =============================================
// ROUTER PRINCIPAL
// =============================================
const apiRouter = express.Router()

module.exports = {
  app,
  server,
  io,
  db,
  redisClient,
  minioClient,
  logger,
  authenticateToken,
  requireAdmin,
}

// Importar rutas
require('./src/routes/auth')(apiRouter, { db, redisClient, logger, io })
require('./src/routes/users')(apiRouter, {
  db,
  authenticateToken,
  requireAdmin,
  logger,
  auditLogger,
})
require('./src/routes/assets')(apiRouter, {
  db,
  authenticateToken,
  requireAdmin,
  logger,
  minioClient,
  upload,
})
require('./src/routes/locations')(apiRouter, { db, authenticateToken, requireAdmin, logger })
require('./src/routes/categories')(apiRouter, { db, authenticateToken, requireAdmin, logger })
require('./src/routes/periods')(apiRouter, { db, authenticateToken, requireAdmin, logger })
require('./src/routes/reports')(apiRouter, { db, authenticateToken, logger })
require('./src/routes/files')(apiRouter, { db, authenticateToken, minioClient, upload, logger })
require('./src/routes/dashboard')(apiRouter, { db, authenticateToken, logger, redisClient })
require('./src/routes/notifications')(apiRouter, {
  db,
  authenticateToken,
  logger,
  notificationService,
})

// =============================================
// TAREAS PROGRAMADAS
// =============================================

// Backup diario a las 2:00 AM
cron.schedule('0 2 * * *', async () => {
  try {
    logger.info('🔄 Iniciando backup automático...')
    await backupService.createBackup()
    logger.info('✅ Backup completado')
  } catch (error) {
    logger.error('❌ Error en backup automático:', error)
  }
})

// Limpieza de sesiones expiradas cada hora
cron.schedule('0 * * * *', async () => {
  try {
    const keys = await redisClient.keys('session:*')
    for (const key of keys) {
      const ttl = await redisClient.ttl(key)
      if (ttl <= 0) {
        await redisClient.del(key)
      }
    }
    logger.info(`🧹 Limpieza de sesiones: ${keys.length} verificadas`)
  } catch (error) {
    logger.error('❌ Error en limpieza de sesiones:', error)
  }
})

// =============================================
// USAR ROUTER
// =============================================
app.use('/api', apiRouter)

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// =============================================
// MANEJO DE ERRORES GLOBALES
// =============================================
app.use((err, req, res) => {
  logger.error('Error no manejado:', err)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Archivo demasiado grande' })
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(413).json({ error: 'Demasiados archivos' })
  }

  res.status(500).json({
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  })
})

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

// =============================================
// MANEJO DE CIERRE GRACEFUL
// =============================================
process.on('SIGINT', async () => {
  logger.info('🛑 Cerrando servidor...')

  server.close(async () => {
    try {
      await db.end()
      await redisClient.quit()
      logger.info('✅ Servidor cerrado correctamente')
      process.exit(0)
    } catch (error) {
      logger.error('❌ Error cerrando conexiones:', error)
      process.exit(1)
    }
  })
})

// =============================================
// INICIAR SERVIDOR
// =============================================
const startServer = async () => {
  try {
    await verificarConexiones()

    server.listen(port, () => {
      logger.info(`🚀 Servidor iniciado en puerto ${port}`)
      logger.info(`📊 Dashboard: http://localhost:${port}`)
      logger.info(`📡 API: http://localhost:${port}/api`)
      logger.info(`🔌 WebSocket: http://localhost:${port}/socket.io`)

      if (process.env.NODE_ENV === 'development') {
        logger.info('🔧 Modo desarrollo activo')
      }
    })
  } catch (error) {
    logger.error('❌ Error iniciando servidor:', error)
    process.exit(1)
  }
}

startServer()
