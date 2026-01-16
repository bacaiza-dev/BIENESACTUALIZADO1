// Re-export table types
export * from './table'

export interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  documento: string
  telefono?: string
  departamento: string
  rol: string
  estado: 'activo' | 'inactivo' | 'pendiente'
  ultimo_acceso?: string
  fecha_registro?: string
  roles: Role[]
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  nombre: string
  descripcion: string
  permisos: Permission[]
}

export interface Permission {
  id: number
  nombre: string
  descripcion: string
  recurso: string
  accion: string
}

export interface Asset {
  id: number
  id_bien?: number
  codigo?: string
  codigo_institucional: string
  codigo_senescyt?: string
  nombre: string
  clase_de_bien?: string
  descripcion?: string
  marca?: string
  modelo?: string
  serie?: string
  color?: string
  material?: string
  proveedor?: string
  anio_fabricacion?: number
  observaciones?: string
  categoria_id: number
  categoria?: Category
  ubicacion_id?: number
  ubicacion?: Location
  responsable_id?: number
  responsable?: User
  responsable_completo?: string
  estado: 'activo' | 'inactivo' | 'mantenimiento' | 'baja' | 'ACTIVO' | 'INACTIVO' | 'MANTENIMIENTO' | 'BAJA'
  fecha_adquisicion?: string
  valor_adquisicion?: number
  vida_util?: number
  valor_residual?: number
  created_at?: string
  updated_at?: string
  codigo_qr?: string
}

export interface Category {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
  codigo?: string
  tipo?: string
  estado?: 'activo' | 'inactivo'
  observaciones?: string
}

export interface Location {
  id: number
  nombre: string
  descripcion: string
  edificio: string
  piso: string
  aula: string
  activo: boolean
}

export interface Ubicacion {
  id: number
  nombre: string
  descripcion: string
  edificio: string
  piso: number
  tipo: 'oficina' | 'aula' | 'laboratorio' | 'almacen' | 'biblioteca' | 'taller'
  capacidad: number
  estado: 'activo' | 'inactivo' | 'mantenimiento'
  bienesAsignados: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  roles: Role[]
  permissions: string[]
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  roles: Role[]
  permissions?: string[]
}

export interface AssetFilters {
  categoria_id?: number
  ubicacion_id?: number
  responsable_id?: number
  estado?: string
  search?: string
}

export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  class?: string
  cellClass?: string
  type?: 'text' | 'badge' | 'date' | 'currency' | 'actions' | 'custom'
  format?: (value: any) => string
  formatter?: (value: any) => string
}

export interface DataTableOptions {
  page: number
  limit: number
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export interface RouteRole {
  roles: string[]
  permissions?: string[]
}

export interface Alert {
  id: number
  tipo: 'mantenimiento' | 'vencimiento' | 'baja' | 'asignacion'
  mensaje: string
  bien_id: number
  bien: Asset
  usuario_id: number
  usuario: User
  estado: 'pendiente' | 'leida' | 'resuelto'
  fecha_creacion: string
  fecha_resolucion?: string
}

export interface Maintenance {
  id: number
  bien_id: number
  bien: Asset
  tipo: 'preventivo' | 'correctivo' | 'predictivo'
  descripcion: string
  fecha_programada: string
  fecha_realizada?: string
  costo: number
  responsable_id: number
  responsable: User
  estado: 'programado' | 'en_proceso' | 'completado' | 'cancelado'
}

export interface AuditLog {
  id: number
  tabla: string
  accion: 'create' | 'update' | 'delete'
  registro_id: number
  usuario_id: number
  usuario: User
  datos_anteriores?: any
  datos_nuevos?: any
  fecha: string
  ip: string
}

export interface Document {
  id: number
  nombre: string
  tipo: string
  ruta: string
  tamaño: number
  bien_id: number
  bien: Asset
  usuario_id: number
  usuario: User
  created_at: string
}

// Alias en español (usado en algunas vistas)
export type Documento = Document

export interface Assignment {
  id: number
  bien_id: number
  bien: Asset
  usuario_id: number
  usuario: User
  fecha_asignacion: string
  fecha_devolucion?: string
  estado: 'activo' | 'devuelto' | 'pendiente'
  observaciones?: string
}

export interface AcademicPeriod {
  id: number
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
}

export interface Report {
  id: number
  nombre: string
  tipo: 'inventario' | 'auditoria' | 'mantenimiento' | 'asignaciones'
  parametros: any
  fecha_generacion: string
  usuario_id: number
  usuario: User
  ruta_archivo: string
}
