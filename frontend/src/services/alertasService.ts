import apiClient from '@/api/client'
import type { ApiResponse } from '@/types'

export interface Alerta {
  id_alerta: number
  id_bien: number
  tipo_alerta: string
  descripcion: string
  prioridad: string
  fecha_alerta: string
  fecha_resolucion?: string
  bien_nombre?: string
}

export const alertasService = {
  async getAll(): Promise<ApiResponse<Alerta[]>> {
    return await apiClient.get<Alerta[]>('/alertas')
  },

  async create(data: Partial<Alerta>): Promise<ApiResponse<{ id: number }>> {
    return await apiClient.post<{ id: number }>('/alertas', data)
  },

  async resolve(id: number): Promise<ApiResponse<void>> {
    return await apiClient.put<void>(`/alertas/${id}`, {})
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/alertas/${id}`)
  }
}

export default alertasService
