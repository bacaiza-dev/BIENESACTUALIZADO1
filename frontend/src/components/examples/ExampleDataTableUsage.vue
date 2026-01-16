<template>
  <div class="p-6">
    <DataTable
      title="Lista de Bienes"
      description="Gestión completa de bienes institucionales"
      :data="paginatedData"
      :columns="columns"
      :loading="state.loading"
      :total="total"
      :search-term="state.searchTerm"
      :current-page="state.currentPage"
      :page-size="state.pageSize"
      :sort-column="state.sortColumn"
      :sort-direction="state.sortDirection"
      :selected-items="state.selectedItems"
      :server-side="false"
      :selectable="true"
      :show-q-r="true"
      :has-actions="true"
      search-placeholder="Buscar bienes..."
      empty-title="No hay bienes registrados"
      empty-description="Comienza agregando tu primer bien institucional"
      empty-action-text="Agregar Bien"
      @update:search-term="setSearch"
      @update:current-page="setPage"
      @update:page-size="setPageSize"
      @update:selected-items="(items: any[]) => (state.selectedItems = items)"
      @sort="sort"
      @edit="handleEdit"
      @delete="handleDelete"
      @generate-qr="handleGenerateQR"
      @create="handleCreate"
      @bulk-delete="handleBulkDelete"
    >
      <template #header-actions>
        <button
          @click="handleImport"
          class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
        >
          <i class="bx bx-import"></i>
          <span>Importar</span>
        </button>
        <button
          @click="handleExport"
          class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <i class="bx bx-export"></i>
          <span>Exportar</span>
        </button>
      </template>

      <template #filters>
        <select
          v-model="selectedCategory"
          @change="applyFilters"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todas las categorías</option>
          <option value="equipos">Equipos</option>
          <option value="mobiliario">Mobiliario</option>
          <option value="tecnologia">Tecnología</option>
        </select>

        <select
          v-model="selectedStatus"
          @change="applyFilters"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
      </template>

      <!-- Custom cell renderers -->
      <template #cell-valor="{ value }">
        <span class="font-medium text-green-600 dark:text-green-400">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <template #cell-estado="{ value }">
        <span
          :class="[
            'inline-flex px-2 py-1 text-xs font-medium rounded-full',
            getStatusClass(value)
          ]"
        >
          {{ getStatusLabel(value) }}
        </span>
      </template>

      <template #cell-categoria="{ value }">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ value?.nombre || '-' }}
        </span>
      </template>

      <!-- Custom actions -->
      <template #actions="{ item }">
        <button
          @click="handleView(item)"
          class="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Ver detalles"
        >
          <i class="bx bx-show text-lg"></i>
        </button>
        <button
          @click="handleEdit(item)"
          class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
          title="Editar"
        >
          <i class="bx bx-edit text-lg"></i>
        </button>
        <button
          @click="handleDelete(item)"
          class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
          title="Eliminar"
        >
          <i class="bx bx-trash text-lg"></i>
        </button>
      </template>

      <!-- Custom bulk actions -->
      <template #bulk-actions="{ selectedItems }">
        <button
          @click="handleBulkEdit(selectedItems)"
          class="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
        >
          <i class="bx bx-edit mr-1"></i>
          Editar seleccionados
        </button>
        <button
          @click="handleBulkExport(selectedItems)"
          class="px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
        >
          <i class="bx bx-export mr-1"></i>
          Exportar seleccionados
        </button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDataTable, type TableColumn } from '@/composables/useDataTable'
import DataTable from '@/components/shared/DataTable.vue'

// Filters
const selectedCategory = ref('')
const selectedStatus = ref('')

// Table configuration
const columns: TableColumn[] = [
  { key: 'codigo', label: 'Código', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'categoria.nombre', label: 'Categoría', sortable: true },
  { key: 'valor', label: 'Valor', sortable: true, type: 'currency' },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'fecha_adquisicion', label: 'Fecha Adquisición', sortable: true, type: 'date' },
]

// Sample data
const sampleData = [
  {
    id: 1,
    codigo: 'EQ-001',
    nombre: 'Laptop Dell XPS 13',
    categoria: { nombre: 'Tecnología' },
    valor: 1299.99,
    estado: 'activo',
    fecha_adquisicion: '2023-01-15'
  },
  {
    id: 2,
    codigo: 'MB-002',
    nombre: 'Escritorio de Oficina',
    categoria: { nombre: 'Mobiliario' },
    valor: 450.00,
    estado: 'activo',
    fecha_adquisicion: '2023-02-20'
  },
  {
    id: 3,
    codigo: 'EQ-003',
    nombre: 'Proyector Epson',
    categoria: { nombre: 'Equipos' },
    valor: 899.99,
    estado: 'mantenimiento',
    fecha_adquisicion: '2023-01-10'
  }
]

// Initialize table
const {
  state,
  paginatedData,
  total,
  setSearch,
  setPage,
  setPageSize,
  sort,
  setData
} = useDataTable()

// Lifecycle
onMounted(() => {
  setData(sampleData)
})

const debug = (...args: any[]) => {
  if (import.meta.env.DEV) console.log(...args)
}

// Event handlers
const handleEdit = (item: any) => {
  debug('Edit item:', item)
}

const handleDelete = (item: any) => {
  debug('Delete item:', item)
}

const handleView = (item: any) => {
  debug('View item:', item)
}

const handleGenerateQR = (item: any) => {
  debug('Generate QR for item:', item)
}

const handleCreate = () => {
  debug('Create new item')
}

const handleImport = () => {
  debug('Import data')
}

const handleExport = () => {
  debug('Export data')
}

const handleBulkDelete = (items: any[]) => {
  debug('Bulk delete items:', items)
}

const handleBulkEdit = (items: any[]) => {
  debug('Bulk edit items:', items)
}

const handleBulkExport = (items: any[]) => {
  debug('Bulk export items:', items)
}

const applyFilters = () => {
  // Apply custom filters
  debug('Apply filters:', { selectedCategory: selectedCategory.value, selectedStatus: selectedStatus.value })
}

// Utility functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'activo':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'inactivo':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    case 'mantenimiento':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'activo':
      return 'Activo'
    case 'inactivo':
      return 'Inactivo'
    case 'mantenimiento':
      return 'Mantenimiento'
    default:
      return status
  }
}
</script>
