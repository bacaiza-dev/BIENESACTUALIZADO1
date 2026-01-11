<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
    <!-- Header de la tabla -->
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
          <slot name="header-actions"></slot>
        </div>
      </div>

      <!-- Búsqueda global y filtros -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Búsqueda global -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            v-model="searchTermLocal"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            @input="debouncedSearch"
          />
          <div v-if="searchTermLocal" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              @click="clearSearch"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Filtros personalizados -->
        <slot name="filters"></slot>

        <!-- Selector de items por página -->
        <div class="md:col-start-3 lg:col-start-4">
          <select
            v-model="pageSizeLocal"
            @change="updatePageSize"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option v-for="size in pageSizes" :key="size" :value="size">
              {{ size }} por página
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-8 text-center">
      <div class="flex items-center justify-center space-x-2">
        <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-gray-600 dark:text-gray-400">Cargando datos...</span>
      </div>
    </div>

    <!-- Vista móvil -->
    <div v-else class="md:hidden">
      <div class="space-y-4">
        <div
          v-for="(item, index) in paginatedData"
          :key="getItemId(item, index)"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <!-- Checkbox móvil -->
          <div v-if="selectable" class="flex items-center justify-between mb-3">
            <input
              type="checkbox"
              :checked="selectedItems.includes(getItemId(item, index))"
              @change="toggleSelectItem(getItemId(item, index))"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <div v-if="showQR" class="ml-auto">
              <slot name="qr" :item="item">
                <button
                  @click="showQRModal(item)"
                  class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all duration-200 transform hover:scale-110 min-h-[44px] min-w-[44px]"
                  title="Ver código QR"
                >
                  <i class="bx bx-qr text-xl"></i>
                </button>
              </slot>
            </div>
          </div>

          <!-- Contenido de la card -->
          <div class="space-y-2">
            <div
              v-for="column in columns"
              :key="column.key"
              class="flex justify-between items-start"
            >
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-0 flex-shrink-0 mr-2">
                {{ column.label }}:
              </span>
              <div class="text-sm text-gray-900 dark:text-white text-right min-w-0">
                <slot :name="`cell-${column.key}`" :value="getNestedValue(item, column.key)" :item="item">
                  {{ formatValue(getNestedValue(item, column.key), column) }}
                </slot>
              </div>
            </div>
          </div>

          <!-- Acciones móviles -->
          <div v-if="hasActions" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-end space-x-2">
              <slot name="actions" :item="item">
                <button
                  @click="$emit('edit', item)"
                  class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                  title="Editar"
                >
                  <i class="bx bx-edit text-lg"></i>
                </button>
                <button
                  @click="$emit('delete', item)"
                  class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                  title="Eliminar"
                >
                  <i class="bx bx-trash text-lg"></i>
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla desktop -->
    <div v-else class="hidden md:block overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <!-- Checkbox para seleccionar todos -->
            <th v-if="selectable" class="w-12 px-6 py-4">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </th>

            <!-- Columnas -->
            <th
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
                column.sortable
                  ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600'
                  : '',
              ]"
              @click="column.sortable ? handleSort(column.key) : null"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <div v-if="column.sortable" class="flex flex-col">
                  <svg
                    :class="[
                      'h-3 w-3',
                      sortBy === column.key && sortOrder === 'asc'
                        ? 'text-blue-600'
                        : 'text-gray-400',
                    ]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 10l5-5 5 5H5z" />
                  </svg>
                  <svg
                    :class="[
                      'h-3 w-3 -mt-1',
                      sortBy === column.key && sortOrder === 'desc'
                        ? 'text-blue-600'
                        : 'text-gray-400',
                    ]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M15 10l-5 5-5-5h10z" />
                  </svg>
                </div>
              </div>
            </th>

            <!-- Columna QR -->
            <th
              v-if="showQR"
              class="w-20 px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              QR
            </th>

            <!-- Columna de acciones -->
            <th
              v-if="hasActions"
              class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>

        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Estado vacío -->
          <tr v-if="paginatedData.length === 0">
            <td :colspan="totalColumns" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center space-y-4">
                <svg
                  class="h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">No hay datos</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{
                      emptyMessage ||
                      'No se encontraron registros que coincidan con los filtros aplicados.'
                    }}
                  </p>
                </div>
              </div>
            </td>
          </tr>

          <!-- Filas de datos -->
          <tr
            v-for="(item, index) in paginatedData"
            :key="getItemId(item, index)"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            :class="{
              'bg-blue-50 dark:bg-blue-900': selectedItems.includes(getItemId(item, index)),
            }"
          >
            <!-- Checkbox para seleccionar fila -->
            <td v-if="selectable" class="px-6 py-4">
              <input
                type="checkbox"
                :checked="selectedItems.includes(getItemId(item, index))"
                @change="toggleSelectItem(getItemId(item, index))"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </td>

            <!-- Celdas de datos -->
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap"
              :class="column.cellClass"
            >
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getNestedValue(item, column.key)"
                :index="index"
              >
                <span
                  v-if="column.type === 'badge'"
                  :class="getBadgeClass(getNestedValue(item, column.key))"
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ formatValue(getNestedValue(item, column.key), column) }}
                </span>
                <span
                  v-else-if="column.type === 'currency'"
                  class="text-sm text-gray-900 dark:text-white font-medium"
                >
                  ${{ Number(getNestedValue(item, column.key) || 0).toLocaleString() }}
                </span>
                <span
                  v-else-if="column.type === 'date'"
                  class="text-sm text-gray-900 dark:text-white"
                >
                  {{ formatDate(getNestedValue(item, column.key)) }}
                </span>
                <span v-else class="text-sm text-gray-900 dark:text-white">
                  {{ formatValue(getNestedValue(item, column.key), column) }}
                </span>
              </slot>
            </td>

            <!-- Celda QR -->
            <td v-if="showQR" class="px-6 py-4 whitespace-nowrap text-center">
              <button
                @click="showQRModal(item)"
                class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-all duration-200 transform hover:scale-110"
                title="Ver código QR"
              >
                <i class="bx bx-qr text-xl"></i>
              </button>
            </td>

            <!-- Celda de acciones -->
            <td v-if="hasActions" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <slot name="actions" :item="item" :index="index">
                <div class="flex space-x-2">
                  <button
                    @click="$emit('edit', item)"
                    class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                  >
                    Editar
                  </button>
                  <button
                    @click="$emit('view', item)"
                    class="text-green-600 hover:text-green-900 transition-colors duration-200"
                  >
                    Ver
                  </button>
                  <button
                    @click="$emit('delete', item)"
                    class="text-red-600 hover:text-red-900 transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer con paginación e información -->
    <div
      class="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Información de registros -->
        <div class="text-sm text-gray-700 dark:text-gray-300">
          <span v-if="selectedItems.length > 0" class="mr-4">
            {{ selectedItems.length }} seleccionado(s)
          </span>
          Mostrando {{ startRecord }} a {{ endRecord }} de {{ totalItems }} registros
          <span v-if="filteredItems < totalItems" class="text-blue-600 dark:text-blue-400">
            (filtrado de {{ totalItems }} total)
          </span>
        </div>

        <!-- Controles de paginación -->
        <div class="flex items-center space-x-2">
          <!-- Botón primera página -->
          <button
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Primera
          </button>

          <!-- Botón página anterior -->
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Anterior
          </button>

          <!-- Números de página -->
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="page !== '...'"
              @click="goToPage(Number(page))"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-lg',
                page === currentPage
                  ? 'text-white bg-blue-600 border border-blue-600'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
              ]"
            >
              {{ page }}
            </button>
            <span v-else class="px-3 py-2 text-sm text-gray-500"> ... </span>
          </template>

          <!-- Botón página siguiente -->
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Siguiente
          </button>

          <!-- Botón última página -->
          <button
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Última
          </button>
        </div>
      </div>
    </div>

    <!-- Modal QR -->
    <div
      v-if="showQRModalState"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Código QR</h3>
          <button
            @click="closeQRModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="text-center">
          <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-4">
            <canvas
              ref="qrCanvas"
              class="w-48 h-48 mx-auto bg-white rounded-lg border border-gray-200 dark:border-gray-600"
            ></canvas>
          </div>

          <div v-if="qrModalItem" class="space-y-2 text-sm">
            <p class="text-gray-600 dark:text-gray-400">
              <span class="font-medium">Código Institucional:</span>
              {{ qrModalItem?.codigo_institucional }}
            </p>
            <p class="text-gray-600 dark:text-gray-400">
              <span class="font-medium">Código SENESCYT:</span> {{ qrModalItem?.codigo_senescyt }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { debounce } from 'lodash-es'
import QRCode from 'qrcode'
import type { DataTableColumn } from '@/types'

interface Props {
  // Datos
  data: any[]
  columns: DataTableColumn[]

  // Configuración de tabla
  title?: string
  description?: string
  loading?: boolean
  emptyMessage?: string

  // Búsqueda
  searchTerm?: string
  searchPlaceholder?: string

  // Paginación
  pageSize?: number
  pageSizes?: number[]

  // Ordenamiento
  defaultSort?: {
    key: string
    order: 'asc' | 'desc'
  }

  // Funcionalidades
  selectable?: boolean
  showQR?: boolean
  hasActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  title: '',
  description: '',
  loading: false,
  emptyMessage: '',
  searchTerm: '',
  searchPlaceholder: 'Buscar...',
  pageSize: 15,
  pageSizes: () => [10, 15, 25, 50, 100],
  defaultSort: () => ({ key: '', order: 'asc' }),
  selectable: false,
  showQR: false,
  hasActions: true,
})

