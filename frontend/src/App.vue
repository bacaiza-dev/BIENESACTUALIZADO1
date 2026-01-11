<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Loading global -->
    <AnimacionCarga v-if="uiStore.loading" />

    <!-- Layout dinámico basado en autenticación -->
    <component :is="currentLayout">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <Suspense>
            <component :is="Component" v-if="Component" />
            <template #fallback>
              <div class="flex items-center justify-center min-h-screen">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            </template>
          </Suspense>
        </transition>
      </router-view>
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import AppLayout from '@/components/layout/AppLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import PublicLayout from '@/components/layout/PublicLayout.vue'
import AnimacionCarga from '@/views/carga/AnimacionCarga.vue'

const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUIStore()

// Determinar el layout a usar
const currentLayout = computed(() => {
  // Usar layout público para rutas públicas
  if (route.meta.layout === 'public') {
    return PublicLayout
  }

  // Usar layout de autenticación para rutas de login
  if (route.meta.layout === 'auth' || route.name === 'Login' || (!authStore.isAuthenticated && route.meta.requiresAuth !== false)) {
    return AuthLayout
  }

  // Usar layout principal para rutas autenticadas
  return AppLayout
})

// Inicializar la aplicación
onMounted(async () => {
  // Inicializar tema
  uiStore.initializeTheme()

  // Inicializar autenticación
  try {
    await authStore.initializeAuth()
  } catch (error) {
    console.error('Error initializing auth:', error)
  } finally {
    // Asegurar que el loading se apague después de la inicialización
    setTimeout(() => {
      uiStore.setLoading(false)
    }, 1000)
  }
})

// Remover watch innecesario
</script>

<style>
/* Importar Tailwind CSS */
@import '@/assets/styles/main.css';

/* Transiciones de página */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 dark:bg-gray-600 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-primary-600;
}

/* Utilidades globales */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Capacitor status bar padding */
.capacitor-app {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

/* iOS safe area */
@supports (padding: max(0px)) {
  .ios-safe-area {
    padding-top: max(env(safe-area-inset-top), 24px);
    padding-bottom: max(env(safe-area-inset-bottom), 24px);
  }
}

/* Fuentes optimizadas */
body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Prevenir zoom en iOS */
input,
textarea,
select {
  font-size: 16px;
}

/* Optimizaciones para móviles */
@media (max-width: 768px) {

  /* Mejorar rendimiento táctil */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
  }

  /* Optimizar scrolling */
  .scrollable {
    -webkit-overflow-scrolling: touch;
  }
}

/* Animaciones de carga */
@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.loading-skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
