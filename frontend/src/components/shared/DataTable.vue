<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
    <!-- Header de la tabla -->
    <TableHeader
      :title="title"
      :description="description"
      :search-term="searchTermLocal"
      :search-placeholder="searchPlaceholder"
      :page-size="pageSizeLocal"
      :page-sizes="pageSizes"
      @update:search-term="handleSearchUpdate"
      @update:page-size="handlePageSizeUpdate"
      @clear-search="clearSearch"
    >
      <template #header-actions>
        <slot name="header-actions" />
      </template>
      <template #filters>
        <slot name="filters" />
      </template>
    </TableHeader>

    <!-- Loading state -->
    <TableLoadingState v-if="loading" :message="loadingMessage" />

    <!-- Empty state -->
    <TableEmptyState
      v-else-if="paginatedData.length === 0"
      :title="emptyTitle"
      :description="emptyDescription"
      :action-text="emptyActionText"
      :show-action="showEmptyAction"
      :show-clear-filters="hasActiveFilters"
      @create="$emit('create')"
      @clear-filters="$emit('clear-filters')"
    >
      <template #icon>
        <slot name="empty-icon" />
      </template>
      <template #action>
        <slot name="empty-action" />
      </template>
    </TableEmptyState>

    <!-- Data views -->
    <template v-else>
      <!-- Vista móvil -->
      <TableMobileView
        :items="paginatedData"
        :columns="columns"
        :selectable="selectable"
        :selected-items="selectedItems"
        :show-q-r="showQR"
        :has-actions="hasActions"
        @toggle-select-item="toggleSelectItem"
        @generate-qr="$emit('generate-qr', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      >
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </TableMobileView>

      <!-- Vista desktop -->
      <TableDesktopView
        :items="paginatedData"
        :columns="columns"
        :selectable="selectable"
        :selected-items="selectedItems"
        :show-q-r="showQR"
        :has-actions="hasActions"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        :is-all-selected="isAllSelected"
        @toggle-select-item="toggleSelectItem"
        @toggle-select-all="toggleSelectAll"
        @generate-qr="$emit('generate-qr', $event)"
        @sort="handleSort"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      >
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </TableDesktopView>
    </template>

    <!-- Paginación -->
    <TablePagination
      v-if="!loading && paginatedData.length > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSizeLocal"
      :total="total"
      :filtered-total="filteredTotal"
      :selected-count="selectedItems.length"
      @page-change="handlePageChange"
      @bulk-delete="$emit('bulk-delete', selectedItems)"
    >
      <template #bulk-actions>
        <slot name="bulk-actions" :selected-items="selectedItems" />
      </template>
    </TablePagination>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { debounce } from 'lodash-es'
import TableHeader from '@/components/table/TableHeader.vue'
import TableMobileView from '@/components/table/TableMobileView.vue'
import TableDesktopView from '@/components/table/TableDesktopView.vue'
import TablePagination from '@/components/table/TablePagination.vue'
import TableLoadingState from '@/components/table/TableLoadingState.vue'
import TableEmptyState from '@/components/table/TableEmptyState.vue'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean'
  format?: string
  width?: string
}

interface Props {
  // Data
  data: any[]
  columns: Column[]
  
  // Display options
  title: string
  description?: string
  
  // Search and filtering
  searchTerm?: string
  searchPlaceholder?: string
  
  // Pagination
  pageSize?: number
  pageSizes?: number[]
  serverSide?: boolean
  total?: number
  currentPage?: number
  
  // Selection
  selectable?: boolean
  selectedItems?: any[]
  
  // Features
  showQR?: boolean
  hasActions?: boolean
  
  // Sorting
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  
  // States
  loading?: boolean
  loadingMessage?: string
  
  // Empty state
  emptyTitle?: string
  emptyDescription?: string
  emptyActionText?: string
  showEmptyAction?: boolean
  hasActiveFilters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  searchTerm: '',
  searchPlaceholder: 'Buscar...',
  pageSize: 10,
  pageSizes: () => [5, 10, 25, 50, 100],
  serverSide: false,
  total: 0,
  currentPage: 1,
  selectable: false,
  selectedItems: () => [],
  showQR: false,
  hasActions: true,
  loading: false,
  loadingMessage: 'Cargando datos...',
  emptyTitle: 'No hay datos disponibles',
  emptyDescription: 'No se encontraron elementos para mostrar.',
  emptyActionText: 'Crear nuevo',
  showEmptyAction: true,
  hasActiveFilters: false
})

const emit = defineEmits<{
  // Data events
  'update:searchTerm': [value: string]
  'update:pageSize': [value: number]
  'update:currentPage': [value: number]
  'update:selectedItems': [value: any[]]
  'update:sortColumn': [value: string]
  'update:sortDirection': [value: 'asc' | 'desc']
  
  // Action events
  edit: [item: any]
  delete: [item: any]
  'generate-qr': [item: any]
  create: []
  'clear-filters': []
  'bulk-delete': [items: any[]]
  
  // Data loading (for server-side)
  'load-data': [params: any]
}>()

// Local reactive state
const searchTermLocal = ref(props.searchTerm)
const pageSizeLocal = ref(props.pageSize)
const currentPageLocal = ref(props.currentPage)
const selectedItemsLocal = ref([...props.selectedItems])
const sortColumnLocal = ref(props.sortColumn)
const sortDirectionLocal = ref(props.sortDirection)

