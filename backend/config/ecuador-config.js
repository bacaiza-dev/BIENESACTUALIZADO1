// Configuración específica para Ecuador
// Configuraciones del sistema para el contexto ecuatoriano

module.exports = {
  // Configuración de zona horaria
  timezone: {
    name: 'America/Guayaquil',
    offset: '-05:00',
    utcOffset: -5
  },

  // Configuración de localización
  locale: {
    country: 'EC',
    language: 'es-EC',
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    dateTimeFormat: 'DD/MM/YYYY HH:mm:ss'
  },

  // Carreras específicas del instituto
  carreras: [
    {
      id: 1,
      nombre: 'Diseño Gráfico y Multimedia',
      codigo: 'DGM',
      activo: true
    },
    {
      id: 2,
      nombre: 'Administración',
      codigo: 'ADM',
      activo: true
    },
    {
      id: 3,
      nombre: 'Desarrollo de Software',
      codigo: 'DS',
      activo: true
    }
  ],

  // Configuración de validaciones específicas de Ecuador
  validations: {
    cedula: {
      regex: /^[0-9]{10}$/,
      message: 'La cédula debe tener 10 dígitos'
    },
    telefono: {
      regex: /^(\+593|0)?[2-9][0-9]{8}$/,
      message: 'Formato de teléfono ecuatoriano inválido'
    }
  },

  // Configuración institucional
  institucion: {
    nombre: 'Instituto Superior Tecnológico',
    pais: 'Ecuador',
    moneda: 'USD',
    idioma: 'es'
  },

  // Configuración de códigos QR
  qr: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    format: 'png',
    width: 200,
    height: 200,
    errorCorrectionLevel: 'M'
  }
}

// Función para obtener la fecha actual en zona horaria de Ecuador
function getCurrentEcuadorDate() {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'America/Guayaquil'
  })
}

// Función para validar cédula ecuatoriana
function validateCedula(cedula) {
  if (!cedula || typeof cedula !== 'string') return false
  
  // Remover espacios y validar longitud
  const cleanCedula = cedula.replace(/\s/g, '')
  if (!/^[0-9]{10}$/.test(cleanCedula)) return false
  
  // Validar dígito verificador
  const digits = cleanCedula.split('').map(Number)
  const provincia = parseInt(cleanCedula.substring(0, 2))
  
  // Validar provincia (01-24)
  if (provincia < 1 || provincia > 24) return false
  
  // Algoritmo de validación del dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let digit = digits[i]
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  
  const verifier = (10 - (sum % 10)) % 10
  return verifier === digits[9]
}

// Función para validar teléfono ecuatoriano
function validateTelefono(telefono) {
  if (!telefono) return true // Opcional
  
  const cleanPhone = telefono.replace(/\s|-/g, '')
  return /^(\+593|0)?[2-9][0-9]{8}$/.test(cleanPhone)
}

// Exportar funciones utilitarias
module.exports.utils = {
  getCurrentEcuadorDate,
  validateCedula,
  validateTelefono
}