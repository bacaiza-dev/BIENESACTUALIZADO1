import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Role, LoginRequest, LoginResponse, ApiResponse, Permission } from '@/types'
import { authApi } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const roles = ref<Role[]>([])
  const permissions = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const isAdmin = computed(() => {
    if (!roles.value || !Array.isArray(roles.value)) return false
    return roles.value.some((role: Role) => role && role.nombre === 'Administrador')
  })

  const isUser = computed(() => {
    if (!roles.value || !Array.isArray(roles.value)) return false
    return roles.value.some((role: Role) => role && role.nombre === 'Usuario')
  })

  const hasRole = (roleName: string) => {
    return roles.value.some((role: Role) => role.nombre === roleName)
  }

  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission)
  }

  const hasAnyRole = (roleNames: string[]) => {
    return roleNames.some(roleName => hasRole(roleName))
  }

  const login = async (credentials: LoginRequest, rememberMe = false): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<LoginResponse> = await authApi.login(credentials)


      if (response.success) {
        user.value = response.data.user
        token.value = response.data.token
        roles.value = response.data.roles || []
        permissions.value = response.data.permissions || []


        // Extraer permisos de todos los roles
        permissions.value = response.data.roles.flatMap((role: any) =>
          role.permisos?.map((permiso: Permission) => `${permiso.recurso}:${permiso.accion}`) || []
        )

        // Configurar el token en el cliente API
        authApi.setAuthHeader(response.data.token)
        
        // Guardar token y roles en localStorage siempre
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('authRoles', JSON.stringify(response.data.roles))
        localStorage.setItem('authUser', JSON.stringify(response.data.user))

        // Redirigir según el rol del usuario
        await redirectAfterLogin()
      } else {
        throw new Error(response.message || 'Login falló')
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Error desconocido al iniciar sesión'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  const redirectAfterLogin = async () => {
    const userRoles = roles.value || []

    // Si es administrador, ir al dashboard principal
    if (userRoles.some((role: any) => role.nombre === 'Administrador')) {
      await router.push('/dashboard')
    }
    // Si es usuario normal, ir a dashboard de usuario
    else if (userRoles.some((role: any) => role.nombre === 'Usuario')) {
      await router.push('/dashboard-user')
    }
    // Fallback al dashboard principal
    else {
      await router.push('/dashboard')
    }
  }

  const logout = async () => {
    try {
      // Llamar al endpoint de logout 
      await authApi.logout()
    } catch (error) {
      console.error('Error durante logout:', error)
    } finally {
      // Limpiar estado local
      user.value = null
      token.value = null
      roles.value = []
      permissions.value = []
      error.value = null
      
      // Limpiar token del cliente API
      authApi.clearAuthHeader()
      
      // Limpiar localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('authRoles')
      localStorage.removeItem('authUser')

      // Redirigir a login
      router.push('/login')
    }
  }

  const initializeAuth = async () => {
    try {
      // Verificar si ya hay un token guardado
      const savedToken = localStorage.getItem('authToken')
      if (!savedToken) {
        // No hay token, no hacer nada
        return
      }
      
      token.value = savedToken
      authApi.setAuthHeader(savedToken)
      
      // Intentar restaurar roles desde localStorage primero
      const savedRoles = localStorage.getItem('authRoles')
      const savedUser = localStorage.getItem('authUser')
      
      if (savedRoles && savedUser) {
        roles.value = JSON.parse(savedRoles)
        user.value = JSON.parse(savedUser)
        
        // Extraer permisos de roles guardados
        permissions.value = roles.value.flatMap((role: any) =>
          role.permisos?.map((permiso: Permission) => `${permiso.recurso}:${permiso.accion}`) || []
        )
      }
      
      // Intentar obtener el usuario actual desde el servidor para validar
      const response = await authApi.getCurrentUser()
      
      if (response.success) {
        user.value = response.data.user
        roles.value = response.data.roles || []
        permissions.value = response.data.permissions || []
        
        // Extraer permisos de roles si es necesario
        if (response.data.roles) {
          permissions.value = response.data.roles.flatMap((role: any) =>
            role.permisos?.map((permiso: Permission) => `${permiso.recurso}:${permiso.accion}`) || []
          )
        }
      }
    } catch (error) {
      // Si falla, el usuario no está autenticado
      console.error('Error initializing auth:', error)
      user.value = null
      token.value = null
      roles.value = []
      permissions.value = []
      // Limpiar token inválido sin redirigir (el interceptor ya lo hace)
      authApi.clearAuthHeader()
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const response = await authApi.updateProfile(profileData)
      if (response.success) {
        user.value = { ...user.value!, ...response.data }
        // No necesitamos guardar en localStorage con httpOnly cookies
      }
      return response
    } catch (error) {
      throw error
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await authApi.changePassword(currentPassword, newPassword)
      return response
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const response = await authApi.resetPassword(email)
      return response
    } catch (error) {
      throw error
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    token,
    roles,
    permissions,
    loading,
    error,

    // Getters
    isAuthenticated,
    isAdmin,
    isUser,

    // Actions
    login,
    logout,
    initializeAuth,
    updateProfile,
    changePassword,
    resetPassword,
    hasRole,
    hasPermission,
    hasAnyRole,
    clearError,
  }
})
