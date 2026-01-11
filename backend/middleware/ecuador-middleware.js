// Middleware específico para Ecuador
const ecuadorConfig = require('../config/ecuador-config')

// Middleware para configurar zona horaria
const timezoneMiddleware = (req, res, next) => {
  // Agregar configuración de timezone a la request
  req.timezone = ecuadorConfig.timezone
  req.locale = ecuadorConfig.locale
  
  // Configurar headers para zona horaria
  res.setHeader('X-Timezone', ecuadorConfig.timezone.name)
  res.setHeader('X-Locale', ecuadorConfig.locale.language)
  
  next()
}

// Middleware para validar datos ecuatorianos
const validateEcuadorData = (req, res, next) => {
  const { cedula, telefono } = req.body
  
  // Validar cédula si está presente
  if (cedula && !ecuadorConfig.utils.validateCedula(cedula)) {
    return res.status(400).json({
      success: false,
      message: 'Cédula ecuatoriana inválida',
      field: 'cedula'
    })
  }
  
  // Validar teléfono si está presente
  if (telefono && !ecuadorConfig.utils.validateTelefono(telefono)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de teléfono ecuatoriano inválido',
      field: 'telefono'
    })
  }
  
  next()
}

// Middleware para formatear fechas en zona horaria de Ecuador
const formatEcuadorDates = (req, res, next) => {
  const originalJson = res.json
  
  res.json = function(data) {
    if (data && typeof data === 'object') {
      // Formatear fechas en la respuesta
      data = formatDatesInObject(data)
    }
    
    return originalJson.call(this, data)
  }
  
  next()
}

// Función auxiliar para formatear fechas en objetos
function formatDatesInObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(formatDatesInObject)
  }
  
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const formatted = {}
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && isDateString(value)) {
        // Formatear fecha a zona horaria de Ecuador
        formatted[key] = new Date(value).toLocaleString('es-EC', {
          timeZone: 'America/Guayaquil'
        })
      } else if (value instanceof Date) {
        formatted[key] = value.toLocaleString('es-EC', {
          timeZone: 'America/Guayaquil'
        })
      } else if (typeof value === 'object') {
        formatted[key] = formatDatesInObject(value)
      } else {
        formatted[key] = value
      }
    }
    return formatted
  }
  
  return obj
}

// Función auxiliar para detectar strings de fecha
function isDateString(str) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
  return dateRegex.test(str) && !isNaN(Date.parse(str))
}

// Middleware para agregar metadatos de Ecuador
const addEcuadorMetadata = (req, res, next) => {
  const originalJson = res.json
  
  res.json = function(data) {
    // Agregar metadatos de Ecuador a las respuestas exitosas
    if (data && data.success !== false) {
      data._metadata = {
        timezone: ecuadorConfig.timezone.name,
        locale: ecuadorConfig.locale.language,
        currency: ecuadorConfig.locale.currency,
        timestamp: ecuadorConfig.utils.getCurrentEcuadorDate(),
        country: 'Ecuador'
      }
    }
    
    return originalJson.call(this, data)
  }
  
  next()
}

module.exports = {
  timezoneMiddleware,
  validateEcuadorData,
  formatEcuadorDates,
  addEcuadorMetadata
}