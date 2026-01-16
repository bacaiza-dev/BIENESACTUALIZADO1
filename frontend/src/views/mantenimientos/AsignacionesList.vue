<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Gestión de Asignaciones
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Administra las asignaciones de bienes a usuarios y su historial
          </p>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ asignaciones.length }} asignaciones totales</span>
            <span>•</span>
            <span>{{ asignacionesActivas.length }} activas</span>
          </div>
        </div>
        <div class="mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            @click="exportarDatos"
            class="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <i class="bx bx-download text-lg"></i>
            <span class="hidden sm:inline">Exportar</span>
          </button>
          <button
            v-if="canCreateAssignment"
            @click="mostrarModalCrear = true"
            class="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <i class="bx bx-plus-circle text-lg"></i>
            <span>Nueva Asignación</span>
          </button>
        </div>
      </div>
    </div>


    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-clipboard text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Activas</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ asignacionesActivas.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-user text-green-600 dark:text-green-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Usuarios</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ usuariosConBienes }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-time text-yellow-600 dark:text-yellow-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ pendientesDevolucion.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-check text-purple-600 dark:text-purple-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Devueltas</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ asignacionesDevueltas.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buscar usuario
          </label>
          <input
            v-model="filters.searchUsuario"
            type="text"
            placeholder="Nombre o cédula del usuario..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buscar bien
          </label>
          <input
            v-model="filters.searchBien"
            type="text"
            placeholder="Código o nombre del bien..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <select
            v-model="filters.estado"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos los estados</option>
            <option value="activa">Activa</option>
            <option value="devuelta">Devuelta</option>
            <option value="transferida">Transferida</option>
            <option value="perdida">Perdida</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="limpiarFiltros"
            class="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de asignaciones -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <DataTable
        :data="asignacionesFiltradas"
        :columns="columnas"
        :loading="loading"
        title="Historial de Asignaciones"
        description="Lista completa de asignaciones de bienes a usuarios"
        search-placeholder="Buscar asignaciones..."
        :show-q-r="false"
        :has-actions="true"
        @edit="editarAsignacion"
        @view="verAsignacion"
        @delete="finalizarAsignacion"
      >
        <template #cell-usuario_info="{ item }">
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
            >
              <span class="text-xs font-medium text-blue-600 dark:text-blue-300">
                {{ item.usuario?.nombre?.charAt(0) || 'U' }}
              </span>
            </div>
            <div class="text-sm">
              <div class="font-medium text-gray-900 dark:text-white">
                {{ item.usuario?.nombre }} {{ item.usuario?.apellido }}
              </div>
              <div class="text-gray-500 dark:text-gray-400">
                {{ item.usuario?.documento }}
              </div>
            </div>
          </div>
        </template>

        <template #cell-bien_info="{ item }">
          <div class="text-sm">
            <div class="font-medium text-gray-900 dark:text-white">
              {{ item.bien?.codigo_institucional }}
            </div>
            <div class="text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {{ item.bien?.nombre }}
            </div>
          </div>
        </template>

        <template #cell-estado="{ value }">
          <span
            :class="getEstadoBadgeClass(value)"
            class="px-2 py-1 text-xs font-semibold rounded-full"
          >
            {{ formatEstado(value) }}
          </span>
        </template>

        <template #cell-fecha_asignacion="{ value }">
          <span class="text-sm text-gray-900 dark:text-white">
            {{ formatDate(value) }}
          </span>
        </template>

        <template #cell-fecha_devolucion="{ value }">
          <span v-if="value" class="text-sm text-gray-900 dark:text-white">
            {{ formatDate(value) }}
          </span>
          <span v-else class="text-sm text-gray-500 dark:text-gray-400"> Pendiente </span>
        </template>

        <template #actions="{ item }">
          <div class="flex space-x-2">
            <button
              v-if="item.estado === 'activa'"
              @click="gestionarDevolucion(item)"
              class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200 p-1 rounded hover:bg-green-100 dark:hover:bg-green-900"
              title="Gestionar devolución"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
                ></path>
              </svg>
            </button>
            <button
              v-if="item.estado === 'activa'"
              @click="transferirBien(item)"
              class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
              title="Transferir a otro usuario"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                ></path>
              </svg>
            </button>
            <button
              @click="verHistorial(item)"
              class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200 p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900"
              title="Ver historial completo"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </button>
            <button
              @click="generarActa(item)"
              class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors duration-200 p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900"
              title="Generar acta"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </button>
            <button
              @click="editarAsignacion(item)"
              class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900"
              title="Editar asignación"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Modal de nueva asignación -->
    <div
      v-if="mostrarModalCrear"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Nueva Asignación de Bien</h3>
          <button
            @click="cerrarModalAsignar"
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

        <form @submit.prevent="crearAsignacion" class="space-y-6">
          <!-- Selector de bien -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bien a asignar *
            </label>
            <select
              v-model="nuevaAsignacion.id_bien"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Seleccionar bien...</option>
              <option v-for="bien in bienesDisponibles" :key="bien.id_bien" :value="bien.id_bien">
                {{ bien.codigo_institucional }} - {{ bien.nombre }} ({{ bien.estado }})
              </option>
            </select>
          </div>

          <!-- Selector de usuario -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Usuario responsable *
            </label>
            <select
              v-model="nuevaAsignacion.id_usuario"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Seleccionar usuario...</option>
              <option
                v-for="usuario in usuarios"
                :key="usuario.id"
                :value="usuario.id"
              >
                {{ usuario.nombre }} {{ usuario.apellido }} ({{ usuario.documento }})
              </option>
            </select>
          </div>

          <!-- Fecha de asignación -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de asignación *
            </label>
            <input
              v-model="nuevaAsignacion.fecha_asignacion"
              type="date"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <!-- Observaciones -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones
            </label>
            <textarea
              v-model="nuevaAsignacion.observaciones"
              rows="3"
              placeholder="Observaciones sobre la asignación..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            ></textarea>
          </div>

          <!-- Botones -->
          <div class="flex space-x-4 pt-4">
            <button
              type="button"
              @click="cerrarModalAsignar"
              class="flex-1 px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <i class="bx bx-x text-sm mr-2"></i>
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i :class="creating ? 'bx bx-loader-alt animate-spin' : 'bx bx-plus'" class="text-sm mr-2"></i>
              <span v-if="creating">Creando...</span>
              <span v-else>Crear Asignación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useAuth } from '@/composables/useAuth'
