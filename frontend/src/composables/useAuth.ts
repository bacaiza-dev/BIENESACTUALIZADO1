import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const isUser = computed(() => authStore.isUser)
  const roles = computed(() => authStore.roles)
  const permissions = computed(() => authStore.permissions)

  const hasRole = (role: string) => {
    if (!authStore || !authStore.hasRole) return false
    return authStore.hasRole(role)
  }
  const hasPermission = (permission: string) => {
    if (!authStore || !authStore.hasPermission) return false
    return authStore.hasPermission(permission)
  }
  const hasAnyRole = (roles: string[]) => {
    if (!authStore || !authStore.hasAnyRole) return false
    return authStore.hasAnyRole(roles)
  }

  const canAccess = (requiredRoles?: string[], requiredPermissions?: string[]) => {
    if (!isAuthenticated.value) return false

    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasAnyRole(requiredRoles)) return false
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission))
      if (!hasAllPermissions) return false
    }

    return true
  }

  const canCreateAsset = computed(() => hasRole('Administrador'))
  const canEditAsset = computed(() => hasRole('Administrador'))
  const canDeleteAsset = computed(() => hasRole('Administrador'))
  const canViewAllAssets = computed(() => hasRole('Administrador'))
  const canManageUsers = computed(() => hasRole('Administrador'))
  const canManageRoles = computed(() => hasRole('Administrador'))
  const canManagePermissions = computed(() => hasRole('Administrador'))
  const canViewReports = computed(() => hasRole('Administrador'))
  const canExportData = computed(() => hasRole('Administrador'))
  const canImportData = computed(() => hasRole('Administrador'))

  const canCreateAssignment = computed(() => hasRole('Administrador'))
  const canEditAssignment = computed(() => hasRole('Administrador'))
  const canDeleteAssignment = computed(() => hasRole('Administrador'))

  const canCreateMaintenance = computed(() => hasRole('Administrador'))
  const canEditMaintenance = computed(() => hasRole('Administrador'))
  const canDeleteMaintenance = computed(() => hasRole('Administrador'))
  const canCompleteMaintenance = computed(() => hasRole('Administrador'))

  const canUploadDocuments = computed(() => hasRole('Administrador'))
  const canEditDocuments = computed(() => hasRole('Administrador'))
  const canDeleteDocuments = computed(() => hasRole('Administrador'))

  return {
    user,
    isAuthenticated,
    isAdmin,
    isUser,
    roles,
    permissions,
    hasRole,
    hasPermission,
    hasAnyRole,
    canAccess,
    canCreateAsset,
    canEditAsset,
    canDeleteAsset,
    canViewAllAssets,
    canManageUsers,
    canManageRoles,
    canManagePermissions,
    canViewReports,
    canExportData,
    canImportData,
    canCreateAssignment,
    canEditAssignment,
    canDeleteAssignment,
    canCreateMaintenance,
    canEditMaintenance,
    canDeleteMaintenance,
    canCompleteMaintenance,
    canUploadDocuments,
    canEditDocuments,
    canDeleteDocuments,
  }
}
