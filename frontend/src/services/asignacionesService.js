// src/services/asignacionesService.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

// Configurar interceptores de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar respuestas
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const asignacionesService = {
  // Obtener lista de asignaciones
  async getAsignaciones(params = {}) {
    try {
      const response = await api.get('/asignaciones', { params })
      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta || {},
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar asignaciones',
        error,
      }
    }
  },

  // Obtener asignación por ID
  async getAsignacionById(id) {
    try {
      const response = await api.get(`/asignaciones/${id}`)
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar asignación',
        error,
      }
    }
  },

  // Crear nueva asignación
  async createAsignacion(asignacionData) {
    try {
      const response = await api.post('/asignaciones', asignacionData)
      return {
        success: true,
        data: response.data.data,
        message: 'Asignación creada exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al crear asignación',
        error,
      }
    }
  },

  // Actualizar asignación
  async updateAsignacion(id, updates) {
    try {
      const response = await api.put(`/asignaciones/${id}`, updates)
      return {
        success: true,
        data: response.data.data,
        message: 'Asignación actualizada exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar asignación',
        error,
      }
    }
  },

  // Finalizar asignación (devolución)
  async finalizarAsignacion(id, datosFinalizacion) {
    try {
      const response = await api.put(`/asignaciones/${id}/finalizar`, datosFinalizacion)
      return {
        success: true,
        data: response.data.data,
        message: 'Asignación finalizada exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al finalizar asignación',
        error,
      }
    }
  },

  // Transferir asignación a otro usuario
  async transferirAsignacion(id, datosTransferencia) {
    try {
      const response = await api.put(`/asignaciones/${id}/transferir`, datosTransferencia)
      return {
        success: true,
        data: response.data.data,
        message: 'Asignación transferida exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al transferir asignación',
        error,
      }
    }
  },

  // Marcar como perdido
  async marcarComoPerdido(id, observaciones) {
    try {
      const response = await api.put(`/asignaciones/${id}/perdido`, { observaciones })
      return {
        success: true,
        data: response.data.data,
        message: 'Bien marcado como perdido',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al marcar como perdido',
        error,
      }
    }
  },

  // Obtener asignaciones por usuario
  async getAsignacionesByUsuario(idUsuario, incluirHistorial = false) {
    try {
      const params = incluirHistorial ? { historial: 'true' } : {}
      const response = await api.get(`/usuarios/${idUsuario}/asignaciones`, { params })
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar asignaciones del usuario',
        error,
      }
    }
  },

  // Obtener historial de un bien
  async getHistorialBien(idBien) {
    try {
      const response = await api.get(`/bienes/${idBien}/historial-asignaciones`)
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar historial del bien',
        error,
      }
    }
  },

  // Obtener asignaciones activas
  async getAsignacionesActivas() {
    try {
      const response = await api.get('/asignaciones/activas')
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar asignaciones activas',
        error,
      }
    }
  },

  // Obtener asignaciones pendientes de devolución
  async getAsignacionesPendientes() {
    try {
      const response = await api.get('/asignaciones/pendientes')
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar asignaciones pendientes',
        error,
      }
    }
  },

  // Generar acta de asignación
  async generarActaAsignacion(id, tipoActa = 'asignacion') {
    try {
      const response = await api.get(`/asignaciones/${id}/acta/${tipoActa}`, {
        responseType: 'blob',
      })

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      // Obtener nombre del archivo desde headers o generar uno
      const contentDisposition = response.headers['content-disposition']
      let filename = `acta_${tipoActa}_asignacion_${id}.pdf`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return {
        success: true,
        message: 'Acta generada exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al generar acta',
        error,
      }
    }
  },

  // Obtener métricas y estadísticas
  async getMetricas() {
    try {
      const response = await api.get('/asignaciones/metricas')
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar métricas',
        error,
      }
    }
  },

  // Buscar asignaciones
  async searchAsignaciones(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters,
      }

      const response = await api.get('/asignaciones/search', { params })
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al buscar asignaciones',
        error,
      }
    }
  },

  // Validar bien disponible para asignación
  async validarBienDisponible(idBien) {
    try {
      const response = await api.get(`/bienes/${idBien}/disponible`)
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al validar disponibilidad del bien',
        error,
      }
    }
  },

  // Obtener bienes disponibles para asignación
  async getBienesDisponibles() {
    try {
      const response = await api.get('/bienes/disponibles')
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar bienes disponibles',
        error,
      }
    }
  },

  // Exportar asignaciones
  async exportAsignaciones(formato = 'excel', filters = {}) {
    try {
      const response = await api.get('/asignaciones/export', {
        params: {
          formato,
          ...filters,
        },
        responseType: 'blob',
      })

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      const extension = formato === 'excel' ? 'xlsx' : 'csv'
      const filename = `asignaciones_export_${new Date().toISOString().split('T')[0]}.${extension}`

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return {
        success: true,
        message: 'Asignaciones exportadas exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al exportar asignaciones',
        error,
      }
    }
  },

  // Operaciones en lote
  async finalizarMultiplesAsignaciones(ids, datosFinalizacion) {
    try {
      const response = await api.put('/asignaciones/batch/finalizar', {
        ids,
        ...datosFinalizacion,
      })
      return {
        success: true,
        data: response.data.data,
        message: 'Asignaciones finalizadas exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al finalizar asignaciones',
        error,
      }
    }
  },

  // Enviar recordatorio de devolución
  async enviarRecordatorio(id, mensaje = '') {
    try {
      const response = await api.post(`/asignaciones/${id}/recordatorio`, { mensaje })
      return {
        success: true,
        data: response.data.data,
        message: 'Recordatorio enviado exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al enviar recordatorio',
        error,
      }
    }
  },

  // Obtener alertas de asignaciones
  async getAlertasAsignaciones() {
    try {
      const response = await api.get('/asignaciones/alertas')
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar alertas',
        error,
      }
    }
  },

  // Validaciones del lado del cliente
  validateAsignacionData(data) {
    const errors = []

    if (!data.id_bien) {
      errors.push('El bien es requerido')
    }

    if (!data.id_usuario) {
      errors.push('El usuario es requerido')
    }

    if (!data.fecha_asignacion) {
      errors.push('La fecha de asignación es requerida')
    }

    if (data.fecha_asignacion && new Date(data.fecha_asignacion) > new Date()) {
      errors.push('La fecha de asignación no puede ser futura')
    }

    if (data.fecha_limite_devolucion && data.fecha_asignacion) {
      if (new Date(data.fecha_limite_devolucion) <= new Date(data.fecha_asignacion)) {
        errors.push('La fecha límite de devolución debe ser posterior a la fecha de asignación')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  validateFinalizacionData(data) {
    const errors = []

    if (!data.fecha_devolucion) {
      errors.push('La fecha de devolución es requerida')
    }

    if (!data.estado_final) {
      errors.push('El estado final es requerido')
    }

    const allowedStates = ['devuelta', 'transferida', 'perdida', 'danada']
    if (data.estado_final && !allowedStates.includes(data.estado_final)) {
      errors.push('Estado final no válido')
    }

    if (data.fecha_devolucion && new Date(data.fecha_devolucion) > new Date()) {
      errors.push('La fecha de devolución no puede ser futura')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  // Utilidades
  formatEstado(estado) {
    const estados = {
      activa: 'Activa',
      devuelta: 'Devuelta',
      transferida: 'Transferida',
      perdida: 'Perdida',
      danada: 'Dañada',
    }
    return estados[estado] || estado
  },

  getEstadoBadgeClass(estado) {
    const classes = {
      activa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      devuelta: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      transferida: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      perdida: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      danada: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    }
    return classes[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  },

  calculateDaysOverdue(fechaLimite) {
    if (!fechaLimite) return 0

    const limite = new Date(fechaLimite)
    const hoy = new Date()
    const diffTime = hoy - limite
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  },
}

export default asignacionesService
