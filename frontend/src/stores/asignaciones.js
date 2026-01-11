// src/stores/asignaciones.js
import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

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

        const response = await axios.get(`${API_BASE_URL}/asignaciones?${params}`)

        if (response.data.success) {
          this.asignaciones = response.data.data
          this.pagination = {
            page: response.data.meta.page,
            limit: response.data.meta.limit,
            total: response.data.meta.total,
            totalPages: response.data.meta.totalPages,
          }
          this.calcularMetricas()
        } else {
          throw new Error(response.data.message || 'Error al cargar asignaciones')
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Error al cargar asignaciones'
        this.asignaciones = []
      } finally {
        this.loading = false
      }
    },

    async fetchAsignacionById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_BASE_URL}/asignaciones/${id}`)

        if (response.data.success) {
          this.currentAsignacion = response.data.data
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error al cargar asignación')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al cargar asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createAsignacion(asignacionData) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post(`${API_BASE_URL}/asignaciones`, asignacionData)

        if (response.data.success) {
          // Agregar la nueva asignación al estado
          this.asignaciones.unshift(response.data.data)
          this.calcularMetricas()
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error al crear asignación')
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al crear asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateAsignacion(id, updates) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.put(`${API_BASE_URL}/asignaciones/${id}`, updates)

        if (response.data.success) {
          // Actualizar la asignación en el estado
          const index = this.asignaciones.findIndex(asignacion => asignacion.id_asignacion === id)
          if (index !== -1) {
            this.asignaciones[index] = { ...this.asignaciones[index], ...response.data.data }
          }

          if (this.currentAsignacion?.id_asignacion === id) {
            this.currentAsignacion = { ...this.currentAsignacion, ...response.data.data }
          }

          this.calcularMetricas()
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error al actualizar asignación')
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Error al actualizar asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async finalizarAsignacion(id, datosFinalizacion) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.put(
          `${API_BASE_URL}/asignaciones/${id}/finalizar`,
          datosFinalizacion
        )

        if (response.data.success) {
          // Actualizar la asignación en el estado
          const index = this.asignaciones.findIndex(asignacion => asignacion.id_asignacion === id)
          if (index !== -1) {
            this.asignaciones[index] = { ...this.asignaciones[index], ...response.data.data }
          }

          this.calcularMetricas()
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error al finalizar asignación')
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Error al finalizar asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async transferirAsignacion(id, datosTransferencia) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.put(
          `${API_BASE_URL}/asignaciones/${id}/transferir`,
          datosTransferencia
        )

        if (response.data.success) {
          // Puede crear una nueva asignación y finalizar la actual
          await this.fetchAsignaciones()
          this.calcularMetricas()
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error al transferir asignación')
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Error al transferir asignación'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAsignacionesByUsuario(idUsuario) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_BASE_URL}/usuarios/${idUsuario}/asignaciones`)

        if (response.data.success) {
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error al cargar asignaciones del usuario')
        }
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          'Error al cargar asignaciones del usuario'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchHistorialBien(idBien) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_BASE_URL}/bienes/${idBien}/historial-asignaciones`)

        if (response.data.success) {
          return response.data.data
        } else {
          throw new Error(response.data.message || 'Error al cargar historial del bien')
        }
      } catch (error) {
        this.error =
          error.response?.data?.message || error.message || 'Error al cargar historial del bien'
        throw error
      } finally {
        this.loading = false
      }
    },

    async generarActaAsignacion(id, tipoActa) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${API_BASE_URL}/asignaciones/${id}/acta/${tipoActa}`, {
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

        return true
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al generar acta'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMetricas() {
      try {
        const response = await axios.get(`${API_BASE_URL}/asignaciones/metricas`)

        if (response.data.success) {
          this.metricas = response.data.data
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
