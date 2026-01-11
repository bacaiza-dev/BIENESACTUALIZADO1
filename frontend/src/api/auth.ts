import apiClient from './client'
import type { LoginRequest, LoginResponse, User, ApiResponse } from '@/types'

export const authApi = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials)
      return response
    } catch (error) {
      throw error
    }
  },

  async logout(): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/auth/logout')
  },

  async getProfile(): Promise<ApiResponse<{ user: User; roles: any[] }>> {
    return await apiClient.get<{ user: User; roles: any[] }>('/auth/profile')
  },

  async getCurrentUser(): Promise<ApiResponse<{ user: User; roles: any[]; permissions: string[] }>> {
    return await apiClient.get<{ user: User; roles: any[]; permissions: string[] }>('/auth/me')
  },

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return await apiClient.put<User>('/auth/profile', profileData)
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  },

  async resetPassword(email: string): Promise<ApiResponse<void>> {
    return await apiClient.post<void>('/auth/reset-password', { email })
  },

  async verifyToken(): Promise<ApiResponse<{ valid: boolean }>> {
    return await apiClient.get<{ valid: boolean }>('/auth/verify-token')
  },

  // Métodos para manejar tokens JWT
  setAuthHeader(token: string) {
    apiClient.setAuthHeader(token)
  },

  clearAuthHeader() {
    apiClient.clearAuthHeader()
  },
}
