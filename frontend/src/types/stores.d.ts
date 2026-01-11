// Store types
import type { Role, User, Asset } from '@/types'

// Assets store types
export interface AssetStore {
  assets: Asset[]
  loading: boolean
  error: string | null
  filters: {
    search: string
    category: string
    location: string
    status: string
    responsible: string
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth store types
export interface AuthStore {
  user: User | null
  token: string | null
  roles: Role[]
  permissions: string[]
  isAuthenticated: boolean
  isAdmin: boolean
  isUser: boolean
}

// UI store types
export interface NotificationItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  persistent?: boolean
  actions?: Array<{
    text: string
    action: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }>
}

export interface UIStore {
  loading: boolean
  sidebarOpen: boolean
  notifications: NotificationItem[]
  breadcrumbs: Array<{
    text: string
    to?: string
    disabled?: boolean
  }>
}