// Computed data processing
const filteredData = computed(() => {
  if (props.serverSide) return props.data
  
  let filtered = [...props.data]
  
  // Apply search filter
  if (searchTermLocal.value.trim()) {
    const searchTerm = searchTermLocal.value.toLowerCase()
    filtered = filtered.filter((item: any) =>
      props.columns.some((column: any) => {
        const value = getNestedValue(item, column.key)
        return String(value || '').toLowerCase().includes(searchTerm)
      })
    )
  }
  
  return filtered
})

const sortedData = computed(() => {
  if (props.serverSide || !sortColumnLocal.value) return filteredData.value
  
  const sorted = [...filteredData.value]
  sorted.sort((a, b) => {
    const aValue = getNestedValue(a, sortColumnLocal.value!)
    const bValue = getNestedValue(b, sortColumnLocal.value!)
    
    if (aValue === bValue) return 0
    
    const result = aValue < bValue ? -1 : 1
    return sortDirectionLocal.value === 'desc' ? -result : result
  })
  
  return sorted
})

const paginatedData = computed(() => {
  if (props.serverSide) return props.data
  
  const start = (currentPageLocal.value - 1) * pageSizeLocal.value
  const end = start + pageSizeLocal.value
  return sortedData.value.slice(start, end)
})

const filteredTotal = computed(() => {
  return props.serverSide ? props.total : filteredData.value.length
})

const totalPages = computed(() => {
  return Math.ceil(filteredTotal.value / pageSizeLocal.value)
})

const isAllSelected = computed(() => {
  return paginatedData.value.length > 0 && 
    paginatedData.value.every((item: any) => 
      selectedItemsLocal.value.includes(getItemId(item))
    )
})

// Watchers for prop sync
watch(() => props.searchTerm, (newVal: string) => {
  searchTermLocal.value = newVal
})

watch(() => props.currentPage, (newVal: number) => {
  currentPageLocal.value = newVal
})

watch(() => props.selectedItems, (newVal: any[]) => {
  selectedItemsLocal.value = [...newVal]
})

// Event handlers
const debouncedSearch = debounce(() => {
  emit('update:searchTerm', searchTermLocal.value)
  currentPageLocal.value = 1
  emit('update:currentPage', 1)
  
  if (props.serverSide) {
    emitLoadData()
  }
}, 300)

const handleSearchUpdate = (value: string) => {
  searchTermLocal.value = value
  debouncedSearch()
}

const handlePageSizeUpdate = (value: number) => {
  pageSizeLocal.value = value
  currentPageLocal.value = 1
  emit('update:pageSize', value)
  emit('update:currentPage', 1)
  
  if (props.serverSide) {
    emitLoadData()
  }
}

const handlePageChange = (page: number) => {
  currentPageLocal.value = page
  emit('update:currentPage', page)
  
  if (props.serverSide) {
    emitLoadData()
  }
}

const handleSort = (column: string) => {
  if (sortColumnLocal.value === column) {
    sortDirectionLocal.value = sortDirectionLocal.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumnLocal.value = column
    sortDirectionLocal.value = 'asc'
  }
  
  emit('update:sortColumn', sortColumnLocal.value)
  emit('update:sortDirection', sortDirectionLocal.value)
  
  if (props.serverSide) {
    emitLoadData()
  }
}

const toggleSelectItem = (id: any) => {
  const index = selectedItemsLocal.value.indexOf(id)
  if (index > -1) {
    selectedItemsLocal.value.splice(index, 1)
  } else {
    selectedItemsLocal.value.push(id)
  }
  emit('update:selectedItems', selectedItemsLocal.value)
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all current page items
    paginatedData.value.forEach((item: any) => {
      const id = getItemId(item)
      const index = selectedItemsLocal.value.indexOf(id)
      if (index > -1) {
        selectedItemsLocal.value.splice(index, 1)
      }
    })
  } else {
    // Select all current page items
    paginatedData.value.forEach((item: any) => {
      const id = getItemId(item)
      if (!selectedItemsLocal.value.includes(id)) {
        selectedItemsLocal.value.push(id)
      }
    })
  }
  emit('update:selectedItems', selectedItemsLocal.value)
}

const clearSearch = () => {
  searchTermLocal.value = ''
  emit('update:searchTerm', '')
  currentPageLocal.value = 1
  emit('update:currentPage', 1)
  
  if (props.serverSide) {
    emitLoadData()
  }
}

const emitLoadData = () => {
  emit('load-data', {
    search: searchTermLocal.value,
    page: currentPageLocal.value,
    pageSize: pageSizeLocal.value,
    sortColumn: sortColumnLocal.value,
    sortDirection: sortDirectionLocal.value
  })
}

// Utility functions
const getItemId = (item: any, index?: number) => {
  return item.id || item.id_bien || item.id_usuario || item.id_categoria || index
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Expose some methods for parent components
defineExpose({
  clearSelection: () => {
    selectedItemsLocal.value = []
    emit('update:selectedItems', [])
  },
  refresh: () => {
    if (props.serverSide) {
      emitLoadData()
    }
  }
})
</script>
