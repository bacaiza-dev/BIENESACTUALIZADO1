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
import { computed, onMounted } from 'vue'
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
  uiStore.initializeSidebar()

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

<style src="./App.style.css"></style>
