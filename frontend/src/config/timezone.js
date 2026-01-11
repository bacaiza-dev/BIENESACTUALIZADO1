// Configuración de zona horaria para Ecuador
// Ecuador usa UTC-5 (ECT - Ecuador Time)

export const TIMEZONE_CONFIG = {
  // Zona horaria de Ecuador
  timezone: 'America/Guayaquil',
  offset: -5, // UTC-5
  name: 'ECT', // Ecuador Time
  
  // Configuración para mostrar fechas
  dateFormat: {
    locale: 'es-EC',
    options: {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  },
  
  // Configuración para mostrar fechas con hora
  dateTimeFormat: {
    locale: 'es-EC',
    options: {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }
  }
}

// Función utilitaria para formatear fechas en zona horaria de Ecuador
export const formatEcuadorDate = (date, includeTime = false) => {
  if (!date) return 'No definida'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (includeTime) {
    return dateObj.toLocaleString(
      TIMEZONE_CONFIG.dateTimeFormat.locale,
      TIMEZONE_CONFIG.dateTimeFormat.options
    )
  } else {
    return dateObj.toLocaleDateString(
      TIMEZONE_CONFIG.dateFormat.locale,
      TIMEZONE_CONFIG.dateFormat.options
    )
  }
}

// Función para obtener la fecha actual en zona horaria de Ecuador
export const getCurrentEcuadorDate = () => {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'America/Guayaquil'
  }).split(' ')[0] // Retorna formato YYYY-MM-DD
}

// Función para obtener la fecha y hora actual en zona horaria de Ecuador
export const getCurrentEcuadorDateTime = () => {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'America/Guayaquil'
  }) // Retorna formato YYYY-MM-DD HH:mm:ss
}