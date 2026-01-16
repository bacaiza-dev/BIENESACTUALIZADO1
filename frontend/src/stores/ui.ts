import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isDarkMode = ref(false)
  const sidebarOpen = ref(false)
  const sidebarCollapsed = ref(false)
  const loading = ref(false)
  interface NotificationItem {
    id: number
    timestamp: Date
    read: boolean
    title: string
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
  }

  const notifications = ref<NotificationItem[]>([])

  const theme = computed(() => (isDarkMode.value ? 'dark' : 'light'))

  const toggleDarkMode = () => {
    if (isSystemPreference.value) {
      // Si está usando preferencia del sistema, cambiar a manual
      isSystemPreference.value = false
      isDarkMode.value = !systemPrefersDark.value
    } else {
      // Si está en modo manual, cambiar el tema
      isDarkMode.value = !isDarkMode.value
    }
    localStorage.setItem('use-system-theme', JSON.stringify(isSystemPreference.value))
    updateTheme()
  }

  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value
    updateTheme()
  }

  const updateTheme = () => {
    const html = document.documentElement
    if (isDarkMode.value) {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  }

  const isSystemPreference = ref(true)
  const systemPrefersDark = ref(false)

  const currentTheme = computed(() => {
    if (isSystemPreference.value) {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return isDarkMode.value ? 'dark' : 'light'
  })

  const initializeTheme = () => {
    // Detectar preferencia del sistema
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches

      // Escuchar cambios en la preferencia del sistema
      mediaQuery.addEventListener('change', e => {
        systemPrefersDark.value = e.matches
        if (isSystemPreference.value) {
          updateTheme()
        }
      })
    }

    // Cargar configuración guardada
    const savedTheme = localStorage.getItem('theme')
    const savedSystemPref = localStorage.getItem('use-system-theme')

    if (savedSystemPref !== null) {
      isSystemPreference.value = JSON.parse(savedSystemPref)
    }

    if (savedTheme && !isSystemPreference.value) {
      setDarkMode(savedTheme === 'dark')
    } else if (isSystemPreference.value) {
      setDarkMode(systemPrefersDark.value)
    }
  }

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const initializeSidebar = () => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) {
        sidebarCollapsed.value = JSON.parse(saved)
      }
    } catch {
      // ignore
    }
  }

  const toggleSidebarCollapsed = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed.value))
  }

  const setSidebarCollapsed = (value: boolean) => {
    sidebarCollapsed.value = value
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed.value))
  }

  const closeSidebar = () => {
    sidebarOpen.value = false
  }

  const openSidebar = () => {
    sidebarOpen.value = true
  }

  const setLoading = (value: boolean) => {
    loading.value = value
    
    // Safety mechanism: automatically turn off loading after 5 seconds
    if (value) {
      setTimeout(() => {
        if (loading.value) {
          loading.value = false
        }
      }, 5000)
    }
  }

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    notifications.value.push({
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification,
    })
  }

  const removeNotification = (id: number) => {
    const index = notifications.value.findIndex((n: NotificationItem) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const markAsRead = (id: number) => {
    const notification = notifications.value.find((n: NotificationItem) => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach((n: NotificationItem) => (n.read = true))
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const unreadCount = computed(() => notifications.value.filter((n: NotificationItem) => !n.read).length)

  // Métodos adicionales para compatibilidad con theme.js
  const setTheme = (themeName: 'dark' | 'light') => {
    isSystemPreference.value = false
    setDarkMode(themeName === 'dark')
    localStorage.setItem('use-system-theme', 'false')
  }

  const useSystemPreference = () => {
    isSystemPreference.value = true
    setDarkMode(systemPrefersDark.value)
    localStorage.setItem('use-system-theme', 'true')
    localStorage.removeItem('theme')
  }

  const themeIcon = computed(() => {
    return currentTheme.value === 'dark' ? '🌙' : '☀️'
  })

  const themeName = computed(() => {
    return currentTheme.value === 'dark' ? 'Modo Oscuro' : 'Modo Claro'
  })

  return {
    // State
    isDarkMode,
    isSystemPreference,
    systemPrefersDark,
    sidebarOpen,
    sidebarCollapsed,
    loading,
    notifications,

    // Getters
    theme,
    currentTheme,
    themeIcon,
    themeName,
    unreadCount,

    // Actions - Theme
    toggleDarkMode,
    setDarkMode,
    setTheme,
    useSystemPreference,
    initializeTheme,
    
    // Actions - UI
    toggleSidebar,
    initializeSidebar,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    closeSidebar,
    openSidebar,
    setLoading,
    
    // Actions - Notifications
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  }
})

// Composables de compatibilidad con theme.js
export const useTheme = () => {
  const uiStore = useUIStore()
  return {
    // Estado
    isDarkMode: uiStore.isDarkMode,
    isSystemPreference: uiStore.isSystemPreference,
    systemPrefersDark: uiStore.systemPrefersDark,
    currentTheme: uiStore.currentTheme,
    themeIcon: uiStore.themeIcon,
    themeName: uiStore.themeName,
    
    // Métodos
    initializeTheme: uiStore.initializeTheme,
    toggleTheme: uiStore.toggleDarkMode,
    setTheme: uiStore.setTheme,
    useSystemPreference: uiStore.useSystemPreference,
    resetToSystem: uiStore.useSystemPreference,
  }
}

export const useThemeStore = useUIStore
