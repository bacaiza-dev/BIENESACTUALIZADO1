import apiClient from '@/api/client'
import { useOfflineData } from '@/composables/useOfflineData'
import type { ApiResponse } from '@/types'

class DataService {
  private offlineData = useOfflineData()

  // Usuarios
  async getUsuarios(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<any[]>('/usuarios')
      
      // Guardar en offline storage
      if (response.success && response.data) {
        await this.offlineData.saveOfflineData('usuarios', response.data)
      }
      
      return response
    } catch (error) {
      console.warn('❌ Error obteniendo usuarios, usando datos offline')
      const offlineUsuarios = await this.offlineData.getOfflineData('usuarios')
      return {
        success: true,
        data: offlineUsuarios || [],
        message: 'Datos offline'
      }
    }
  }

  async createUsuario(userData: any): Promise<ApiResponse<any>> {
    return await apiClient.post<any>('/usuarios', userData)
  }

  async updateUsuario(id: number, userData: any): Promise<ApiResponse<any>> {
    return await apiClient.put<any>(`/usuarios/${id}`, userData)
  }

  async deleteUsuario(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/usuarios/${id}`)
  }

  // Categorías
  async getCategorias(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<any[]>('/categorias')
      
      if (response.success && response.data) {
        await this.offlineData.saveOfflineData('categorias', response.data)
      }
      
      return response
    } catch (error) {
      console.warn('❌ Error obteniendo categorías, usando datos offline')
      const offlineCategorias = await this.offlineData.getOfflineData('categorias')
      return {
        success: true,
        data: offlineCategorias || [],
        message: 'Datos offline'
      }
    }
  }

  async createCategoria(categoriaData: any): Promise<ApiResponse<any>> {
    return await apiClient.post<any>('/categorias', categoriaData)
  }

  async updateCategoria(id: number, categoriaData: any): Promise<ApiResponse<any>> {
    return await apiClient.put<any>(`/categorias/${id}`, categoriaData)
  }

  async deleteCategoria(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/categorias/${id}`)
  }

  // Ubicaciones
  async getUbicaciones(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<any[]>('/ubicaciones')
      
      if (response.success && response.data) {
        await this.offlineData.saveOfflineData('ubicaciones', response.data)
      }
      
      return response
    } catch (error) {
      console.warn('❌ Error obteniendo ubicaciones, usando datos offline')
      const offlineUbicaciones = await this.offlineData.getOfflineData('ubicaciones')
      return {
        success: true,
        data: offlineUbicaciones || [],
        message: 'Datos offline'
      }
    }
  }

  async createUbicacion(ubicacionData: any): Promise<ApiResponse<any>> {
    return await apiClient.post<any>('/ubicaciones', ubicacionData)
  }

  async updateUbicacion(id: number, ubicacionData: any): Promise<ApiResponse<any>> {
    return await apiClient.put<any>(`/ubicaciones/${id}`, ubicacionData)
  }

  async deleteUbicacion(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/ubicaciones/${id}`)
  }

  // Bienes
  async getBienes(params?: any): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString())
          }
        })
      }

      const url = `/bienes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get<any[]>(url)
      
      if (response.success && response.data) {
        await this.offlineData.saveOfflineData('bienes', response.data)
      }
      
      return response
    } catch (error) {
      console.warn('❌ Error obteniendo bienes, usando datos offline')
      const offlineBienes = await this.offlineData.getOfflineData('bienes')
      return {
        success: true,
        data: offlineBienes || [],
        message: 'Datos offline'
      }
    }
  }

  async getBienById(id: number): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get<any>(`/bienes/${id}`)
    } catch (error) {
      console.warn('❌ Error obteniendo bien por ID')
      const offlineBienes = await this.offlineData.getOfflineData('bienes')
      const bien = offlineBienes?.find((b: any) => b.id === id)
      
      return {
        success: !!bien,
        data: bien || null,
        message: bien ? 'Datos offline' : 'Bien no encontrado'
      }
    }
  }

  async createBien(bienData: any): Promise<ApiResponse<any>> {
    return await apiClient.post<any>('/bienes', bienData)
  }

  async updateBien(id: number, bienData: any): Promise<ApiResponse<any>> {
    return await apiClient.put<any>(`/bienes/${id}`, bienData)
  }

  async deleteBien(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/bienes/${id}`)
  }

  // Movimientos
  async getMovimientos(params?: any): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString())
          }
        })
      }

      const url = `/movimientos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await apiClient.get<any[]>(url)
      
      if (response.success && response.data) {
        await this.offlineData.saveOfflineData('movimientos', response.data)
      }
      
      return response
    } catch (error) {
      console.warn('❌ Error obteniendo movimientos, usando datos offline')
      const offlineMovimientos = await this.offlineData.getOfflineData('movimientos')
      return {
        success: true,
        data: offlineMovimientos || [],
        message: 'Datos offline'
      }
    }
  }

  async createMovimiento(movimientoData: any): Promise<ApiResponse<any>> {
    return await apiClient.post<any>('/movimientos', movimientoData)
  }

  // Dashboard y estadísticas
  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>('/dashboard/stats')
      
      if (response.success && response.data) {
        await this.offlineData.saveOfflineData('dashboard', response.data)
      }
      
      return response
    } catch (error) {
      console.warn('❌ Error obteniendo estadísticas, usando datos offline')
      const offlineStats = await this.offlineData.getOfflineData('dashboard')
      return {
        success: true,
        data: offlineStats || {
          totalBienes: 0,
          totalUsuarios: 0,
          totalCategorias: 0,
          totalUbicaciones: 0,
          bienesActivos: 0,
          bienesInactivos: 0,
          bienesMantenimiento: 0,
          bienesBaja: 0
        },
        message: 'Datos offline'
      }
    }
  }

  // Reportes
  async getReports(type: string, params?: any): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }

    const url = `/reportes/${type}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await apiClient.get<any>(url)
  }

  // Exportar datos
  async exportData(format: 'pdf' | 'excel', type: string, params?: any): Promise<ApiResponse<{ url: string }>> {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString())
        }
      })
    }

    const url = `/export/${type}/${format}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return await apiClient.get<{ url: string }>(url)
  }

  // Validar conexión con la base de datos
  async validateConnection(): Promise<boolean> {
    try {
      const response = await apiClient.get<any>('/test-db')
      return response.success
    } catch (error) {
      console.error('❌ Error validando conexión con la base de datos:', error)
      return false
    }
  }

  // Sincronizar datos
  async syncData(): Promise<boolean> {
    try {
      if (import.meta.env.DEV) console.log('Sincronizando datos...')
      
      // Sincronizar todos los datos principales
      await Promise.all([
        this.getUsuarios(),
        this.getCategorias(),
        this.getUbicaciones(),
        this.getBienes(),
        this.getDashboardStats()
      ])
      
      await this.offlineData.syncOfflineData()
      if (import.meta.env.DEV) console.log('Sincronización completada')
      return true
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
      return false
    }
  }
}

export const dataService = new DataService()
export default dataService
