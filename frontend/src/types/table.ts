// Table-related type definitions

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'badge' | 'image'
  format?: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sticky?: boolean
  render?: (value: any, item: any) => string
}

export interface TableState {
  searchTerm: string
  currentPage: number
  pageSize: number
  sortColumn: string | null
  sortDirection: 'asc' | 'desc'
  selectedItems: any[]
  loading: boolean
  filters: Record<string, any>
}

export interface TableConfig {
  serverSide?: boolean
  pageSizes?: number[]
  defaultPageSize?: number
  searchDebounce?: number
  selectable?: boolean
  multiSelect?: boolean
  showQR?: boolean
  hasActions?: boolean
  stickyHeader?: boolean
  responsive?: boolean
}

export interface TableLoadParams {
  search?: string
  page: number
  pageSize: number
  sortColumn?: string | null
  sortDirection?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface TableLoadResponse<T = any> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface TableAction {
  key: string
  label: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  permission?: string
  visible?: (item: any) => boolean
  disabled?: (item: any) => boolean
  handler: (item: any) => void | Promise<void>
}

export interface TableBulkAction {
  key: string
  label: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  permission?: string
  visible?: (items: any[]) => boolean
  disabled?: (items: any[]) => boolean
  handler: (items: any[]) => void | Promise<void>
}

export interface TableFilter {
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean'
  options?: Array<{ value: any; label: string }>
  placeholder?: string
  defaultValue?: any
  width?: string
}

export interface TableExportOptions {
  format: 'excel' | 'csv' | 'pdf'
  filename?: string
  includeColumns?: string[]
  excludeColumns?: string[]
  includeFilters?: boolean
  customData?: any[]
}

export interface TablePaginationInfo {
  currentPage: number
  totalPages: number
  pageSize: number
  total: number
  filteredTotal: number
  startIndex: number
  endIndex: number
}

// Status badge configuration
export interface StatusBadgeConfig {
  [key: string]: {
    label: string
    color: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'indigo'
    icon?: string
  }
}

// Default status configurations
export const DEFAULT_STATUS_CONFIG: StatusBadgeConfig = {
  active: {
    label: 'Activo',
    color: 'green',
    icon: 'bx-check-circle'
  },
  inactive: {
    label: 'Inactivo',
    color: 'gray',
    icon: 'bx-x-circle'
  },
  pending: {
    label: 'Pendiente',
    color: 'yellow',
    icon: 'bx-time-five'
  },
  approved: {
    label: 'Aprobado',
    color: 'green',
    icon: 'bx-check'
  },
  rejected: {
    label: 'Rechazado',
    color: 'red',
    icon: 'bx-x'
  },
  draft: {
    label: 'Borrador',
    color: 'gray',
    icon: 'bx-edit'
  },
  published: {
    label: 'Publicado',
    color: 'blue',
    icon: 'bx-globe'
  },
  maintenance: {
    label: 'Mantenimiento',
    color: 'yellow',
    icon: 'bx-wrench'
  },
  deprecated: {
    label: 'Dado de baja',
    color: 'red',
    icon: 'bx-archive'
  }
}

// Utility types
export type TableEvent = 
  | 'load-data'
  | 'search'
  | 'sort'
  | 'page-change'
  | 'page-size-change'
  | 'selection-change'
  | 'filter-change'
  | 'action-click'
  | 'bulk-action-click'
  | 'export'
  | 'refresh'

export type TableEmit = {
  [K in TableEvent]: (...args: any[]) => void
}

// Table component props interface
export interface DataTableProps {
  // Data
  data: any[]
  columns: TableColumn[]
  
  // Display
  title?: string
  description?: string
  
  // Search and filtering
  searchTerm?: string
  searchPlaceholder?: string
  filters?: TableFilter[]
  
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
  actions?: TableAction[]
  bulkActions?: TableBulkAction[]
  
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
  
  // Export
  exportable?: boolean
  exportOptions?: TableExportOptions
  
  // Styling
  striped?: boolean
  bordered?: boolean
  hoverable?: boolean
  dense?: boolean
  
  // Responsive
  responsive?: boolean
  stickyHeader?: boolean
  
  // Configuration
  config?: TableConfig
}