import DataTable from '@/components/shared/DataTable.vue'
import BaseModal from '@/components/shared/BaseModal.vue'
import BaseButton from '@/components/shared/BaseButton.vue'
import apiClient from '@/api/client'
import type { DataTableColumn, Asset, User } from '@/types'

interface Asignacion {
  id: number
  bien_id: number
  bien?: Asset
  usuario_id: number
  usuario?: User
  estado: 'activa' | 'devuelta' | 'transferida' | 'perdida'
  fecha_asignacion: string
  fecha_devolucion?: string
  fecha_limite?: string
  observaciones?: string
  asignado_por: number
  recibido_por?: number
  created_at: string
  updated_at: string
}

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { canCreateAssignment, canEditAssignment, canDeleteAssignment } = useAuth()

// Estado del componente
const cargando = ref(false)
const loading = cargando  // Alias for template compatibility
const guardando = ref(false)
const mostrarModalCrear = ref(false)
const mostrarModalEdicion = ref(false)
const mostrarModalDevolucion = ref(false)
const asignacionActual = ref<Asignacion | null>(null)

// Filtros
const filtros = reactive({
  busqueda: '',
  estado: '',
  usuario: '',
  limite: 10,
})

// Filters for template (matching v-model bindings in template)
const filters = reactive({
  searchUsuario: '',
  searchBien: '',
  estado: '',
})

