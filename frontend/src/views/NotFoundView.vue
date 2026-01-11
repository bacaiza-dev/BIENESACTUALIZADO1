<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors duration-300"
  >
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <h2 class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Página no encontrada</h2>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Lo sentimos, la página que buscas no existe.
        </p>
      </div>

      <div class="space-y-4">
        <button
          @click="goBack"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Volver atrás
        </button>

        <router-link
          :to="{ name: isAdmin ? 'Dashboard' : 'DashboardUser' }"
          class="block w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Ir al Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)

const goBack = () => {
  router.go(-1)
}
</script>
