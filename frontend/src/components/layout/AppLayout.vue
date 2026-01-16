<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Navigation Sidebar -->
    <AppSidebar />

    <!-- Main Content -->
    <div :class="['transition-all duration-300', uiStore.sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64']">
      <!-- Top Header -->
      <AppHeader />

      <!-- Page Content -->
      <main class="p-4 lg:p-6">
        <router-view />
      </main>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="uiStore.loading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        <span class="text-gray-700 dark:text-gray-300">Cargando...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const uiStore = useUIStore()
const authStore = useAuthStore()

onMounted(() => {
  // Initialize theme only if not already initialized
  if (!document.documentElement.hasAttribute('data-theme')) {
    uiStore.initializeTheme()
  }
})
</script>
