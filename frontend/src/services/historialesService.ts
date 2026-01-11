import apiClient from '@/api/client'
import type { ApiResponse } from '@/types'

export interface HistorialUbicacion {
  id: number
  id_bien: number
  id_ubicacion: number
  ubicacion_nombre: string
  fecha_asignacion: string
  fecha_retiro?: string
  activo: boolean
  observaciones?: string
}

export interface HistorialCustodia {
  id: number
  id_bien: number
  id_usuario: number
  nombres: string
  apellidos: string
  fecha_asignacion: string
  fecha_devolucion?: string
  activo: boolean
  observaciones?: string
}

export const historialesService = {
  async getHistorialUbicacion(bienId: number): Promise<ApiResponse<HistorialUbicacion[]>> {
    return await apiClient.get<HistorialUbicacion[]>(`/historial-ubicacion/${bienId}`)
  },

  async getHistorialCustodia(bienId: number): Promise<ApiResponse<HistorialCustodia[]>> {
    return await apiClient.get<HistorialCustodia[]>(`/historial-custodia/${bienId}`)
  }
}

export default historialesService
