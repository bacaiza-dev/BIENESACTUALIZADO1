<template>
  <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between h-16 px-4 lg:px-6">
      <!-- Mobile menu button -->
      <button
        @click="uiStore.toggleSidebar"
        class="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 min-h-[44px] min-w-[44px] touch-manipulation"
      >
        <i class="bx bx-menu text-xl"></i>
      </button>

      <!-- Page title -->
      <div class="flex-1 lg:flex-none">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white">
          {{ pageTitle }}
        </h1>
      </div>

      <!-- Right side controls -->
      <div class="flex items-center space-x-4">
        <!-- Search -->
        <div class="hidden md:block">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar... (Ctrl+K)"
              class="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              @keydown.enter="handleSearch"
            />
            <i
              class="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            ></i>
          </div>
        </div>

        <!-- QR Scanner button (mobile only) -->
        <button
          v-if="shouldShowQRScanner"
          @click="$router.push('/qr-scanner')"
          class="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 hover:scale-105 min-h-[44px] min-w-[44px] touch-manipulation"
          title="Scanner QR"
        >
          <i class="bx bx-qr-scan text-xl"></i>
        </button>

        <!-- Mobile search button -->
        <button
          @click="showMobileSearch = !showMobileSearch"
          class="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <i class="bx bx-search text-xl"></i>
        </button>

        <!-- Theme toggle -->
        <button
          @click="uiStore.toggleDarkMode"
          class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-h-[44px] min-w-[44px] touch-manipulation"
          title="Alternar modo oscuro (Ctrl+Shift+D)"
        >
          <i :class="['bx text-xl', uiStore.isDarkMode ? 'bx-sun' : 'bx-moon']"></i>
        </button>

        <!-- Notifications -->
        <div class="relative">
          <button
            @click="toggleNotifications"
            class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 relative min-h-[44px] min-w-[44px] touch-manipulation"
          >
            <i class="bx bx-bell text-xl"></i>
            <span
              v-if="uiStore.unreadCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ uiStore.unreadCount > 9 ? '9+' : uiStore.unreadCount }}
            </span>
          </button>

          <!-- Notifications dropdown -->
          <div
            v-if="showNotifications"
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-200 origin-top-right"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
            </div>

            <div class="max-h-96 overflow-y-auto">
              <div
                v-if="uiStore.notifications.length === 0"
                class="p-4 text-center text-gray-500 dark:text-gray-400"
              >
                No hay notificaciones
              </div>

              <div
                v-for="notification in uiStore.notifications"
                :key="notification.id"
                class="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                :class="{ 'bg-blue-50 dark:bg-blue-900/20': !notification.read }"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <i :class="['bx text-lg', getNotificationIcon(notification.type)]"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ notification.title }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ notification.message }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {{ formatDate(notification.timestamp) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="uiStore.notifications.length > 0"
              class="p-3 border-t border-gray-200 dark:border-gray-700"
            >
              <button
                @click="uiStore.markAllAsRead"
                class="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Marcar todas como leídas
              </button>
            </div>
          </div>
        </div>

        <!-- User menu -->
        <div class="relative">
          <button
            @click="toggleUserMenu"
            class="flex items-center space-x-2 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
          >
            <img :src="userAvatar" :alt="authStore.user?.nombre" class="w-8 h-8 rounded-full" />
            <span class="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ authStore.user?.nombre }}
            </span>
            <i class="bx bx-chevron-down text-sm"></i>
          </button>

          <!-- User dropdown -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 transform transition-all duration-200 origin-top-right"
          >
            <div class="p-2">
              <router-link
                :to="{ name: 'Profile' }"
                class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <i class="bx bx-user mr-3"></i>
                Mi Perfil
              </router-link>

              <router-link
                :to="{ name: 'HelpSupport' }"
                class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <i class="bx bx-help-circle mr-3"></i>
                Ayuda
              </router-link>

              <hr class="my-2 border-gray-200 dark:border-gray-700" />

              <button
                @click="handleLogout"
                class="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
              >
                <i class="bx bx-log-out mr-3"></i>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { useDevice } from '@/composables/useDevice'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()
const authStore = useAuthStore()
const { isMobile, isTablet, isAndroid, isIOS } = useDevice()

const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)
const showMobileSearch = ref(false)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    Dashboard: 'Dashboard',
    DashboardUser: 'Mi Dashboard',
    BienesList: 'Bienes',
    BienDetail: 'Detalle del Bien',
    BienCreate: 'Crear Bien',
    BienEdit: 'Editar Bien',
    UsuariosList: 'Usuarios',
    Profile: 'Mi Perfil',
    UbicacionesList: 'Ubicaciones',
    CategoriasList: 'Categorías',
    PeriodosList: 'Períodos Académicos',
    AlertasList: 'Alertas',
    MantenimientosList: 'Mantenimientos',
    AuditoriaList: 'Auditoría',
    ImportExport: 'Importar/Exportar',
    Reportes: 'Reportes',
    DocumentosList: 'Documentos',
    AsignacionesList: 'Asignaciones',
    HelpSupport: 'Ayuda y Soporte',
    SystemSettings: 'Configuración del Sistema',
    SystemLogs: 'Logs del Sistema',
    QRScanner: 'Scanner QR',
  }

  return titles[route.name as string] || 'Sistema de Bienes'
})

// Mostrar botón QR scanner solo en dispositivos móviles Android/iOS
const shouldShowQRScanner = computed(() => {
  return (isMobile.value || isTablet.value) && (isAndroid.value || isIOS.value) && authStore.isAuthenticated
})

const userAvatar = computed(() => {
  return `https://ui-avatars.com/api/?name=${authStore.user?.nombre || 'Usuario'}&background=dc2626&color=fff&size=32`
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'BienesList',
      query: { search: searchQuery.value },
    })
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    info: 'bx-info-circle text-blue-500',
    warning: 'bx-error-circle text-yellow-500',
    error: 'bx-x-circle text-red-500',
    success: 'bx-check-circle text-green-500',
  }
  return icons[type] || 'bx-bell text-gray-500'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+K for search
  if (event.ctrlKey && event.key === 'k') {
    event.preventDefault()
    const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }

  // Ctrl+/ for sidebar toggle
  if (event.ctrlKey && event.key === '/') {
    event.preventDefault()
    uiStore.toggleSidebar()
  }

  // Ctrl+Shift+D for dark mode toggle
  if (event.ctrlKey && event.shiftKey && event.key === 'D') {
    event.preventDefault()
    uiStore.toggleDarkMode()
  }

  // Esc to close dropdowns
  if (event.key === 'Escape') {
    showNotifications.value = false
    showUserMenu.value = false
  }
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showNotifications.value = false
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleClickOutside)
})
</script>
