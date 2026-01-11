<template>
  <div class="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <!-- Información de resultados -->
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <span v-if="filteredTotal > 0">
          Mostrando {{ startIndex }} - {{ endIndex }} de {{ filteredTotal }} resultados
          <span v-if="filteredTotal !== total">({{ total }} totales)</span>
        </span>
        <span v-else>
          No se encontraron resultados
        </span>
      </div>

      <!-- Controles de paginación -->
      <div v-if="totalPages > 1" class="flex items-center space-x-2">
        <!-- Botón anterior -->
        <button
          :disabled="currentPage === 1"
          @click="$emit('page-change', currentPage - 1)"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            currentPage === 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          <i class="bx bx-chevron-left"></i>
          Anterior
        </button>

        <!-- Números de página -->
        <div class="flex items-center space-x-1">
          <!-- Primera página -->
          <button
            v-if="showFirstPage"
            @click="$emit('page-change', 1)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              currentPage === 1
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            1
          </button>

          <!-- Puntos suspensivos izquierda -->
          <span v-if="showLeftEllipsis" class="px-2 text-gray-500">...</span>

          <!-- Páginas centrales -->
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="$emit('page-change', page)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            {{ page }}
          </button>

          <!-- Puntos suspensivos derecha -->
          <span v-if="showRightEllipsis" class="px-2 text-gray-500">...</span>

          <!-- Última página -->
          <button
            v-if="showLastPage"
            @click="$emit('page-change', totalPages)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              currentPage === totalPages
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            {{ totalPages }}
          </button>
        </div>

        <!-- Botón siguiente -->
        <button
          :disabled="currentPage === totalPages"
          @click="$emit('page-change', currentPage + 1)"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            currentPage === totalPages
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          ]"
        >
          Siguiente
          <i class="bx bx-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Acciones seleccionadas -->
    <div v-if="selectedCount > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ selectedCount }} elemento{{ selectedCount > 1 ? 's' : '' }} seleccionado{{ selectedCount > 1 ? 's' : '' }}
        </span>
        <div class="flex items-center space-x-2">
          <slot name="bulk-actions">
            <button
              @click="$emit('bulk-delete')"
              class="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            >
              <i class="bx bx-trash mr-1"></i>
              Eliminar seleccionados
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  filteredTotal: number
  selectedCount?: number
}

const props = defineProps<Props>()

defineEmits<{
  'page-change': [page: number]
  'bulk-delete': []
}>()

// Cálculos de paginación
const startIndex = computed(() => {
  return props.filteredTotal > 0 ? (props.currentPage - 1) * props.pageSize + 1 : 0
})

const endIndex = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.filteredTotal)
})

// Lógica de páginas visibles
const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  const half = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(props.totalPages, start + maxVisible - 1)
  
  // Ajustar el inicio si estamos cerca del final
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  // No mostrar primera y última página en el rango central
  if (start === 1) start = 2
  if (end === props.totalPages) end = props.totalPages - 1
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const showFirstPage = computed(() => {
  return props.totalPages > 1 && !visiblePages.value.includes(1)
})

const showLastPage = computed(() => {
  return props.totalPages > 1 && !visiblePages.value.includes(props.totalPages)
})

const showLeftEllipsis = computed(() => {
  return showFirstPage.value && visiblePages.value[0] > 2
})

const showRightEllipsis = computed(() => {
  return showLastPage.value && visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 1
})
</script>