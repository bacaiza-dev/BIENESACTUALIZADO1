/**
 * Utilidades generales del sistema
 */

const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

/**
 * Generador de IDs únicos
 */
const generateId = (length = 8) => {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generador de códigos de bien únicos
 */
const generateAssetCode = (prefix = 'BIEN') => {
  const timestamp = Date.now().toString().slice(-6)
  const random = crypto.randomBytes(2).toString('hex').toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Generador de códigos QR únicos
 */
const generateQRCode = (bienId, codigo) => {
  const data = {
    id: bienId,
    codigo: codigo,
    timestamp: Date.now(),
    type: 'asset',
  }
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

/**
 * Hasher de contraseñas
 */
const hashPassword = async password => {
  const bcrypt = require('bcrypt')
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verificador de contraseñas
 */
const verifyPassword = async (password, hash) => {
  const bcrypt = require('bcrypt')
  return await bcrypt.compare(password, hash)
}

/**
 * Generador de tokens JWT
 */
const generateJWT = (payload, expiresIn = '24h') => {
  const jwt = require('jsonwebtoken')
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn })
}

/**
 * Verificador de tokens JWT
 */
const verifyJWT = token => {
  const jwt = require('jsonwebtoken')
  return jwt.verify(token, process.env.JWT_SECRET || 'secret')
}

/**
 * Sanitizador de strings
 */
const sanitizeString = str => {
  if (typeof str !== 'string') return str

  return str
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres HTML básicos
    .replace(/[^\w\s\-_.@]/gi, '') // Solo permitir caracteres alfanuméricos y algunos especiales
    .slice(0, 1000) // Limitar longitud
}

/**
 * Validador de email
 */
const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validador de teléfono
 */
const isValidPhone = phone => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s-()]/g, ''))
}

/**
 * Formateador de moneda
 */
const formatCurrency = (amount, currency = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formateador de números
 */
const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

/**
 * Formateador de fechas
 */
const formatDate = (date, format = 'full') => {
  const dateObj = new Date(date)

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('es-CO')
    case 'long':
      return dateObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    case 'datetime':
      return dateObj.toLocaleString('es-CO')
    case 'time':
      return dateObj.toLocaleTimeString('es-CO')
    default:
      return dateObj.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
  }
}

/**
 * Calculador de edad de bien
 */
const calculateAssetAge = fechaAdquisicion => {
  if (!fechaAdquisicion) return null

  const fecha = new Date(fechaAdquisicion)
  const hoy = new Date()
  const diffTime = Math.abs(hoy - fecha)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  const days = diffDays % 30

  return {
    years,
    months,
    days,
    totalDays: diffDays,
    formatted: `${years} años, ${months} meses, ${days} días`,
  }
}

/**
 * Calculador de depreciación
 */
const calculateDepreciation = (valorInicial, valorActual, fechaAdquisicion) => {
  const inicial = parseFloat(valorInicial) || 0
  const actual = parseFloat(valorActual) || 0

  if (inicial === 0) return null

  const depreciacionAbsoluta = inicial - actual
  const depreciacionPorcentaje = (depreciacionAbsoluta / inicial) * 100

  const age = calculateAssetAge(fechaAdquisicion)
  const depreciacionAnual = age && age.years > 0 ? depreciacionPorcentaje / age.years : 0

  return {
    absoluta: depreciacionAbsoluta,
    porcentaje: depreciacionPorcentaje,
    anual: depreciacionAnual,
    formateada: {
      absoluta: formatCurrency(depreciacionAbsoluta),
      porcentaje: `${formatNumber(depreciacionPorcentaje)}%`,
      anual: `${formatNumber(depreciacionAnual)}%`,
    },
  }
}

/**
 * Slugify para URLs amigables
 */
const slugify = text => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Generador de nombres de archivo únicos
 */
const generateFileName = (originalName, prefix = '') => {
  const ext = path.extname(originalName)
  const name = path.basename(originalName, ext)
  const slug = slugify(name)
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex')

  return `${prefix}${prefix ? '-' : ''}${slug}-${timestamp}-${random}${ext}`
}

