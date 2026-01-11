<template>
  <div class="p-6 border-b border-gray-200 dark:border-gray-700">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <!-- Título y descripción -->
      <div>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
        <p v-if="description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ description }}
        </p>
      </div>

      <!-- Acciones del header -->
      <div class="flex flex-col sm:flex-row gap-2">
        <slot name="header-actions" />
      </div>
    </div>

    <!-- Búsqueda global y filtros -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <!-- Búsqueda global -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="bx bx-search text-gray-400"></i>
        </div>
        <input
          :value="searchTerm"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @input="$emit('update:searchTerm', $event.target.value)"
        />
        <div v-if="searchTerm" class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            @click="$emit('clear-search')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i class="bx bx-x text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Filtros personalizados -->
      <slot name="filters" />

      <!-- Selector de items por página -->
      <div class="md:col-start-3 lg:col-start-4">
        <select
          :value="pageSize"
          @change="$emit('update:pageSize', Number($event.target.value))"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option v-for="size in pageSizes" :key="size" :value="size">
            {{ size }} por página
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
  searchTerm: string
  searchPlaceholder?: string
  pageSize: number
  pageSizes?: number[]
}

defineProps<Props>()

defineEmits<{
  'update:searchTerm': [value: string]
  'update:pageSize': [value: number]
  'clear-search': []
}>()
</script>