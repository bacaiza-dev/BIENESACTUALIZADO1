<template>
  <div class="md:hidden">
    <div class="space-y-4">
      <div
        v-for="(item, index) in items"
        :key="getItemId(item, index)"
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
      >
        <!-- Checkbox móvil -->
        <div v-if="selectable" class="flex items-center justify-between mb-3">
          <input
            type="checkbox"
            :checked="selectedItems.includes(getItemId(item, index))"
            @change="$emit('toggle-select-item', getItemId(item, index))"
            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <div v-if="showQR" class="ml-auto">
            <slot name="qr" :item="item">
              <button
                @click="$emit('generate-qr', item)"
                class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                title="Generar QR"
              >
                <i class="bx bx-qr text-lg"></i>
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
}

defineProps<Props>()

defineEmits<{
  'toggle-select-item': [id: any]
  'generate-qr': [item: any]
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