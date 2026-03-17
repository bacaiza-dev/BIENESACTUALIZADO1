<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 transition-all duration-300">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <img src="@/assets/LogoINT.png" alt="Instituto Nelson Torres" class="mx-auto h-16 w-auto" />
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Sistema de Bienes</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Instituto Nelson Torres</p>
      </div>

      <!-- Form Container -->
      <div
        class="bg-white dark:bg-gray-800 py-8 px-6 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-105">
        <slot />
      </div>

      <!-- Theme Toggle -->
      <div class="text-center">
        <button @click="uiStore.toggleDarkMode"
          class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg transition-all duration-200 hover:scale-105"
          title="Alternar modo oscuro">
          <i :class="['bx text-lg', uiStore.isDarkMode ? 'bx-sun' : 'bx-moon']"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

onMounted(() => {
  uiStore.initializeTheme()
})
</script>
