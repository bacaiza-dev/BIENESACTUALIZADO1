// src/services/documentosService.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

// Configurar interceptores de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos para uploads
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

export const documentosService = {
  // Obtener lista de documentos
  async getDocumentos(params = {}) {
    try {
      const response = await api.get('/documentos', { params })
      return {
        success: true,
        data: response.data.data || [],
        meta: response.data.meta || {},
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar documentos',
        error,
      }
    }
  },

  // Obtener documento por ID
  async getDocumentoById(id) {
    try {
      const response = await api.get(`/documentos/${id}`)
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar documento',
        error,
      }
    }
  },

  // Subir nuevo documento
  async uploadDocumento(documentoData, file, onProgress = null) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('id_bien', documentoData.id_bien)
      formData.append('tipo_documento', documentoData.tipo_documento)
      formData.append('descripcion', documentoData.descripcion || '')

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      // Agregar callback de progreso si se proporciona
      if (onProgress) {
        config.onUploadProgress = progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      }

      const response = await api.post('/documentos', formData, config)

      return {
        success: true,
        data: response.data.data,
        message: 'Documento subido exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al subir documento',
        error,
      }
    }
  },

  // Actualizar documento
  async updateDocumento(id, updates) {
    try {
      const response = await api.put(`/documentos/${id}`, updates)
      return {
        success: true,
        data: response.data.data,
        message: 'Documento actualizado exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al actualizar documento',
        error,
      }
    }
  },

  // Eliminar documento
  async deleteDocumento(id) {
    try {
      await api.delete(`/documentos/${id}`)
      return {
        success: true,
        message: 'Documento eliminado exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar documento',
        error,
      }
    }
  },

  // Descargar documento
  async downloadDocumento(id) {
    try {
      const response = await api.get(`/documentos/${id}/download`, {
        responseType: 'blob',
      })

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      // Obtener nombre del archivo desde headers
      const contentDisposition = response.headers['content-disposition']
      let filename = 'documento'
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
        message: 'Documento descargado exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al descargar documento',
        error,
      }
    }
  },

  // Obtener vista previa del documento
  async getDocumentoPreview(id) {
    try {
      const response = await api.get(`/documentos/${id}/preview`)
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener vista previa',
        error,
      }
    }
  },

  // Obtener documentos por bien
  async getDocumentosByBien(idBien) {
    try {
      const response = await api.get(`/bienes/${idBien}/documentos`)
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar documentos del bien',
        error,
      }
    }
  },

  // Obtener tipos de documento disponibles
  async getTiposDocumento() {
    try {
      const response = await api.get('/documentos/tipos')
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar tipos de documento',
        error,
      }
    }
  },

  // Validar archivo antes de subir
  validateFile(file) {
    const errors = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
    ]

    if (!file) {
      errors.push('El archivo es requerido')
      return { isValid: false, errors }
    }

    if (file.size > maxSize) {
      errors.push('El archivo no puede ser mayor a 10MB')
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('Tipo de archivo no permitido. Solo se permiten: PDF, Word, Excel, Imágenes')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  // Formatear tamaño de archivo
  formatFileSize(bytes) {
    if (!bytes) return '0 Bytes'
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Obtener icono según tipo de archivo
  getFileIcon(filename) {
    const extension = filename.split('.').pop()?.toLowerCase()

    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
    }

    return iconMap[extension] || '📎'
  },

  // Buscar documentos
  async searchDocumentos(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters,
      }

      const response = await api.get('/documentos/search', { params })
      return {
        success: true,
        data: response.data.data || [],
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al buscar documentos',
        error,
      }
    }
  },

  // Obtener estadísticas de documentos
  async getEstadisticasDocumentos() {
    try {
      const response = await api.get('/documentos/estadisticas')
      return {
        success: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al cargar estadísticas',
        error,
      }
    }
  },

  // Operaciones en lote
  async deleteMultipleDocumentos(ids) {
    try {
      const response = await api.delete('/documentos/batch', {
        data: { ids },
      })
      return {
        success: true,
        data: response.data.data,
        message: 'Documentos eliminados exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al eliminar documentos',
        error,
      }
    }
  },

  // Exportar lista de documentos
  async exportDocumentos(formato = 'excel', filters = {}) {
    try {
      const response = await api.get('/documentos/export', {
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
      const filename = `documentos_export_${new Date().toISOString().split('T')[0]}.${extension}`

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return {
        success: true,
        message: 'Documentos exportados exitosamente',
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al exportar documentos',
        error,
      }
    }
  },
}

export default documentosService
