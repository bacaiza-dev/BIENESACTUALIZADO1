<template>
  <div class="hidden md:block overflow-x-auto">
    <table class="w-full">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <!-- Checkbox para seleccionar todos -->
          <th v-if="selectable" class="w-12 px-6 py-4">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="$emit('toggle-select-all')"
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
                : ''
            ]"
            @click="column.sortable && $emit('sort', column.key)"
          >
            <div class="flex items-center space-x-1">
              <span>{{ column.label }}</span>
              <div v-if="column.sortable" class="flex flex-col">
                <i
                  :class="[
                    'bx bx-chevron-up text-xs',
                    sortColumn === column.key && sortDirection === 'asc'
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  ]"
                ></i>
                <i
                  :class="[
                    'bx bx-chevron-down text-xs -mt-1',
                    sortColumn === column.key && sortDirection === 'desc'
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  ]"
                ></i>
              </div>
            </div>
          </th>

          <!-- Columna QR -->
          <th v-if="showQR" class="w-16 px-6 py-4 text-center">
            <i class="bx bx-qr text-lg text-gray-500 dark:text-gray-300"></i>
          </th>

          <!-- Columna de acciones -->
          <th v-if="hasActions" class="w-32 px-6 py-4 text-center">
            Acciones
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="(item, index) in items"
          :key="getItemId(item, index)"
          class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <!-- Checkbox para seleccionar item -->
          <td v-if="selectable" class="px-6 py-4">
            <input
              type="checkbox"
              :checked="selectedItems.includes(getItemId(item, index))"
              @change="$emit('toggle-select-item', getItemId(item, index))"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </td>

          <!-- Celdas de datos -->
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
          >
            <slot :name="`cell-${column.key}`" :value="getNestedValue(item, column.key)" :item="item">
              {{ formatValue(getNestedValue(item, column.key), column) }}
            </slot>
          </td>

          <!-- Celda QR -->
          <td v-if="showQR" class="px-6 py-4 text-center">
            <slot name="qr" :item="item">
              <button
                @click="$emit('generate-qr', item)"
                class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                title="Generar QR"
              >
                <i class="bx bx-qr text-lg"></i>
              </button>
            </slot>
          </td>

          <!-- Celda de acciones -->
          <td v-if="hasActions" class="px-6 py-4 text-center">
            <div class="flex items-center justify-center space-x-2">
              <slot name="actions" :item="item">
                <button
                  @click="$emit('edit', item)"
                  class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  title="Editar"
                >
                  <i class="bx bx-edit text-lg"></i>
                </button>
                <button
                  @click="$emit('delete', item)"
                  class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <i class="bx bx-trash text-lg"></i>
                </button>
              </slot>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  sortable?: boolean
  type?: string
  format?: string
}

interface Props {
  items: any[]
  columns: Column[]
  selectable?: boolean
  selectedItems: any[]
  showQR?: boolean
  hasActions?: boolean
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  isAllSelected: boolean
}

defineProps<Props>()

defineEmits<{
  'toggle-select-item': [id: any]
  'toggle-select-all': []
  'generate-qr': [item: any]
  sort: [column: string]
  edit: [item: any]
  delete: [item: any]
}>()

// Utils
const getItemId = (item: any, index: number) => {
  return item.id || item.id_bien || item.id_usuario || item.id_categoria || index
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const formatValue = (value: any, column: Column) => {
  if (value === null || value === undefined) return '-'
  
  switch (column.type) {
    case 'currency':
      return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    case 'date':
      return new Date(value).toLocaleDateString('es-EC')
    case 'boolean':
      return value ? 'Sí' : 'No'
    default:
      return String(value)
  }
}
</script>