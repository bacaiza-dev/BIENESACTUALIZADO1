import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'

class ApiClient {
  private client: AxiosInstance
  private isRedirecting = false

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
      withCredentials: false, // Usar headers Authorization en lugar de cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
    // Inicializar configuración de manera síncrona
    this.client.defaults.baseURL = import.meta.env.VITE_API_URL || '/api'
    this.client.defaults.timeout = 10000
  }


  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      config => {
        // Asegurar que headers existe
        if (!config.headers) {
          config.headers = {}
        }
        
        // Agregar token de localStorage si existe
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      error => {
        if (error.response?.status === 401 && !this.isRedirecting) {
          this.isRedirecting = true
          
          // Token expirado o inválido - limpiar datos
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          delete this.client.defaults.headers.common?.['Authorization']
          
          // Solo redirigir si no estamos ya en login
          if (window.location.pathname !== '/login') {
            // Usar router en lugar de window.location para evitar recarga completa
            import('@/router').then(({ default: router }) => {
              router.push('/login').finally(() => {
                // Reset flag después de la redirección
                setTimeout(() => {
                  this.isRedirecting = false
                }, 1000)
              })
            })
          } else {
            this.isRedirecting = false
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Métodos para manejar tokens JWT
  public setAuthHeader(token: string) {
    localStorage.setItem('authToken', token)
    // Asegurar que headers existe
    if (!this.client.defaults.headers.common) {
      this.client.defaults.headers.common = {}
    }
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  public clearAuthHeader() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    // Verificar que headers existe antes de eliminar
    if (this.client.defaults.headers.common) {
      delete this.client.defaults.headers.common['Authorization']
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  private handleError(error: any) {
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 'Error del servidor',
        data: null,
        status: error.response.status,
      }
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        message: 'Error de conexión',
        data: null,
        status: 0,
      }
    } else {
      // Error in request setup
      return {
        success: false,
        message: error.message || 'Error desconocido',
        data: null,
        status: 0,
      }
    }
  }
}

export const apiClient = new ApiClient()
export default apiClient
