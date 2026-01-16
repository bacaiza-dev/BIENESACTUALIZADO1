<template>
  <div class="p-8 text-center">
    <div class="flex items-center justify-center space-x-3">
      <div 
        :class="[
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
        ]"
      ></div>
      <span class="text-gray-600 dark:text-gray-400">{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  message: 'Cargando datos...',
  size: 'md'
})
</script>