// Emits
const emit = defineEmits<{
  'update:searchTerm': [value: string]
  'update:pageSize': [value: number]
  sort: [value: { key: string; order: 'asc' | 'desc' }]
  edit: [item: any]
  view: [item: any]
  delete: [item: any]
  'selection-change': [selectedIds: (string | number)[]]
  'generate-qr': [item: any]
}>()

// Estado reactivo
const searchTermLocal = ref(props.searchTerm)
const pageSizeLocal = ref(props.pageSize)
const currentPage = ref(1)
const sortBy = ref(props.defaultSort.key)
const sortOrder = ref<'asc' | 'desc'>(props.defaultSort.order)
const selectedItems = ref<(string | number)[]>([])
const showQRModalState = ref(false)
const qrModalItem = ref<any>(null)

// Búsqueda debounced
const debouncedSearch = debounce(() => {
  emit('update:searchTerm', searchTermLocal.value)
  currentPage.value = 1
}, 300)

// Computadas
const filteredData = computed(() => {
  let filtered = [...props.data]

  // Aplicar búsqueda global
  if (searchTermLocal.value) {
    const term = searchTermLocal.value.toLowerCase()
    filtered = filtered.filter(item => {
      return props.columns.some(column => {
        const value = getNestedValue(item, column.key)
        return String(value).toLowerCase().includes(term)
      })
    })
  }

  // Aplicar ordenamiento
  if (sortBy.value) {
    filtered.sort((a, b) => {
      const aValue = getNestedValue(a, sortBy.value)
      const bValue = getNestedValue(b, sortBy.value)

      let comparison = 0
      if (aValue > bValue) comparison = 1
      if (aValue < bValue) comparison = -1

      return sortOrder.value === 'desc' ? -comparison : comparison
    })
  }

  return filtered
})

