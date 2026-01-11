<template>
  <div>
    <!-- Mobile sidebar backdrop -->
    <div
      v-if="uiStore.sidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
      @click="uiStore.closeSidebar"
    />

    <!-- Sidebar -->
    <div
      :class="[
        'fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 z-50 flex flex-col',
        {
          'translate-x-0': uiStore.sidebarOpen,
          '-translate-x-full lg:translate-x-0': !uiStore.sidebarOpen,
        },
      ]"
    >
      <!-- Logo -->
      <div
        class="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 px-4 flex-shrink-0"
      >
        <img src="@/assets/LogoINT.png" alt="INT Logo" class="h-8 w-auto" />
        <span class="ml-2 text-xl font-bold text-gray-800 dark:text-white truncate">INT Bienes</span>
      </div>

      <!-- Navigation -->
      <nav class="mt-6 px-3 flex-1 overflow-y-auto">
        <div class="space-y-1">
          <!-- Dashboard -->
          <template v-if="authStore.isAdmin">
            <NavItem :to="{ name: 'Dashboard' }" icon="bx-home-alt" label="Dashboard" />
          </template>

          <template v-else>
            <NavItem :to="{ name: 'DashboardUser' }" icon="bx-home-alt" label="Mi Dashboard" />
          </template>

          <!-- Bienes -->
          <NavGroup icon="bx-package" label="Bienes" :items="bienesItems" />

          <!-- Usuarios (Solo Admin) -->
          <NavGroup
            v-if="authStore.isAdmin"
            icon="bx-user"
            label="Usuarios"
            :items="usuariosItems"
          />

          <!-- Configuración -->
          <NavGroup icon="bx-cog" label="Configuración" :items="configuracionItems" />

          <!-- Reportes (Solo Admin) -->
          <NavGroup
            v-if="authStore.isAdmin"
            icon="bx-bar-chart-alt-2"
            label="Reportes"
            :items="reportesItems"
          />

          <!-- Mantenimiento (Solo Admin) -->
          <NavGroup
            v-if="authStore.isAdmin"
            icon="bx-wrench"
            label="Mantenimiento"
            :items="mantenimientoItems"
          />

          <!-- Profile -->
          <NavItem :to="{ name: 'Profile' }" icon="bx-user-circle" label="Mi Perfil" />

          <!-- Help -->
          <NavItem :to="{ name: 'HelpSupport' }" icon="bx-help-circle" label="Ayuda" />
        </div>
      </nav>

      <!-- Logout Button -->
      <div class="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          @click="handleLogout"
          class="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <i class="bx bx-log-out mr-3 text-lg"></i>
          <span class="truncate">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import NavItem from './NavItem.vue'
import NavGroup from './NavGroup.vue'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const bienesItems = computed(() => {
  const items = [{ to: { name: 'BienesList' }, icon: 'bx-list-ul', label: 'Lista de Bienes' }]

  if (authStore.isAdmin) {
    items.push({ to: { name: 'BienCreate' }, icon: 'bx-plus', label: 'Crear Bien' })
    items.push({ to: { name: 'AuditoriaList' }, icon: 'bx-history', label: 'Auditoría' })
  }

  return items
})

const usuariosItems = computed(() => [
  { to: { name: 'UsuariosList' }, icon: 'bx-group', label: 'Lista de Usuarios' },
])

const configuracionItems = computed(() => {
  const items = [{ to: { name: 'UbicacionesList' }, icon: 'bx-map', label: 'Ubicaciones' }]

  if (authStore.isAdmin) {
    items.push(
      { to: { name: 'CategoriasList' }, icon: 'bx-category', label: 'Categorías' },
      { to: { name: 'PeriodosList' }, icon: 'bx-calendar', label: 'Períodos' },
      { to: { name: 'AlertasList' }, icon: 'bx-bell', label: 'Alertas' },
      { to: { name: 'SystemSettings' }, icon: 'bx-cog', label: 'Sistema' }
    )
  }

  return items
})

const reportesItems = computed(() => [
  { to: { name: 'Reportes' }, icon: 'bx-file-blank', label: 'Generar Reportes' },
  { to: { name: 'ImportExport' }, icon: 'bx-transfer', label: 'Importar/Exportar' },
  { to: { name: 'SystemLogs' }, icon: 'bx-list-ul', label: 'Logs del Sistema' },
])

const mantenimientoItems = computed(() => [
  { to: { name: 'MantenimientosList' }, icon: 'bx-wrench', label: 'Mantenimientos' },
  { to: { name: 'DocumentosList' }, icon: 'bx-file', label: 'Documentos' },
  { to: { name: 'AsignacionesList' }, icon: 'bx-user-pin', label: 'Asignaciones' },
])

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
