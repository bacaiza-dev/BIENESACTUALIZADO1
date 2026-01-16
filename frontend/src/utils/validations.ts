// Frontend validation utilities
import type { User, Asset } from '@/types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface FormError {
  field: string
  message: string
}

// Common validation rules
export const ValidationRules = {
  required: (value: any, fieldName: string): FormError | null => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return { field: fieldName, message: `${fieldName} es requerido` }
    }
    return null
  },

  email: (value: string, fieldName: string = 'email'): FormError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (value && !emailRegex.test(value)) {
      return { field: fieldName, message: 'Formato de email inválido' }
    }
    return null
  },

  institutionalEmail: (value: string, fieldName: string = 'email'): FormError | null => {
    const institutionalEmailRegex = /^[^\s@]+@intsuperior\.edu\.ec$/
    if (value && !institutionalEmailRegex.test(value)) {
      return { field: fieldName, message: 'Solo se permiten emails institucionales (@intsuperior.edu.ec)' }
    }
    return null
  },

  minLength: (value: string, min: number, fieldName: string): FormError | null => {
    if (value && value.length < min) {
      return { field: fieldName, message: `${fieldName} debe tener al menos ${min} caracteres` }
    }
    return null
  },

  maxLength: (value: string, max: number, fieldName: string): FormError | null => {
    if (value && value.length > max) {
      return { field: fieldName, message: `${fieldName} no puede exceder ${max} caracteres` }
    }
    return null
  },

  number: (value: any, fieldName: string): FormError | null => {
    if (value !== null && value !== undefined && isNaN(Number(value))) {
      return { field: fieldName, message: `${fieldName} debe ser un número válido` }
    }
    return null
  },

  positiveNumber: (value: number, fieldName: string): FormError | null => {
    if (value !== null && value !== undefined && value < 0) {
      return { field: fieldName, message: `${fieldName} debe ser un número positivo` }
    }
    return null
  },

  phone: (value: string, fieldName: string = 'teléfono'): FormError | null => {
    const phoneRegex = /^[+]?[1-9][\d\s-()]{7,20}$/
    if (value && !phoneRegex.test(value)) {
      return { field: fieldName, message: 'Formato de teléfono inválido' }
    }
    return null
  },

  password: (value: string, fieldName: string = 'contraseña'): FormError | null => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (value && value.length < 8) {
      return { field: fieldName, message: 'La contraseña debe tener al menos 8 caracteres' }
    }
    if (value && !passwordRegex.test(value)) {
      return { 
        field: fieldName, 
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial' 
      }
    }
    return null
  },

  cedula: (value: string, fieldName: string = 'cédula'): FormError | null => {
    if (value && (value.length < 7 || value.length > 10)) {
      return { field: fieldName, message: 'La cédula debe tener entre 7 y 10 caracteres' }
    }
    return null
  },

  url: (value: string, fieldName: string = 'URL'): FormError | null => {
    try {
      if (value) new URL(value)
      return null
    } catch {
      return { field: fieldName, message: 'Formato de URL inválido' }
    }
  },

  dateRange: (startDate: string, endDate: string): FormError | null => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (end <= start) {
        return { field: 'fechas', message: 'La fecha de fin debe ser posterior a la fecha de inicio' }
      }
    }
    return null
  },
}

// Form validators
export const validateUser = (user: Partial<User>): ValidationResult => {
  const errors: FormError[] = []

  // Required fields
  if (!user.nombre?.trim()) {
    errors.push({ field: 'nombre', message: 'El nombre es requerido' })
  }
  if (!user.apellido?.trim()) {
    errors.push({ field: 'apellido', message: 'El apellido es requerido' })
  }
  if (!user.email?.trim()) {
    errors.push({ field: 'email', message: 'El email es requerido' })
  }

  // Field validations
  const nameError = ValidationRules.minLength(user.nombre || '', 2, 'nombre')
  if (nameError) errors.push(nameError)

  const surnameError = ValidationRules.minLength(user.apellido || '', 2, 'apellido')
  if (surnameError) errors.push(surnameError)

  const emailError = ValidationRules.institutionalEmail(user.email || '')
  if (emailError) errors.push(emailError)

  if (user.telefono) {
    const phoneError = ValidationRules.phone(user.telefono)
    if (phoneError) errors.push(phoneError)
  }

  return {
    isValid: errors.length === 0,
    errors: errors.map(e => e.message),
  }
}