const totalItems = computed(() => props.data.length)
const filteredItems = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(filteredItems.value / pageSizeLocal.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSizeLocal.value
  const end = start + pageSizeLocal.value
  return filteredData.value.slice(start, end)
})

const startRecord = computed(() => {
  if (filteredItems.value === 0) return 0
  return (currentPage.value - 1) * pageSizeLocal.value + 1
})

const endRecord = computed(() => {
  const end = currentPage.value * pageSizeLocal.value
  return Math.min(end, filteredItems.value)
})

const totalColumns = computed(() => {
  let count = props.columns.length
  if (props.selectable) count++
  if (props.hasActions) count++
  if (props.showQR) count++
  return count
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }

  return pages
})

const isAllSelected = computed(() => {
  return (
    paginatedData.value.length > 0 &&
    paginatedData.value.every(item => selectedItems.value.includes(getItemId(item)))
  )
})

// Métodos
const getItemId = (item: any, index: number | null = null): string | number => {
  return item.id || item._id || index || 0
}

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current: any, key: string) => current?.[key], obj)
}

const formatValue = (value: any, column: DataTableColumn): string => {
  if (value === null || value === undefined) return ''
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value)
  }
  return String(value)
}

const formatDate = (dateString: any): string => {
  if (!dateString) return ''
  try {
    return new Date(dateString).toLocaleDateString('es-ES')
  } catch {
    return dateString
  }
}

