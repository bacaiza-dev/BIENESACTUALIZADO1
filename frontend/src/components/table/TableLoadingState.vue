<template>
  <div class="p-8 text-center">
    <div class="flex items-center justify-center space-x-2">
      <LoadingSpinner :size="size" />
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