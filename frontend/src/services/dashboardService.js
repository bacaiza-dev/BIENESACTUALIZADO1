import api from './api'

export const dashboardService = {
  // Obtener métricas principales del dashboard
  async getDashboardMetrics() {
    try {
      const response = await api.get('/dashboard/metrics')
      return response.data
    } catch (_error) {
      // Retornar datos mock en caso de error
      return {
        totalBienes: 1247,
        usuariosActivos: 45,
        areasRegistradas: 12,
        valorTotal: 2450000,
        cambios: {
          bienes: '+23 este mes',
          usuarios: 'Sin cambios',
          areas: '+2 nuevas',
          valor: '+5.2%',
        },
      }
    }
  },

  // Obtener distribución de bienes por categoría
  async getCategoryDistribution(timeframe = 'month') {
    try {
      const response = await api.get(`/dashboard/categories?timeframe=${timeframe}`)
      return response.data
    } catch (_error) {
      // Datos mock
      return {
        labels: ['Tecnología', 'Mobiliario', 'Vehículos', 'Audiovisual', 'Equipos Médicos'],
        values: [500, 300, 200, 247, 150],
        colors: ['#e63946', '#4361ee', '#38b000', '#f9c74f', '#9d4edd'],
      }
    }
  },

  // Obtener actividad reciente
  async getRecentActivity(limit = 10) {
    try {
      const response = await api.get(`/dashboard/activity?limit=${limit}`)
      return response.data
    } catch (_error) {
      // Datos mock
      return [
        {
          id: 1,
          icon: 'fas fa-plus-circle',
          type: 'success',
          description: 'Nuevo bien registrado: Laptop Dell XPS 13',
          timestamp: Date.now(),
          status: 'completed',
          statusText: 'Completado',
        },
        {
          id: 2,
          icon: 'fas fa-map-marker-alt',
          type: 'info',
          description: 'Actualización de ubicación: Monitor Samsung',
          timestamp: Date.now() - 5 * 60 * 1000,
          status: 'processing',
          statusText: 'Procesando',
        },
        {
          id: 3,
          icon: 'fas fa-trash-alt',
          type: 'warning',
          description: 'Bien dado de baja: Impresora HP LaserJet',
          timestamp: Date.now() - 10 * 60 * 1000,
          status: 'pending',
          statusText: 'Pendiente',
        },
        {
          id: 4,
          icon: 'fas fa-user-plus',
          type: 'success',
          description: 'Nuevo usuario registrado: María González',
          timestamp: Date.now() - 15 * 60 * 1000,
          status: 'completed',
          statusText: 'Completado',
        },
      ]
    }
  },

  // Obtener bienes de mayor valor
  async getTopValueItems(limit = 5) {
    try {
      const response = await api.get(`/dashboard/top-value?limit=${limit}`)
      return response.data
    } catch (_error) {
      // Datos mock
      return [
        {
          id: 1,
          nombre: 'Servidor Dell PowerEdge R740',
          codigo: 'SRV-001',
          categoria: 'Tecnología',
          valor: 85000,
          estado: 'ACTIVO',
          imagen: '',
        },
        {
          id: 2,
          nombre: 'Proyector Epson EB-X41',
          codigo: 'PRY-045',
          categoria: 'Audiovisual',
          valor: 45000,
          estado: 'ACTIVO',
          imagen: '',
        },
        {
          id: 3,
          nombre: 'Vehículo Toyota Hilux',
          codigo: 'VEH-023',
          categoria: 'Vehículos',
          valor: 35000,
          estado: 'ACTIVO',
          imagen: '',
        },
        {
          id: 4,
          nombre: 'Equipo de Rayos X',
          codigo: 'MED-012',
          categoria: 'Equipos Médicos',
          valor: 28000,
          estado: 'ACTIVO',
          imagen: '',
        },
        {
          id: 5,
          nombre: 'Mesa de Conferencias',
          codigo: 'MOB-089',
          categoria: 'Mobiliario',
          valor: 12000,
          estado: 'ACTIVO',
          imagen: '',
        },
      ]
    }
  },

  // Obtener alertas del sistema
  async getSystemAlerts() {
    try {
      const response = await api.get('/dashboard/alerts')
      return response.data
    } catch (_error) {
      // Datos mock
      return [
        {
          id: 1,
          icon: 'fas fa-tools',
          type: 'warning',
          title: 'Mantenimiento Pendiente',
          description: '5 equipos requieren mantenimiento preventivo',
          timestamp: Date.now(),
          status: 'pending',
          statusText: 'Pendiente',
        },
        {
          id: 2,
          icon: 'fas fa-info-circle',
          type: 'info',
          title: 'Actualización del Sistema',
          description: 'Nueva versión disponible v2.1.0',
          timestamp: Date.now() - 10 * 60 * 1000,
          status: 'info',
          statusText: 'Info',
        },
        {
          id: 3,
          icon: 'fas fa-exclamation-triangle',
          type: 'warning',
          title: 'Bienes Sin Ubicación',
          description: '12 bienes no tienen ubicación asignada',
          timestamp: Date.now() - 30 * 60 * 1000,
          status: 'pending',
          statusText: 'Pendiente',
        },
        {
          id: 4,
          icon: 'fas fa-check-circle',
          type: 'success',
          title: 'Backup Completado',
          description: 'Respaldo de base de datos exitoso',
          timestamp: Date.now() - 60 * 60 * 1000,
          status: 'completed',
          statusText: 'Completado',
        },
      ]
    }
  },

  // Exportar datos del dashboard
  async exportDashboardData(format = 'excel') {
    try {
      const response = await api.get(`/dashboard/export?format=${format}`, {
        responseType: 'blob',
      })
      return response.data
    } catch (_error) {
      throw new Error('Error al exportar datos')
    }
  },

  // Refrescar todos los datos del dashboard
  async refreshDashboardData() {
    try {
      const [metrics, categories, activity, topItems, alerts] = await Promise.all([
        this.getDashboardMetrics(),
        this.getCategoryDistribution(),
        this.getRecentActivity(),
        this.getTopValueItems(),
        this.getSystemAlerts(),
      ])

      return {
        metrics,
        categories,
        activity,
        topItems,
        alerts,
      }
    } catch (error) {
      console.error('Error al refrescar datos del dashboard:', error)
      throw error
    }
  },
}

export default dashboardService