const getBadgeClass = (value: any): string => {
  // Clases predefinidas para badges comunes
  const badgeClasses: Record<string, string> = {
    // Estados generales
    activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',

    // Estados de bienes
    excelente: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    bueno: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    regular: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    malo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',

    // Tipos de mantenimiento
    preventivo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    correctivo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    emergencia: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  const lowerValue = String(value).toLowerCase()
  return badgeClasses[lowerValue] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const handleSort = (key: string): void => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }

  emit('sort', { key: sortBy.value, order: sortOrder.value })
}

const clearSearch = (): void => {
  searchTermLocal.value = ''
  emit('update:searchTerm', '')
  currentPage.value = 1
}

const updatePageSize = (): void => {
  emit('update:pageSize', pageSizeLocal.value)
  currentPage.value = 1
}

const goToPage = (page: number): void => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const previousPage = (): void => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = (): void => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const toggleSelectAll = (): void => {
  if (isAllSelected.value) {
    selectedItems.value = selectedItems.value.filter(
      id => !paginatedData.value.some(item => getItemId(item) === id)
    )
  } else {
    paginatedData.value.forEach(item => {
      const id = getItemId(item)
      if (!selectedItems.value.includes(id)) {
        selectedItems.value.push(id)
      }
    })
  }

  emit('selection-change', selectedItems.value)
}

const toggleSelectItem = (id: string | number): void => {
  const index = selectedItems.value.indexOf(id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(id)
  }

  emit('selection-change', selectedItems.value)
}

const showQRModal = async (item: any): Promise<void> => {
  qrModalItem.value = item
  showQRModalState.value = true
  
  // Generar QR cuando se abre el modal
  await nextTick()
  await generateQRCode(item)
}

const generateQRCode = async (item: any): Promise<void> => {
  const canvas = (props as any).$refs?.qrCanvas || document.querySelector('canvas')
  if (!canvas || !item) return
  
  try {
    // Crear información completa del bien para el QR
    const qrData = {
      id: item.id,
      codigo: item.codigo_institucional || item.codigo,
      nombre: item.nombre || item.clase_de_bien,
      categoria: item.categoria_nombre || 'No especificada',
      ubicacion: item.ubicacion_nombre || 'No asignada', 
      estado: item.estado || 'No definido',
      url: `${window.location.origin}/bienes/${item.id}`,
      timestamp: new Date().toISOString(),
      sistema: 'Instituto Nelson Torres'
    }
    
    const qrString = JSON.stringify(qrData)
    
    await QRCode.toCanvas(canvas, qrString, {
      width: 192,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
  }
}

const closeQRModal = (): void => {
  showQRModalState.value = false
  qrModalItem.value = null
}

// Watchers
watch(
  () => props.searchTerm,
  newValue => {
    searchTermLocal.value = newValue
  }
)

watch([showQRModalState, qrModalItem], async ([modalVisible, item]) => {
  if (modalVisible && item) {
    await nextTick()
    await generateQRCode(item)
  }
})

watch(
  () => props.pageSize,
  newValue => {
    pageSizeLocal.value = newValue
  }
)

watch(
  () => filteredItems.value,
  () => {
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  }
)

// Lifecycle
onMounted(() => {
  if (props.defaultSort.key) {
    sortBy.value = props.defaultSort.key
    sortOrder.value = props.defaultSort.order
  }
})
</script>
