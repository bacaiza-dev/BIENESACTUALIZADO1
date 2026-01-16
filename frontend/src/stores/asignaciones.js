// src/stores/asignaciones.js
import { defineStore } from 'pinia'
import apiClient from '@/api/client'

export const useAsignacionesStore = defineStore('asignaciones', {
  state: () => ({
    asignaciones: [],
    loading: false,
    error: null,
    currentAsignacion: null,
    filters: {
      searchUsuario: '',
      searchBien: '',
      estado: '',
      fechaDesde: '',
      fechaHasta: '',
      idUsuario: null,
      idBien: null,
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    metricas: {
      asignacionesActivas: 0,
      usuariosConBienes: 0,
      pendientesDevolucion: 0,
      totalAsignaciones: 0,
      bienesEnUso: 0,
      valorTotalAsignado: 0,
    },
  }),

  getters: {
    asignacionesFiltradas: state => {
      let filtered = [...state.asignaciones]

      if (state.filters.searchUsuario) {
        const term = state.filters.searchUsuario.toLowerCase()
        filtered = filtered.filter(
          asignacion =>
            asignacion.usuario?.nombres?.toLowerCase().includes(term) ||
            asignacion.usuario?.apellidos?.toLowerCase().includes(term) ||
            asignacion.usuario?.cedula?.includes(term) ||
            asignacion.usuario?.email?.toLowerCase().includes(term)
        )
      }

      if (state.filters.searchBien) {
        const term = state.filters.searchBien.toLowerCase()
        filtered = filtered.filter(
          asignacion =>
            asignacion.bien?.codigo_institucional?.toLowerCase().includes(term) ||
            asignacion.bien?.nombre?.toLowerCase().includes(term) ||
            asignacion.bien?.marca?.toLowerCase().includes(term) ||
            asignacion.bien?.modelo?.toLowerCase().includes(term)
        )
      }

      if (state.filters.estado) {
        filtered = filtered.filter(asignacion => asignacion.estado === state.filters.estado)
      }

      if (state.filters.idUsuario) {
        filtered = filtered.filter(asignacion => asignacion.id_usuario === state.filters.idUsuario)
      }

      if (state.filters.idBien) {
        filtered = filtered.filter(asignacion => asignacion.id_bien === state.filters.idBien)
      }

      if (state.filters.fechaDesde) {
        filtered = filtered.filter(
          asignacion => new Date(asignacion.fecha_asignacion) >= new Date(state.filters.fechaDesde)
        )
      }

      if (state.filters.fechaHasta) {
        filtered = filtered.filter(
          asignacion => new Date(asignacion.fecha_asignacion) <= new Date(state.filters.fechaHasta)
        )
      }

      return filtered
    },

    asignacionesActivas: state => {
      return state.asignaciones.filter(a => a.estado === 'activa')
    },

    asignacionesPorUsuario: state => {
      const grupos = state.asignaciones.forEach(asignacion => {
        const userId = asignacion.id_usuario
        if (!grupos[userId]) {
          grupos[userId] = {
            usuario: asignacion.usuario,
            asignaciones: [],
            totalBienes: 0,
            valorTotal: 0,
          }
        }
        grupos[userId].asignaciones.push(asignacion)
        grupos[userId].totalBienes++
        grupos[userId].valorTotal += asignacion.bien?.valor || 0
      })
      return grupos
    },

    asignacionesPorBien: state => {
      const grupos = state.asignaciones.forEach(asignacion => {
        const bienId = asignacion.id_bien
        if (!grupos[bienId]) {
          grupos[bienId] = {
            bien: asignacion.bien,
            historial: [],
          }
        }
        grupos[bienId].historial.push(asignacion)
      })
      return grupos
    },

    asignacionesRecientes: state => {
      return [...state.asignaciones]
        .sort((a, b) => new Date(b.fecha_asignacion) - new Date(a.fecha_asignacion))
        .slice(0, 10)
    },

    asignacionesPendientesDevolucion: state => {
      return state.asignaciones.filter(
        a =>
          a.estado === 'activa' &&
          a.fecha_limite_devolucion &&
          new Date(a.fecha_limite_devolucion) < new Date()
      )
    },
  },

  actions: {
    async fetchAsignaciones({ page = 1, limit = 10, ...filters } = {}) {
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

        const response = await apiClient.get(`/asignaciones?${params}`)

        if (response.success) {
          this.asignaciones = response.data
          // Meta handling assuming it might be in response or data based on consistency
           if (response.meta) {
            this.pagination = {
              page: response.meta.page,
              limit: response.meta.limit,
              total: response.meta.total,
              totalPages: response.meta.totalPages,
            }
           }
          this.calcularMetricas()
        } else {
          throw new Error(response.message || 'Error al cargar asignaciones')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar asignaciones'
        this.asignaciones = []
      } finally {
        this.loading = false
      }
    },

    async fetchAsignacionById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.get(`/asignaciones/${id}`)

        if (response.success) {
          this.currentAsignacion = response.data
          return response.data
        } else {
          throw new Error(response.message || 'Error al cargar asignación')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createAsignacion(asignacionData) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.post('/asignaciones', asignacionData)

        if (response.success) {
          // Agregar la nueva asignación al estado
          this.asignaciones.unshift(response.data)
          this.calcularMetricas()
          return response.data
        } else {
          throw new Error(response.message || 'Error al crear asignación')
        }
      } catch (error) {
        this.error = error.message || 'Error al crear asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateAsignacion(id, updates) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.put(`/asignaciones/${id}`, updates)

        if (response.success) {
          // Actualizar la asignación en el estado
          const index = this.asignaciones.findIndex(asignacion => asignacion.id_asignacion === id)
          if (index !== -1) {
            this.asignaciones[index] = { ...this.asignaciones[index], ...response.data }
          }

          if (this.currentAsignacion?.id_asignacion === id) {
            this.currentAsignacion = { ...this.currentAsignacion, ...response.data }
          }

          this.calcularMetricas()
          return response.data
        } else {
          throw new Error(response.message || 'Error al actualizar asignación')
        }
      } catch (error) {
        this.error = error.message || 'Error al actualizar asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async finalizarAsignacion(id, datosFinalizacion) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.put(
          `/asignaciones/${id}/finalizar`,
          datosFinalizacion
        )

        if (response.success) {
          // Actualizar la asignación en el estado
          const index = this.asignaciones.findIndex(asignacion => asignacion.id_asignacion === id)
          if (index !== -1) {
            this.asignaciones[index] = { ...this.asignaciones[index], ...response.data }
          }

          this.calcularMetricas()
          return response.data
        } else {
          throw new Error(response.message || 'Error al finalizar asignación')
        }
      } catch (error) {
        this.error = error.message || 'Error al finalizar asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async transferirAsignacion(id, datosTransferencia) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.put(
          `/asignaciones/${id}/transferir`,
          datosTransferencia
        )

        if (response.success) {
          // Puede crear una nueva asignación y finalizar la actual
          await this.fetchAsignaciones()
          this.calcularMetricas()
          return response.data
        } else {
          throw new Error(response.message || 'Error al transferir asignación')
        }
      } catch (error) {
        this.error = error.message || 'Error al transferir asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAsignacionesByUsuario(idUsuario) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.get(`/usuarios/${idUsuario}/asignaciones`)

        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || 'Error al cargar asignaciones del usuario')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar asignaciones del usuario'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchHistorialBien(idBien) {
      this.loading = true
      this.error = null

      try {
        const response = await apiClient.get(`/bienes/${idBien}/historial-asignaciones`)

        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || 'Error al cargar historial del bien')
        }
      } catch (error) {
        this.error = error.message || 'Error al cargar historial del bien'
        throw error
      } finally {
        this.loading = false
      }
    },

    async generarActaAsignacion(id, tipoActa) {
      this.loading = true
      this.error = null

      try {
        const blob = await apiClient.get(`/asignaciones/${id}/acta/${tipoActa}`, {
          responseType: 'blob',
        })

        // Crea URL directo del blob
        const url = window.URL.createObjectURL(new Blob([blob]))
        const link = document.createElement('a')
        link.href = url

        // Nombre genérico ya que headers no son fácilmente accesibles en el blob return directo de apiClient
        // A menos que cambiemos apiClient par devolver full response con headers
        const filename = `acta_${tipoActa}_asignacion_${id}.pdf`
        
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        return true
      } catch (error) {
        this.error = error.message || 'Error al generar acta'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMetricas() {
      try {
        const response = await apiClient.get('/asignaciones/metricas')

        if (response.success) {
          this.metricas = response.data
        }
      } catch (error) {
        console.error('Error al cargar métricas:', error)
      }
    },

    calcularMetricas() {
      // Implementar lógica de métricas aquí o dejar vacío si no se usa
    },

    // Filtros
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },

    clearFilters() {
      this.filters = {
        searchUsuario: '',
        searchBien: '',
        estado: '',
        fechaDesde: '',
        fechaHasta: '',
        idUsuario: null,
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

    clearCurrentAsignacion() {
      this.currentAsignacion = null
    },

    // Validaciones
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

      return {
        isValid: errors.length === 0,
        errors,
      }
    },
  },
})
