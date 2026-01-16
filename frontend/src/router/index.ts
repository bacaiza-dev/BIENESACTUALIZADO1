import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/inicio',
  },
  {
    path: '/inicio',
    name: 'Inicio',
    component: () => import('@/views/publicas/InicioView.vue'),
    meta: { requiresAuth: false, layout: 'public' },
  },
  {
    path: '/contactos',
    name: 'Contactos',
    component: () => import('@/views/publicas/ContactosView.vue'),
    meta: { requiresAuth: false, layout: 'public' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/usuarios/LoginView.vue'),
    meta: { requiresAuth: false, layout: 'public' },
  },
  {
    path: '/recover-password',
    name: 'RecoverPassword',
    component: () => import('@/views/otros/RecuperarPasswordView.vue'),
    meta: { requiresAuth: false, layout: 'public' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/dashboard-user',
    name: 'DashboardUser',
    component: () => import('@/views/dashboard/DashboardUser.vue'),
    meta: { requiresAuth: true, roles: ['Usuario', 'Administrador'] },
  },
  {
    path: '/busqueda',
    name: 'Busqueda',
    component: () => import('@/views/busqueda/BusquedaView.vue'),
    meta: { requiresAuth: true, roles: ['Administrador', 'Usuario'] },
  },
  {
    path: '/bienes',
    name: 'BienesList',
    component: () => import('@/views/bienes/BienesList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador', 'Usuario'] },
  },
  {
    path: '/bienes/:id',
    name: 'BienDetail',
    component: () => import('@/views/bienes/BienDetail.vue'),
    meta: { requiresAuth: true, roles: ['Administrador', 'Usuario'] },
  },
  {
    path: '/bienes/create',
    name: 'BienCreate',
    component: () => import('@/views/bienes/BienForm.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/bienes/:id/edit',
    name: 'BienEdit',
    component: () => import('@/views/bienes/BienForm.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/qr-scanner',
    name: 'QRScanner',
    component: () => import('@/views/mobile/QRScannerView.vue'),
    meta: { requiresAuth: true, roles: ['Administrador', 'Usuario'], mobileOnly: true },
  },
  {
    path: '/usuarios',
    name: 'UsuariosList',
    component: () => import('@/views/usuarios/UsuariosList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/usuarios/Profile.vue'),
    meta: { requiresAuth: true, roles: ['Administrador', 'Usuario'] },
  },
  {
    path: '/ubicaciones',
    name: 'UbicacionesList',
    component: () => import('@/views/otros/UbicacionesList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador', 'Usuario'] },
  },
  {
    path: '/salas',
    name: 'SalasList',
    component: () => import('@/views/otros/UbicacionesList.vue'),
    props: {
      title: 'Gestión de Salas',
      description: 'Administra aulas y laboratorios del sistema',
      createLabel: 'Nueva Sala',
      allowedTipos: ['aula', 'laboratorio'],
    },
    meta: { requiresAuth: true, roles: ['Administrador', 'Usuario'] },
  },
  {
    path: '/aulas-asignadas',
    name: 'AulasAsignadas',
    component: () => import('@/views/espacios/AulasAsignadasList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador', 'Usuario'] },
  },
  {
    path: '/categorias',
    name: 'CategoriasList',
    component: () => import('@/views/otros/CategoriasList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/periodos',
    name: 'PeriodosList',
    component: () => import('@/views/configuracion/PeriodosList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/alertas',
    name: 'AlertasList',
    component: () => import('@/views/notificaciones/AlertasList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/mantenimientos',
    name: 'MantenimientosList',
    component: () => import('@/views/mantenimientos/MantenimientosList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/auditoria',
    name: 'AuditoriaList',
    component: () => import('@/views/bienes/AuditoriaList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/import-export',
    name: 'ImportExport',
    component: () => import('@/views/reportes/ImportExport.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('@/views/reportes/ReportesView.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/documentos',
    name: 'DocumentosList',
    component: () => import('@/views/mantenimientos/DocumentosList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/asignaciones',
    name: 'AsignacionesList',
    component: () => import('@/views/mantenimientos/AsignacionesList.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/configuracion',
    name: 'ConfiguracionView',
    component: () => import('@/views/configuracion/ConfiguracionView.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/help',
    name: 'HelpSupport',
    component: () => import('@/views/otros/HelpSupport.vue'),
    meta: { requiresAuth: true, roles: ['Administrador', 'Usuario'] },
  },
  {
    path: '/system-settings',
    name: 'SystemSettings',
    component: () => import('@/views/otros/SystemSettings.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/system-logs',
    name: 'SystemLogs',
    component: () => import('@/views/otros/SystemLogs.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'] },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const uiStore = useUIStore()

  // Prevent infinite loops
  if (to.name === _from.name && to.path === _from.path) {
    return next()
  }

  // UI state management
  if (to.path !== _from.path) {
    uiStore.setLoading(true)
  }
  uiStore.closeSidebar()

  // Handle public routes
  if (to.meta.requiresAuth === false) {
    if (to.name === 'Login' && authStore.isAuthenticated) {
      const redirectTo = authStore.isAdmin ? 'Dashboard' : 'DashboardUser'
      return next({ name: redirectTo })
    }
    return next()
  }

  // Handle protected routes
  try {
    if (!authStore.isAuthenticated) {
      // Solo intentar inicializar auth si hay un token guardado
      const savedToken = localStorage.getItem('authToken')
      if (savedToken) {
        await authStore.initializeAuth()
      }
    }

    if (!authStore.isAuthenticated) {
      return next({
        name: 'Login',
        query: { redirect: to.fullPath },
      })
    }

    // Role-based access control
    if (to.meta.roles && !authStore.hasAnyRole(to.meta.roles as string[])) {
      const redirectTo = authStore.isAdmin ? 'Dashboard' : 'DashboardUser'
      return next({ name: redirectTo })
    }

    // Permission-based access control
    if (to.meta.permissions && !(to.meta.permissions as string[]).some(p => authStore.hasPermission(p))) {
      const redirectTo = authStore.isAdmin ? 'Dashboard' : 'DashboardUser'
      return next({ name: redirectTo })
    }

    next()
  } catch (error) {
    uiStore.setLoading(false)
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
  }
})

router.afterEach((to, from) => {
  const uiStore = useUIStore()
  
  // Only set loading to false if we actually changed routes
  if (to.path !== from.path) {
    // Small delay to ensure smooth transitions
    setTimeout(() => {
      uiStore.setLoading(false)
    }, 50)
  }
})

export default router
