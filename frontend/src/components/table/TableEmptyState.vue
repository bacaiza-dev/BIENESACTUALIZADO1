<template>
  <div class="p-12 text-center">
    <div class="mx-auto w-24 h-24 text-gray-400 dark:text-gray-600 mb-4">
      <slot name="icon">
        <i class="bx bx-data text-6xl"></i>
      </slot>
    </div>
    
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {{ title }}
    </h3>
    
    <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {{ description }}
    </p>
    
    <div v-if="showAction" class="space-y-3">
      <slot name="action">
        <button
          @click="$emit('create')"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i class="bx bx-plus mr-2"></i>
          {{ actionText }}
        </button>
      </slot>
      
      <div v-if="showClearFilters">
        <button
          @click="$emit('clear-filters')"
          class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  actionText?: string
  showAction?: boolean
  showClearFilters?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'No hay datos disponibles',
  description: 'No se encontraron elementos para mostrar.',
  actionText: 'Crear nuevo',
  showAction: true,
  showClearFilters: false
})

defineEmits<{
  create: []
  'clear-filters': []
}>()
</script>