export const validateLogin = (credentials: { email?: string; cedula?: string; password: string }): ValidationResult => {
  const errors: FormError[] = []

  // Must have either email or cedula
  if (!credentials.email && !credentials.cedula) {
    errors.push({ field: 'credential', message: 'Email o cédula es requerido' })
  }

  // Password is required
  if (!credentials.password) {
    errors.push({ field: 'password', message: 'La contraseña es requerida' })
  }

  // Validate email if provided - debe ser email institucional
  if (credentials.email) {
    const emailError = ValidationRules.institutionalEmail(credentials.email)
    if (emailError) errors.push(emailError)
  }

  // Validate cedula if provided
  if (credentials.cedula) {
    const cedulaError = ValidationRules.cedula(credentials.cedula)
    if (cedulaError) errors.push(cedulaError)
  }

  return {
    isValid: errors.length === 0,
    errors: errors.map(e => e.message),
  }
}

export const validatePassword = (password: string, confirmPassword?: string): ValidationResult => {
  const errors: FormError[] = []

  const passwordError = ValidationRules.password(password)
  if (passwordError) errors.push(passwordError)

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Las contraseñas no coinciden' })
  }

  return {
    isValid: errors.length === 0,
    errors: errors.map(e => e.message),
  }
}

export const validateBien = (bien: Partial<Asset>): ValidationResult => {
  const errors: FormError[] = []

  // Required fields
  if (!bien.nombre?.trim()) {
    errors.push({ field: 'nombre', message: 'El nombre del bien es requerido' })
  }
  if (!bien.categoria_id) {
    errors.push({ field: 'categoria_id', message: 'La categoría es requerida' })
  }
  if (!bien.ubicacion_id) {
    errors.push({ field: 'ubicacion_id', message: 'La ubicación es requerida' })
  }
  if (bien.valor_adquisicion === null || bien.valor_adquisicion === undefined) {
    errors.push({ field: 'valor_adquisicion', message: 'El valor de adquisición es requerido' })
  }
  if (!bien.fecha_adquisicion) {
    errors.push({ field: 'fecha_adquisicion', message: 'La fecha de adquisición es requerida' })
  }

  // Field validations
  if (bien.nombre) {
    const nameError = ValidationRules.minLength(bien.nombre, 2, 'nombre')
    if (nameError) errors.push(nameError)
    
    const maxNameError = ValidationRules.maxLength(bien.nombre, 255, 'nombre')
    if (maxNameError) errors.push(maxNameError)
  }

  if (bien.codigo) {
    const codeError = ValidationRules.maxLength(bien.codigo, 50, 'código')
    if (codeError) errors.push(codeError)
  }

  if (bien.descripcion) {
    const descError = ValidationRules.maxLength(bien.descripcion, 1000, 'descripción')
    if (descError) errors.push(descError)
  }

  if (bien.valor_adquisicion !== undefined && bien.valor_adquisicion !== null) {
    const valueError = ValidationRules.positiveNumber(bien.valor_adquisicion, 'valor de adquisición')
    if (valueError) errors.push(valueError)
  }

  if (bien.vida_util !== undefined && bien.vida_util !== null) {
    if (bien.vida_util < 1 || bien.vida_util > 50) {
      errors.push({ field: 'vida_util', message: 'La vida útil debe estar entre 1 y 50 años' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.map(e => e.message),
  }
}

export const validateCategoria = (categoria: { nombre_categoria: string; descripcion?: string }): ValidationResult => {
  const errors: FormError[] = []

  if (!categoria.nombre_categoria?.trim()) {
    errors.push({ field: 'nombre_categoria', message: 'El nombre de la categoría es requerido' })
  }

  if (categoria.nombre_categoria) {
    const nameError = ValidationRules.maxLength(categoria.nombre_categoria, 100, 'nombre de categoría')
    if (nameError) errors.push(nameError)
  }

  if (categoria.descripcion) {
    const descError = ValidationRules.maxLength(categoria.descripcion, 500, 'descripción')
    if (descError) errors.push(descError)
  }

  return {
    isValid: errors.length === 0,
    errors: errors.map(e => e.message),
  }
}

export const validateUbicacion = (ubicacion: { 
  nombre: string; 
  descripcion?: string; 
  tipo: string;
  capacidad_maxima?: number;
  area_m2?: number;
}): ValidationResult => {
  const errors: FormError[] = []

  if (!ubicacion.nombre?.trim()) {
    errors.push({ field: 'nombre', message: 'El nombre de la ubicación es requerido' })
  }

  if (!ubicacion.tipo) {
    errors.push({ field: 'tipo', message: 'El tipo de ubicación es requerido' })
  }

  if (ubicacion.nombre) {
    const nameError = ValidationRules.maxLength(ubicacion.nombre, 255, 'nombre')
    if (nameError) errors.push(nameError)
  }

  if (ubicacion.descripcion) {
    const descError = ValidationRules.maxLength(ubicacion.descripcion, 500, 'descripción')
    if (descError) errors.push(descError)
  }

  if (ubicacion.capacidad_maxima !== undefined && ubicacion.capacidad_maxima !== null) {
    const capacityError = ValidationRules.positiveNumber(ubicacion.capacidad_maxima, 'capacidad máxima')
    if (capacityError) errors.push(capacityError)
  }

  if (ubicacion.area_m2 !== undefined && ubicacion.area_m2 !== null) {
    const areaError = ValidationRules.positiveNumber(ubicacion.area_m2, 'área en m²')
    if (areaError) errors.push(areaError)
  }

  const validTypes = ['edificio', 'piso', 'salon', 'oficina', 'laboratorio', 'bodega', 'exterior']
  if (ubicacion.tipo && !validTypes.includes(ubicacion.tipo)) {
    errors.push({ field: 'tipo', message: 'Tipo de ubicación no válido' })
  }

  return {
    isValid: errors.length === 0,
    errors: errors.map(e => e.message),
  }
}

// File validation
export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
} = {}): ValidationResult => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    required = false,
  } = options

  const errors: string[] = []

  if (required && !file) {
    errors.push('El archivo es requerido')
    return { isValid: false, errors }
  }

  if (!file) {
    return { isValid: true, errors: [] }
  }

  if (file.size > maxSize) {
    errors.push(`El archivo excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB`)
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Batch validation for multiple files
export const validateFiles = (files: File[], options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
  required?: boolean;
} = {}): ValidationResult => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles = 5,
    required = false,
  } = options

  const errors: string[] = []

  if (required && (!files || files.length === 0)) {
    errors.push('Al menos un archivo es requerido')
    return { isValid: false, errors }
  }

  if (!files || files.length === 0) {
    return { isValid: true, errors: [] }
  }

  if (files.length > maxFiles) {
    errors.push(`Máximo ${maxFiles} archivos permitidos`)
    return { isValid: false, errors }
  }

  for (const file of files) {
    const fileValidation = validateFile(file, { maxSize, allowedTypes })
    if (!fileValidation.isValid) {
      errors.push(...fileValidation.errors.map(error => `${file.name}: ${error}`))
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Sanitization helpers
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

export const sanitizeNumber = (input: string | number): number | null => {
  const num = typeof input === 'string' ? parseFloat(input) : input
  return isNaN(num) ? null : num
}

export const sanitizeBoolean = (input: any): boolean => {
  if (typeof input === 'boolean') return input
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1'
  }
  return Boolean(input)
}

// Date helpers
export const validateDateRange = (startDate: string, endDate: string): ValidationResult => {
  const errors: string[] = []

  if (!startDate) {
    errors.push('La fecha de inicio es requerida')
  }

  if (!endDate) {
    errors.push('La fecha de fin es requerida')
  }

  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime())) {
      errors.push('Fecha de inicio inválida')
    }
    
    if (isNaN(end.getTime())) {
      errors.push('Fecha de fin inválida')
    }
    
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
      errors.push('La fecha de fin debe ser posterior a la fecha de inicio')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Export commonly used regex patterns
export const RegexPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[1-9][\d\s-()]{7,20}$/,
  cedula: /^\d{7,10}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/,
}
