// src/stores/ubicaciones.js
import { defineStore } from 'pinia'
import apiClient from '@/api/client'

export const useUbicacionesStore = defineStore('ubicaciones', {
  state: () => ({
    ubicaciones: [],
    loading: false,
    error: null,
    currentUbicacion: null,
    filters: {
      search: '',
      activo: null,
      tipo: '',
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  }),

  getters: {
    ubicacionesFiltradas: state => {
      let filtered = [...state.ubicaciones]

      if (state.filters.search) {
        const term = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          ubicacion =>
            ubicacion.nombre?.toLowerCase().includes(term) ||
            ubicacion.descripcion?.toLowerCase().includes(term) ||
            ubicacion.area?.toLowerCase().includes(term) ||
            ubicacion.sede?.toLowerCase().includes(term)
        )
      }

      if (state.filters.activo !== null) {
        filtered = filtered.filter(ubicacion => ubicacion.activo === state.filters.activo)
      }

      if (state.filters.tipo) {
        filtered = filtered.filter(ubicacion => ubicacion.tipo === state.filters.tipo)
      }

      return filtered
    },

    ubicacionesActivas: state => {
      return state.ubicaciones.filter(ubicacion => ubicacion.activo)
    },

    ubicacionesPorSede: state => {
      const grupos = {}
      state.ubicaciones.forEach(ubicacion => {
        const sede = ubicacion.sede || 'Sin sede'
        if (!grupos[sede]) {
          grupos[sede] = []
        }
        grupos[sede].push(ubicacion)
      })
      return grupos
    },

    ubicacionesPorArea: state => {
      const grupos = {}
      state.ubicaciones.forEach(ubicacion => {
        const area = ubicacion.area || 'Sin área'
        if (!grupos[area]) {
          grupos[area] = []
        }
        grupos[area].push(ubicacion)
      })
      return grupos
    },

    totalUbicaciones: state => state.ubicaciones.length,

    ubicacionesParaSelect: state => {
      return state.ubicaciones
        .filter(ubicacion => ubicacion.activo)
        .map(ubicacion => ({
          value: ubicacion.id_ubicacion,
          label: `${ubicacion.nombre} - ${ubicacion.area || 'Sin área'}`,
          sede: ubicacion.sede,
          area: ubicacion.area,
          tipo: ubicacion.tipo,
        }))
    },

    sedesUnicas: state => {
      const sedes = new Set(state.ubicaciones.map(u => u.sede).filter(Boolean))
      return Array.from(sedes).sort()
    },

    areasUnicas: state => {
      const areas = new Set(state.ubicaciones.map(u => u.area).filter(Boolean))
      return Array.from(areas).sort()
    },
  },

  actions: {
    async fetchUbicaciones({ page = 1, limit = 10, ...filters } = {}) {
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

        const response = await apiClient.get(`/ubicaciones?${params}`)

        if (response.success) {
          this.ubicaciones = response.data
          // Assuming meta is directly in the response structure based on typical API patterns
          // Adjust if meta is inside data
          if (response.meta) {
            this.pagination = {
              page: response.meta.page,
              limit: response.meta.limit,
              total: response.meta.total,
              totalPages: response.meta.totalPages,
            }
          }
        } else {
          throw new Error(response.message || 'Error al cargar ubicaciones')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar ubicaciones'
        this.ubicaciones = []
      } finally {
        this.loading = false
      }
    },

    async fetchUbicacionById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.get(`/ubicaciones/${id}`)

        if (response.success) {
          this.currentUbicacion = response.data
          return response.data
        } else {
          throw new Error(response.message || 'Error al cargar ubicación')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar ubicación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUbicacion(ubicacionData) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.post('/ubicaciones', ubicacionData)

        if (response.success) {
          this.ubicaciones.unshift(response.data)
          return response.data
        } else {
          throw new Error(response.message || 'Error al crear ubicación')
        }
      } catch (error) {
        this.error = error.message || 'Error al crear ubicación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUbicacion(id, updates) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.put(`/ubicaciones/${id}`, updates)

        if (response.success) {
          const index = this.ubicaciones.findIndex(ubicacion => ubicacion.id_ubicacion === id)
          if (index !== -1) {
            this.ubicaciones[index] = { ...this.ubicaciones[index], ...response.data }
          }

          if (this.currentUbicacion?.id_ubicacion === id) {
            this.currentUbicacion = { ...this.currentUbicacion, ...response.data }
          }

          return response.data
        } else {
          throw new Error(response.message || 'Error al actualizar ubicación')
        }
      } catch (error) {
        this.error = error.message || 'Error al actualizar ubicación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUbicacion(id) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.delete(`/ubicaciones/${id}`)

        if (response.success) {
          this.ubicaciones = this.ubicaciones.filter(ubicacion => ubicacion.id_ubicacion !== id)

          if (this.currentUbicacion?.id_ubicacion === id) {
            this.currentUbicacion = null
          }

          return true
        } else {
          throw new Error(response.message || 'Error al eliminar ubicación')
        }
      } catch (error) {
        this.error = error.message || 'Error al eliminar ubicación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async toggleActivoUbicacion(id) {
      const ubicacion = this.ubicaciones.find(u => u.id_ubicacion === id)
      if (!ubicacion) return

      return this.updateUbicacion(id, { activo: !ubicacion.activo })
    },

    async fetchBienesByUbicacion(id) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.get(`/ubicaciones/${id}/bienes`)

        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || 'Error al cargar bienes de la ubicación')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar bienes de la ubicación'
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchHistorialUbicacion(id) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.get(`/ubicaciones/${id}/historial`)

        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || 'Error al cargar historial de la ubicación')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar historial de la ubicación'
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
        activo: null,
        tipo: '',
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

    clearCurrentUbicacion() {
      this.currentUbicacion = null
    },

    // Validaciones
    validateUbicacionData(data) {
      const errors = []

      if (!data.nombre?.trim()) {
        errors.push('El nombre de la ubicación es requerido')
      }

      if (data.nombre && data.nombre.length > 255) {
        errors.push('El nombre de la ubicación no puede exceder 255 caracteres')
      }

      if (!data.area?.trim()) {
        errors.push('El área es requerida')
      }

      if (data.area && data.area.length > 100) {
        errors.push('El área no puede exceder 100 caracteres')
      }

      if (data.sede && data.sede.length > 100) {
        errors.push('La sede no puede exceder 100 caracteres')
      }

      if (data.piso && isNaN(parseInt(data.piso))) {
        errors.push('El piso debe ser un número válido')
      }

      if (data.descripcion && data.descripcion.length > 500) {
        errors.push('La descripción no puede exceder 500 caracteres')
      }

      return {
        isValid: errors.length === 0,
        errors,
      }
    },

    // Operaciones en lote
    async toggleMultipleUbicaciones(ids, activo) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.put('/ubicaciones/batch/toggle', {
          ids,
          activo,
        })

        if (response.success) {
          ids.forEach(id => {
            const index = this.ubicaciones.findIndex(ubicacion => ubicacion.id_ubicacion === id)
            if (index !== -1) {
              this.ubicaciones[index].activo = activo
            }
          })
          return response.data
        } else {
          throw new Error(response.message || 'Error al actualizar ubicaciones')
        }
      } catch (error) {
        this.error = error.message || 'Error al actualizar ubicaciones'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteMultipleUbicaciones(ids) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.delete('/ubicaciones/batch', {
          data: { ids },
        })

        if (response.success) {
          this.ubicaciones = this.ubicaciones.filter(
            ubicacion => !ids.includes(ubicacion.id_ubicacion)
          )
          return response.data
        } else {
          throw new Error(response.message || 'Error al eliminar ubicaciones')
        }
      } catch (error) {
        this.error = error.message || 'Error al eliminar ubicaciones'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Utilidades
    async checkUbicacionEnUso(id) {
      try {
        const response = await apiClient.get(`/ubicaciones/${id}/en-uso`)

        if (response.success) {
          return response.data
        }
        return false
      } catch (error) {
        return false
      }
    },

    async generarCodigoQR(id) {
      const response = await apiClient.get(`/ubicaciones/${id}/qr`, {
        responseType: 'blob',
      })

      // Correctly handle blob response using window.URL
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `qr_ubicacion_${id}.png`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return true
    },
  },
})
