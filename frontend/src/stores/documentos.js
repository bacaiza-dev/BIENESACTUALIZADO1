// src/stores/documentos.js
import { defineStore } from 'pinia'
import apiClient from '@/api/client'

export const useDocumentosStore = defineStore('documentos', {
  state: () => ({
    documentos: [],
    loading: false,
    error: null,
    currentDocumento: null,
    filters: {
      search: '',
      tipoDocumento: '',
      fechaDesde: '',
      fechaHasta: '',
      idBien: null,
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  }),

  getters: {
    documentosFiltrados: state => {
      let filtered = [...state.documentos]

      if (state.filters.search) {
        const term = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          doc =>
            doc.nombre_archivo?.toLowerCase().includes(term) ||
            doc.descripcion?.toLowerCase().includes(term) ||
            doc.bien?.codigo_institucional?.toLowerCase().includes(term) ||
            doc.bien?.nombre?.toLowerCase().includes(term)
        )
      }

      if (state.filters.tipoDocumento) {
        filtered = filtered.filter(doc => doc.tipo_documento === state.filters.tipoDocumento)
      }

      if (state.filters.idBien) {
        filtered = filtered.filter(doc => doc.id_bien === state.filters.idBien)
      }

      if (state.filters.fechaDesde) {
        filtered = filtered.filter(
          doc => new Date(doc.uploaded_at) >= new Date(state.filters.fechaDesde)
        )
      }

      if (state.filters.fechaHasta) {
        filtered = filtered.filter(
          doc => new Date(doc.uploaded_at) <= new Date(state.filters.fechaHasta)
        )
      }

      return filtered
    },

    documentosPorTipo: state => {
      const tipos = {}
      state.documentos.forEach(doc => {
        tipos[doc.tipo_documento] = (tipos[doc.tipo_documento] || 0) + 1
      })
      return tipos
    },

    totalDocumentos: state => state.documentos.length,

    documentosRecientes: state => {
      return [...state.documentos]
        .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
        .slice(0, 5)
    },
  },

  actions: {
    async fetchDocumentos({ page = 1, limit = 10, ...filters } = {}) {
      this.loading = true
      this.error = null

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...Object.fromEntries(
            Object.entries(filters).filter(([key, value]) => value !== '' && value !== null)
          ),
        })

        const response = await apiClient.get(`/documentos?${params}`)

        if (response.success) {
          this.documentos = response.data
          if (response.meta) {
              this.pagination = {
                page: response.meta.page,
                limit: response.meta.limit,
                total: response.meta.total,
                totalPages: response.meta.totalPages,
              }
          }
        } else {
          throw new Error(response.message || 'Error al cargar documentos')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar documentos'
        this.documentos = []
      } finally {
        this.loading = false
      }
    },

    async fetchDocumentoById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.get(`/documentos/${id}`)

        if (response.success) {
          this.currentDocumento = response.data
          return response.data
        } else {
          throw new Error(response.message || 'Error al cargar documento')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar documento'
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadDocumento(documentoData, file) {
      this.loading = true
      this.error = null

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('id_bien', documentoData.id_bien)
        formData.append('tipo_documento', documentoData.tipo_documento)
        formData.append('descripcion', documentoData.descripcion || '')

        const response = await apiClient.post('/documentos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.success) {
          // Agregar el nuevo documento al estado
          this.documentos.unshift(response.data)
          return response.data
        } else {
          throw new Error(response.message || 'Error al subir documento')
        }
      } catch (error) {
        this.error = error.message || 'Error al subir documento'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateDocumento(id, updates) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.put(`/documentos/${id}`, updates)

        if (response.success) {
          // Actualizar el documento en el estado
          const index = this.documentos.findIndex(doc => doc.id_documento === id)
          if (index !== -1) {
            this.documentos[index] = { ...this.documentos[index], ...response.data }
          }

          if (this.currentDocumento?.id_documento === id) {
            this.currentDocumento = { ...this.currentDocumento, ...response.data }
          }

          return response.data
        } else {
          throw new Error(response.message || 'Error al actualizar documento')
        }
      } catch (error) {
        this.error = error.message || 'Error al actualizar documento'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteDocumento(id) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.delete(`/documentos/${id}`)

        if (response.success) {
          // Remover el documento del estado
          this.documentos = this.documentos.filter(doc => doc.id_documento !== id)

          if (this.currentDocumento?.id_documento === id) {
            this.currentDocumento = null
          }

          return true
        } else {
          throw new Error(response.message || 'Error al eliminar documento')
        }
      } catch (error) {
        this.error = error.message || 'Error al eliminar documento'
        throw error
      } finally {
        this.loading = false
      }
    },

    async downloadDocumento(id) {
      this.loading = true
      this.error = null

      try {
        const blob = await apiClient.get(`/documentos/${id}/download`, {
          responseType: 'blob',
        })

        // Crear URL para descarga
        const url = window.URL.createObjectURL(new Blob([blob]))
        const link = document.createElement('a')
        link.href = url

        // Usar nombre genérico si no podemos acceder a headers fácilmente
        const filename = `documento_${id}`

        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return true
      } catch (error) {
        this.error = error.message || 'Error al descargar documento'
        console.error('Error al descargar documento:', error)
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchDocumentosByBien(idBien) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.get(`/bienes/${idBien}/documentos`)

        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || 'Error al cargar documentos del bien')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar documentos del bien'
        console.error('Error al cargar documentos del bien:', error)
        return []
      } finally {
        this.loading = false
      }
    },

    // Filtros
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },

    clearFilters() {
      this.filters = {
        search: '',
        tipoDocumento: '',
        fechaDesde: '',
        fechaHasta: '',
        idBien: null,
      }
    },

    // Paginación
    setPagination({ page, limit }) {
      this.pagination.page = page || this.pagination.page
      this.pagination.limit = limit || this.pagination.limit
    },

    // Estado
    clearError() {
      this.error = null
    },

    clearCurrentDocumento() {
      this.currentDocumento = null
    },

    // Validaciones
    validateDocumentoData(data) {
      const errors = []

      if (!data.id_bien) {
        errors.push('El bien es requerido')
      }

      if (!data.tipo_documento) {
        errors.push('El tipo de documento es requerido')
      }

      const allowedTypes = [
        'factura',
        'garantia',
        'manual',
        'acta_entrega',
        'acta_constatacion',
        'foto',
        'otro',
      ]
      if (data.tipo_documento && !allowedTypes.includes(data.tipo_documento)) {
        errors.push('Tipo de documento no válido')
      }

      return {
        isValid: errors.length === 0,
        errors,
      }
    },

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
  },
})
