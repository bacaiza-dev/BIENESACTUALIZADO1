import apiClient from './client'
import type { Asset, AssetFilters, PaginatedResponse, ApiResponse } from '@/types'

export const assetsApi = {
  async getAll(
    params: AssetFilters & { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<Asset>>> {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString())
      }
    })

    return await apiClient.get<PaginatedResponse<Asset>>(`/bienes?${queryParams.toString()}`)
  },

  async getById(id: number): Promise<ApiResponse<Asset>> {
    return await apiClient.get<Asset>(`/bienes/${id}`)
  },

  async create(
    assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<Asset>> {
    return await apiClient.post<Asset>('/bienes', assetData)
  },

  async update(id: number, assetData: Partial<Asset>): Promise<ApiResponse<Asset>> {
    return await apiClient.put<Asset>(`/bienes/${id}`, assetData)
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/bienes/${id}`)
  },

  async generateQR(id: number): Promise<ApiResponse<{ qrCode: string; qrCodeSenescyt: string }>> {
    return await apiClient.get<{ qrCode: string; qrCodeSenescyt: string }>(`/bienes/${id}/qr`)
  },

  async export(
    format: 'pdf' | 'excel',
    filters: AssetFilters = {}
  ): Promise<ApiResponse<{ url: string }>> {
    const queryParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString())
      }
    })

    return await apiClient.get<{ url: string }>(
      `/bienes/export/${format}?${queryParams.toString()}`
    )
  },

  async upload(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData()
    formData.append('file', file)

    return await apiClient.post<{ url: string }>('/bienes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async import(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData()
    formData.append('file', file)

    return await apiClient.post<{ imported: number; errors: string[] }>(
      '/bienes/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  },
}