/**
 * Verificador de existencia de archivo
 */
const fileExists = filePath => {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

/**
 * Creador de directorios
 */
const ensureDir = dirPath => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Obtenedor de tamaño de archivo
 */
const getFileSize = filePath => {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

/**
 * Formateador de tamaño de archivo
 */
const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validador de tipos MIME
 */
const isValidMimeType = (mimeType, allowedTypes) => {
  return allowedTypes.includes(mimeType)
}

/**
 * Extractor de extensión de archivo
 */
const getFileExtension = filename => {
  return path.extname(filename).toLowerCase()
}

/**
 * Generador de colores aleatorios
 */
const generateRandomColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}

/**
 * Debouncer para funciones
 */
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle para funciones
 */
const throttle = (func, limit) => {
  let lastFunc
  let lastRan
  return function () {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(
        function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args)
            lastRan = Date.now()
          }
        },
        limit - (Date.now() - lastRan)
      )
    }
  }
}

/**
 * Limpiador de objeto (remover valores null/undefined)
 */
const cleanObject = obj => {
  const cleaned = Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      cleaned[key] = obj[key]
    }
  })
  return cleaned
}

/**
 * Paginador de arrays
 */
const paginateArray = (array, page = 1, limit = 10) => {
  const offset = (page - 1) * limit
  const paginatedItems = array.slice(offset, offset + limit)
  const totalPages = Math.ceil(array.length / limit)

  return {
    data: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: array.length,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

/**
 * Ordenador de objetos por clave
 */
const sortByKey = (array, key, direction = 'asc') => {
  return array.sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (direction === 'desc') {
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
    }
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
  })
}

/**
 * Agrupador de arrays por clave
 */
const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  })
}

/**
 * Convertidor de string a booleano
 */
const stringToBoolean = str => {
  if (typeof str === 'boolean') return str
  if (typeof str === 'string') {
    return str.toLowerCase() === 'true' || str === '1'
  }
  return Boolean(str)
}

/**
 * Validador de URL
 */
const isValidUrl = string => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Escapar HTML
 */
const escapeHtml = text => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }

  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * Generador de contraseñas aleatorias
 */
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return password
}

/**
 * Validador de fortaleza de contraseña
 */
const validatePasswordStrength = password => {
  const minLength = 8
  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":|<>]/.test(password)

  const score = [
    password.length >= minLength,
    hasLowerCase,
    hasUpperCase,
    hasNumbers,
    hasSpecial,
  ].filter(Boolean).length

  return {
    score,
    isValid: score >= 4,
    suggestions: [
      !hasLowerCase && 'Incluir letras minúsculas',
      !hasUpperCase && 'Incluir letras mayúsculas',
      !hasNumbers && 'Incluir números',
      !hasSpecial && 'Incluir caracteres especiales',
      password.length < minLength && `Mínimo ${minLength} caracteres`,
    ].filter(Boolean),
  }
}

/**
 * Calculador de tiempo transcurrido
 */
const timeAgo = date => {
  const now = new Date()
  const diffTime = Math.abs(now - new Date(date))
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffTime / (1000 * 60))

  if (diffDays > 0) {
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  } else if (diffMinutes > 0) {
    return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
  } else {
    return 'hace un momento'
  }
}

module.exports = {
  generateId,
  generateAssetCode,
  generateQRCode,
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  sanitizeString,
  isValidEmail,
  isValidPhone,
  formatCurrency,
  formatNumber,
  formatDate,
  calculateAssetAge,
  calculateDepreciation,
  slugify,
  generateFileName,
  fileExists,
  ensureDir,
  getFileSize,
  formatFileSize,
  isValidMimeType,
  getFileExtension,
  generateRandomColor,
  debounce,
  throttle,
  cleanObject,
  paginateArray,
  sortByKey,
  groupBy,
  stringToBoolean,
  isValidUrl,
  escapeHtml,
  generateRandomPassword,
  validatePasswordStrength,
  timeAgo,
}
