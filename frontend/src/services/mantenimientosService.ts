import apiClient from '@/api/client'
import type { ApiResponse } from '@/types'

export interface Mantenimiento {
  id_mantenimiento: number
  id_bien: number
  descripcion: string
  fecha_programada: string
  fecha_realizada?: string
  estado: string
  responsable_nombre?: string
  bien_nombre?: string
  codigo_institucional?: string
}

export const mantenimientosService = {
  async getAll(): Promise<ApiResponse<Mantenimiento[]>> {
    return await apiClient.get<Mantenimiento[]>('/mantenimientos')
  },

  async create(data: Partial<Mantenimiento>): Promise<ApiResponse<{ id: number }>> {
    return await apiClient.post<{ id: number }>('/mantenimientos', data)
  },

  async update(id: number, data: Partial<Mantenimiento>): Promise<ApiResponse<void>> {
    return await apiClient.put<void>(`/mantenimientos/${id}`, data)
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/mantenimientos/${id}`)
  }
}

export default mantenimientosService