// Formulario
const nuevaAsignacion = ref({
  id_bien: '',
  id_usuario: '',
  fecha_asignacion: new Date().toISOString().split('T')[0],
  observaciones: '',
})

// Datos
const asignaciones = ref<Asignacion[]>([])
const bienesDisponibles = ref<Asset[]>([])
const usuarios = ref<User[]>([])
const metricas = ref({
  asignacionesActivas: 0,
  usuariosConBienes: 0,
  pendientesDevolucion: 0,
  totalAsignaciones: 0,
})


// Computadas
const asignacionesActivas = computed(() => 
  asignaciones.value.filter((a: Asignacion) => a.estado === 'activa')
)

const asignacionesDevueltas = computed(() => 
  asignaciones.value.filter((a: Asignacion) => a.estado === 'devuelta')
)

const pendientesDevolucion = computed(() => 
  asignaciones.value.filter((a: Asignacion) => a.estado === 'activa' && !a.fecha_devolucion)
)

const usuariosConBienes = computed(() => {
  const usuariosUnicos = new Set(asignacionesActivas.value.map((a: Asignacion) => a.usuario_id))
  return usuariosUnicos.size
})

const asignacionesFiltradas = computed(() => {
  let resultado = [...asignaciones.value]

  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.toLowerCase()
    resultado = resultado.filter((a: Asignacion) =>
      a.usuario?.nombre?.toLowerCase().includes(busqueda) ||
      a.usuario?.documento?.includes(busqueda) ||
      a.bien?.nombre?.toLowerCase().includes(busqueda) ||
      a.bien?.codigo?.toLowerCase().includes(busqueda)
    )
  }

  if (filtros.estado) {
    resultado = resultado.filter((a: Asignacion) => a.estado === filtros.estado)
  }

  if (filtros.usuario) {
    resultado = resultado.filter((a: Asignacion) => a.usuario_id.toString() === filtros.usuario)
  }

  return resultado
})

// Columnas de la tabla
const columnas: DataTableColumn[] = [
  { key: 'usuario_info', label: 'Usuario', sortable: true },
  { key: 'bien_info', label: 'Bien', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'fecha_asignacion', label: 'Fecha Asignación', sortable: true },
  { key: 'fecha_devolucion', label: 'Fecha Devolución', sortable: true },
  { key: 'observaciones', label: 'Observaciones', sortable: false },
  { key: 'actions', label: 'Acciones', sortable: false },
]

// Métodos
const cargarAsignaciones = async () => {
  cargando.value = true
  try {
    const response = await apiClient.get('/asignaciones')
    const data = response
    if (data.success) {
        asignaciones.value = data.data
        calcularMetricas()
    } else {
        throw new Error(data.message || 'Error al cargar asignaciones')
    }
  } catch (error) {
    toast.error('Error al cargar asignaciones')
  } finally {
    cargando.value = false
  }
}

