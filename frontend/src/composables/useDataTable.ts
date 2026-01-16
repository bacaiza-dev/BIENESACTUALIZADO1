import { ref, computed, reactive, watch } from 'vue'
import { debounce } from 'lodash-es'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean'
  format?: string
  width?: string
}

export interface TableState {
  searchTerm: string
  currentPage: number
  pageSize: number
  sortColumn: string | null
  sortDirection: 'asc' | 'desc'
  selectedItems: any[]
  loading: boolean
}

export interface TableConfig {
  serverSide?: boolean
  pageSizes?: number[]
  defaultPageSize?: number
  searchDebounce?: number
}

export function useDataTable(
  dataLoader?: (params: any) => Promise<{ data: any[]; total: number }>,
  config: TableConfig = {}
) {
  const {
    serverSide = false,
    pageSizes = [5, 10, 25, 50, 100],
    defaultPageSize = 10,
    searchDebounce = 300
  } = config

  // State
  const state = reactive<TableState>({
    searchTerm: '',
    currentPage: 1,
    pageSize: defaultPageSize,
    sortColumn: null,
    sortDirection: 'asc',
    selectedItems: [],
    loading: false
  })

  const data = ref<any[]>([])
  const total = ref(0)
  const error = ref<string | null>(null)

  // Computed
  const filteredData = computed(() => {
    if (serverSide) return data.value

    let filtered = [...data.value]

    // Apply search filter
    if (state.searchTerm.trim()) {
      const searchTerm = state.searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value || '').toLowerCase().includes(searchTerm)
        )
      )
    }

    return filtered
  })

  const sortedData = computed(() => {
    if (serverSide || !state.sortColumn) return filteredData.value

    const sorted = [...filteredData.value]
    sorted.sort((a, b) => {
      const aValue = getNestedValue(a, state.sortColumn!)
      const bValue = getNestedValue(b, state.sortColumn!)

      if (aValue === bValue) return 0

      const result = aValue < bValue ? -1 : 1
      return state.sortDirection === 'desc' ? -result : result
    })

    return sorted
  })

  const paginatedData = computed(() => {
    if (serverSide) return data.value

    const start = (state.currentPage - 1) * state.pageSize
    const end = start + state.pageSize
    return sortedData.value.slice(start, end)
  })

  const totalPages = computed(() => {
    const totalItems = serverSide ? total.value : filteredData.value.length
    return Math.ceil(totalItems / state.pageSize)
  })

  const filteredTotal = computed(() => {
    return serverSide ? total.value : filteredData.value.length
  })

  const isAllSelected = computed(() => {
    return paginatedData.value.length > 0 &&
      paginatedData.value.every((item: any) =>
        state.selectedItems.includes(getItemId(item))
      )
  })

  // Actions
  const loadData = async (params?: any) => {
    if (!serverSide || !dataLoader) return

    state.loading = true
    error.value = null

    try {
      const loadParams = {
        search: state.searchTerm,
        page: state.currentPage,
        pageSize: state.pageSize,
        sortColumn: state.sortColumn,
        sortDirection: state.sortDirection,
        ...params
      }

      const result = await dataLoader(loadParams)
      data.value = result.data
      total.value = result.total
    } catch (err: any) {
      error.value = err.message || 'Error al cargar datos'
      data.value = []
      total.value = 0
    } finally {
      state.loading = false
    }
  }

  const setData = (newData: any[], newTotal?: number) => {
    data.value = newData
    if (newTotal !== undefined) {
      total.value = newTotal
    }
  }

  const search = debounce((term: string) => {
    state.searchTerm = term
    state.currentPage = 1
    if (serverSide) {
      loadData()
    }
  }, searchDebounce)

  const setSearch = (term: string) => {
    state.searchTerm = term
    search(term)
  }

  const setPage = (page: number) => {
    state.currentPage = Math.max(1, Math.min(page, totalPages.value))
    if (serverSide) {
      loadData()
    }
  }

  const setPageSize = (size: number) => {
    state.pageSize = size
    state.currentPage = 1
    if (serverSide) {
      loadData()
    }
  }

  const sort = (column: string) => {
    if (state.sortColumn === column) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      state.sortColumn = column
      state.sortDirection = 'asc'
    }

    if (serverSide) {
      loadData()
    }
  }

  const clearSort = () => {
    state.sortColumn = null
    state.sortDirection = 'asc'
    if (serverSide) {
      loadData()
    }
  }

  const selectItem = (id: any) => {
    if (!state.selectedItems.includes(id)) {
      state.selectedItems.push(id)
    }
  }

  const deselectItem = (id: any) => {
    const index = state.selectedItems.indexOf(id)
    if (index > -1) {
      state.selectedItems.splice(index, 1)
    }
  }

  const toggleSelectItem = (id: any) => {
    const index = state.selectedItems.indexOf(id)
    if (index > -1) {
      state.selectedItems.splice(index, 1)
    } else {
      state.selectedItems.push(id)
    }
  }

  const selectAll = () => {
    paginatedData.value.forEach((item: any) => {
      const id = getItemId(item)
      if (!state.selectedItems.includes(id)) {
        state.selectedItems.push(id)
      }
    })
  }

  const deselectAll = () => {
    paginatedData.value.forEach((item: any) => {
      const id = getItemId(item)
      const index = state.selectedItems.indexOf(id)
      if (index > -1) {
        state.selectedItems.splice(index, 1)
      }
    })
  }

  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      deselectAll()
    } else {
      selectAll()
    }
  }

  const clearSelection = () => {
    state.selectedItems = []
  }

  const clearSearch = () => {
    state.searchTerm = ''
    state.currentPage = 1
    if (serverSide) {
      loadData()
    }
  }

  const reset = () => {
    state.searchTerm = ''
    state.currentPage = 1
    state.pageSize = defaultPageSize
    state.sortColumn = null
    state.sortDirection = 'asc'
    state.selectedItems = []
    if (serverSide) {
      loadData()
    }
  }

  const refresh = () => {
    if (serverSide) {
      loadData()
    }
  }

  // Utility functions
  const getItemId = (item: any, index?: number) => {
    return item.id || item.id_bien || item.id_usuario || item.id_categoria || index
  }

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const formatValue = (value: any, column: TableColumn) => {
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
      case 'number':
        return new Intl.NumberFormat('es-EC').format(value)
      default:
        return String(value)
    }
  }

  // Validation helpers
  const validatePageSize = (size: number) => {
    return pageSizes.includes(size)
  }

  const validatePage = (page: number) => {
    return page >= 1 && page <= totalPages.value
  }

  const getSelectedItems = () => {
    return data.value.filter((item: any) =>
      state.selectedItems.includes(getItemId(item))
    )
  }

  // Watchers for automatic data loading
  if (serverSide && dataLoader) {
    watch(
      () => [state.searchTerm, state.currentPage, state.pageSize, state.sortColumn, state.sortDirection],
      () => {
        loadData()
      },
      { deep: true }
    )
  }

  return {
    // State
    state,
    data,
    total,
    error,

    // Computed
    filteredData,
    sortedData,
    paginatedData,
    totalPages,
    filteredTotal,
    isAllSelected,

    // Actions
    loadData,
    setData,
    setSearch,
    setPage,
    setPageSize,
    sort,
    clearSort,
    selectItem,
    deselectItem,
    toggleSelectItem,
    selectAll,
    deselectAll,
    toggleSelectAll,
    clearSelection,
    clearSearch,
    reset,
    refresh,

    // Utilities
    getItemId,
    getNestedValue,
    formatValue,
    validatePageSize,
    validatePage,
    getSelectedItems,

    // Config
    pageSizes,
    serverSide
  }
}