const cargarUsuarios = async () => {
  try {
    const response = await apiClient.get('/usuarios')
    const data = response
    if (data.success) {
      usuarios.value = data.data
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

const cargarBienesDisponibles = async () => {
  try {
    const response = await apiClient.get('/bienes', { params: { estado: 'operativo' } }) // Assuming 'operativo' or filtering active/available
    const data = response
    if (data.success) {
      // Filter locally if backend doesn't support 'disponible' status filtering directly in /bienes if needed, 
      // but typically we assign active assets.
      bienesDisponibles.value = data.data
    }
  } catch (error) {
    console.error('Error al cargar bienes disponibles:', error)
  }
}

const calcularMetricas = () => {
  const activas = asignaciones.value.filter((a: Asignacion) => a.estado === 'activa')
  const usuariosUnicos = new Set(activas.map((a: Asignacion) => a.usuario_id))

  metricas.value = {
    asignacionesActivas: activas.length,
    usuariosConBienes: usuariosUnicos.size,
    pendientesDevolucion: activas.filter((a: Asignacion) => !a.fecha_devolucion).length,
    totalAsignaciones: asignaciones.value.length,
  }
}

const crearAsignacion = async () => {
  guardando.value = true
  try {
    const response = await apiClient.post('/asignaciones', {
        id_bien: nuevaAsignacion.value.id_bien,
        id_usuario: nuevaAsignacion.value.id_usuario,
        fecha_asignacion: nuevaAsignacion.value.fecha_asignacion,
        observaciones: nuevaAsignacion.value.observaciones,
        estado: 'activa'
    })

    const data = response
    if (data.success) {
        toast.success('Asignación creada exitosamente')
        cerrarModalAsignar()
        await cargarAsignaciones()
    } else {
        throw new Error(data.message || 'Error al crear asignación')
    }
  } catch (error) {
    toast.error('Error al crear asignación')
  } finally {
    guardando.value = false
  }
}

const gestionarDevolucion = async (asignacion: Asignacion) => {
  if (confirm(`¿Confirmar devolución del bien ${asignacion.bien?.codigo_institucional}?`)) {
     try {
         const response = await apiClient.put(`/asignaciones/${asignacion.id}`, {
             estado: 'devuelta',
             fecha_devolucion: new Date().toISOString().split('T')[0]
         })
          if (response.success) {
             toast.success('Devolución registrada')
             await cargarAsignaciones()
         }
     } catch (e) {
         toast.error('Error al registrar devolución')
     }
  }
}

const transferirBien = (asignacion: Asignacion) => {
  toast.info(`Funcionalidad de transferencia para ${asignacion.bien?.codigo_institucional} en desarrollo`)
}

const verHistorial = (asignacion: Asignacion) => {
  // Implementar vista de historial
  toast.info(`Historial de ${asignacion.bien?.codigo_institucional}`)
}

const generarActa = (asignacion: Asignacion) => {
   // Implementar generación de acta PDF
   toast.info(`Generando acta para ${asignacion.bien?.codigo_institucional}`)
}

const editarAsignacion = (asignacion: Asignacion) => {
  // Implementar edición
  toast.info(`Editando asignación ${asignacion.id}`)
}

const verAsignacion = (asignacion: Asignacion) => {
  // Implementar ver detalles
  toast.info(`Ver detalles de asignación ${asignacion.id}`)
}

const finalizarAsignacion = async (asignacion: Asignacion) => {
  if (
    confirm(
      `¿Estás seguro de finalizar (eliminar) la asignación de "${asignacion.bien?.codigo_institucional}"?`
    )
  ) {
    try {
        const response = await apiClient.delete(`/asignaciones/${asignacion.id}`)
        if (response.success) {
            toast.success('Asignación eliminada')
            await cargarAsignaciones()
        }
    } catch (e) {
        toast.error('Error al eliminar asignación')
    }
  }
}

const exportarDatos = () => {
    // Implementar exportación real si existe endpoint
    toast.info('Exportando asignaciones...')
}

const cerrarModalAsignar = () => {
  mostrarModalCrear.value = false
  nuevaAsignacion.value = {
    id_bien: '',
    id_usuario: '',
    fecha_asignacion: new Date().toISOString().split('T')[0],
    observaciones: '',
  }
}

const limpiarFiltros = () => {
  filtros.busqueda = ''
  filtros.estado = ''
  filtros.usuario = ''
}

// Funciones de formato
const formatEstado = (estado: string) => {
  const estados: Record<string, string> = {
    activa: 'Activa',
    devuelta: 'Devuelta',
    transferida: 'Transferida',
    perdida: 'Perdida',
  }
  return estados[estado] || estado
}

const getEstadoBadgeClass = (estado: string) => {
  const classes: Record<string, string> = {
    activa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    devuelta: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    transferida: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    perdida: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return classes[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([cargarUsuarios(), cargarBienesDisponibles(), cargarAsignaciones()])
})
</script>
