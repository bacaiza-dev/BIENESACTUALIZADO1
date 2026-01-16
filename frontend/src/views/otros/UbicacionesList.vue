<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ headerTitle }}</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ headerDescription }}
            </p>
          </div>
          <!-- Botón solo para admin -->
          <button v-if="isAdmin" @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ createButtonLabel }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="lg:col-span-2">
            <input v-model="filters.search" type="text" placeholder="Buscar por nombre, edificio, piso..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <select v-model="filters.tipo"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Todos los tipos</option>
              <option v-for="opt in tipoOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <select v-model="filters.estado"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">En Mantenimiento</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button @click="clearFilters"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- DataTable de ubicaciones -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ubicación
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Edificio
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Capacidad
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Bienes Asignados
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="ubicacion in paginatedUbicaciones" :key="ubicacion.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ ubicacion.nombre }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Piso {{ ubicacion.piso }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ ubicacion.edificio }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getTipoClass(ubicacion.tipo)">
                  {{ ubicacion.tipo }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ ubicacion.capacidad }} personas
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getEstadoClass(ubicacion.estado)">
                  {{ ubicacion.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ ubicacion.bienesAsignados }} bienes
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewUbicacion(ubicacion)"
                    class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Ver detalles de la ubicación">
                    <i class="bx bx-show text-lg"></i>
                  </button>
                  <!-- Botones solo para admin -->
                  <button v-if="isAdmin" @click="editUbicacion(ubicacion)"
                    class="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Editar ubicación">
                    <i class="bx bx-edit text-lg"></i>
                  </button>
                  <button v-if="isAdmin" @click="deleteUbicacion(ubicacion.id)"
                    class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Eliminar ubicación">
                    <i class="bx bx-trash text-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Paginación -->
        <div class="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
            {{ Math.min(currentPage * itemsPerPage, filteredUbicaciones.length) }} de
            {{ filteredUbicaciones.length }} ubicaciones
          </div>
          <div class="flex space-x-1">
            <button @click="previousPage" :disabled="currentPage === 1"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50">
              Anterior
            </button>
            <button v-for="page in visiblePages" :key="page" @click="goToPage(page)" :class="[
              'px-3 py-1 rounded',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white',
            ]">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición (solo admin) -->
    <div v-if="(showCreateModal || showEditModal) && isAdmin"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ showEditModal ? 'Editar Ubicación' : 'Nueva Ubicación' }}
        </h2>
        <form @submit.prevent="saveUbicacion" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
              <input v-model="form.nombre" type="text" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edificio *</label>
              <input v-model="form.edificio" type="text" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Piso *</label>
              <input v-model="form.piso" type="number" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de Aula</label>
              <input v-model="form.aula" type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Ej. A-101" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo *</label>
              <select v-model="form.tipo" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleccionar tipo</option>
                <option v-for="opt in tipoOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacidad</label>
              <input v-model="form.capacidad" type="number" min="1"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado *</label>
              <select v-model="form.estado" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleccionar estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="mantenimiento">En Mantenimiento</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea v-model="form.descripcion" rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal"
              class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white transition-colors">
              <i class="bx bx-x text-lg"></i>
              <span>Cancelar</span>
            </button>
            <button type="submit"
              class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <i :class="showEditModal ? 'bx bx-save' : 'bx bx-plus'" class="text-lg"></i>
              <span>{{ showEditModal ? 'Actualizar' : 'Crear' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="showViewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeViewModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Detalles de la Ubicación
        </h2>
        <div v-if="selectedUbicacion" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedUbicacion.nombre }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Edificio</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedUbicacion.edificio }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Piso</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUbicacion.piso }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getTipoClass(selectedUbicacion.tipo)">
                {{ selectedUbicacion.tipo }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Capacidad</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedUbicacion.capacidad }} personas
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getEstadoClass(selectedUbicacion.estado)">
                {{ selectedUbicacion.estado }}
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selectedUbicacion.descripcion }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Bienes Asignados</label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selectedUbicacion.bienesAsignados }} bienes
            </p>
          </div>
          <div class="flex justify-end pt-4">
            <button @click="closeViewModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'
import type { Ubicacion } from '@/types'

interface Props {
  title?: string
  description?: string
  createLabel?: string
  allowedTipos?: string[]
}

interface TipoOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Gestión de Ubicaciones',
  description: 'Administra las ubicaciones físicas de los bienes institucionales',
  createLabel: 'Nueva Ubicación',
})

const headerTitle = computed(() => props.title)
const headerDescription = computed(() => props.description)
const createButtonLabel = computed(() => props.createLabel)

const allTipoOptions: TipoOption[] = [
  { value: 'oficina', label: 'Oficina' },
  { value: 'aula', label: 'Aula' },
  { value: 'laboratorio', label: 'Laboratorio' },
  { value: 'almacen', label: 'Almacén' },
  { value: 'biblioteca', label: 'Biblioteca' },
  { value: 'taller', label: 'Taller' },
]

const allowedTipoSet = computed(() => {
  if (!props.allowedTipos || props.allowedTipos.length === 0) return null
  return new Set(props.allowedTipos.map((t: string) => String(t).toLowerCase()))
})

const tipoOptions = computed(() => {
  const allowed = allowedTipoSet.value
  if (!allowed) return allTipoOptions
  return allTipoOptions.filter((opt) => allowed.has(opt.value))
})

// Stores
const authStore = useAuthStore()
const toast = useToast()

// Control de acceso por rol
const isAdmin = computed(() => authStore.hasRole('Administrador'))

// Estado del componente
const ubicaciones = ref<Ubicacion[]>([])
const loading = ref(false)

const filters = ref({
  search: '',
  tipo: '',
  estado: '',
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const selectedUbicacion = ref<Ubicacion | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const form = ref({
  id: null as number | null,
  nombre: '',
  edificio: '',
  piso: '',
  aula: '',
  tipo: '',
  capacidad: '',
  estado: '',
  descripcion: '',
})

// Métodos de carga de datos
const loadUbicaciones = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/ubicaciones')
    const data = response

    if (data.success) {
      ubicaciones.value = data.data
    } else {
      throw new Error(data.message || 'Error al cargar ubicaciones')
    }
  } catch (error) {
    toast.error('Error al cargar las ubicaciones')
  } finally {
    loading.value = false
  }
}

// Filtros y búsqueda
const filteredUbicaciones = computed(() => {
  let result = ubicaciones.value

  const allowed = allowedTipoSet.value
  if (allowed) {
    result = result.filter((u: Ubicacion) => allowed.has(String(u.tipo || '').toLowerCase()))
  }

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      (u: Ubicacion) =>
        u.nombre.toLowerCase().includes(search) ||
        u.edificio.toLowerCase().includes(search) ||
        u.piso.toString().includes(search)
    )
  }
  if (filters.value.tipo) {
    result = result.filter((u: Ubicacion) => u.tipo === filters.value.tipo)
  }
  if (filters.value.estado) {
    result = result.filter((u: Ubicacion) => u.estado === filters.value.estado)
  }
  return result
})

watch(
  () => filters.value.tipo,
  (value: string) => {
    const allowed = allowedTipoSet.value
    if (!allowed) return
    if (value && !allowed.has(String(value).toLowerCase())) {
      filters.value.tipo = ''
    }
  }
)

// Paginación
const totalPages = computed(() => Math.ceil(filteredUbicaciones.value.length / itemsPerPage.value))
const paginatedUbicaciones = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUbicaciones.value.slice(start, start + itemsPerPage.value)
})
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Clases para badges
const getTipoClass = (tipo: string): string => {
  const map: Record<string, string> = {
    oficina: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    aula: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    laboratorio: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    almacen: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    biblioteca: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    taller: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return map[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const getEstadoClass = (estado: string): string => {
  const map: Record<string, string> = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    mantenimiento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }
  return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Acciones
const clearFilters = () => {
  filters.value = { search: '', tipo: '', estado: '' }
  currentPage.value = 1
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToPage = (page: number) => {
  currentPage.value = page
}

const viewUbicacion = (ubicacion: Ubicacion) => {
  selectedUbicacion.value = ubicacion
  showViewModal.value = true
}

const editUbicacion = (ubicacion: Ubicacion) => {
  if (!isAdmin.value) return
  form.value = {
    id: ubicacion.id,
    nombre: ubicacion.nombre,
    edificio: ubicacion.edificio,
    piso: ubicacion.piso.toString(),
    tipo: ubicacion.tipo,
    capacidad: ubicacion.capacidad?.toString() || '',
    estado: ubicacion.estado,
    descripcion: ubicacion.descripcion || '',
  }
  showEditModal.value = true
}

const deleteUbicacion = async (id: number) => {
  if (!isAdmin.value) return
  if (confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) {
    try {
      const response = await apiClient.delete(`/ubicaciones/${id}`)
      const data = response
      if (data.success) {
        ubicaciones.value = ubicaciones.value.filter((u: Ubicacion) => u.id !== id)
        toast.success('Ubicación eliminada correctamente')
      } else {
        throw new Error(data.message || 'Error al eliminar ubicación')
      }
    } catch (error) {
      toast.error('Error al eliminar la ubicación')
    }
  }
}

const payload = {
  area: form.value.nombre,
  sede: form.value.edificio,
  piso: form.value.piso,
  numero_aula: form.value.aula,
  tipo: form.value.tipo.toLowerCase(),
  capacidad: form.value.capacidad,
  descripcion: form.value.descripcion,
  activo: form.value.estado === 'activo' || form.value.estado === 'mantenimiento' ? 1 : 0
}

let response
if (showEditModal.value && form.value.id) {
  response = await apiClient.put(`/ubicaciones/${form.value.id}`, payload)
} else {
  response = await apiClient.post('/ubicaciones', payload)
}

const data = response
if (data.success) {
  if (showEditModal.value) {
    // Recargar datos para obtener información actualizada
    await loadUbicaciones()
    toast.success('Ubicación actualizada correctamente')
  } else {
    // Recargar datos para obtener la nueva ubicación
    await loadUbicaciones()
    toast.success('Ubicación creada correctamente')
  }
  closeModal()
} else {
  throw new Error(data.message || 'Error al guardar ubicación')
}
  } catch (error: any) {
  console.error('Error saving ubicacion:', error)
  const msg = error.response?.data?.message || error.message || 'Error al guardar la ubicación'
  toast.error(msg)
}
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  form.value = {
    id: null,
    nombre: '',
    edificio: '',
    piso: '',
    tipo: '',
    capacidad: '',
    estado: '',
    descripcion: '',
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedUbicacion.value = null
}

// Lifecycle
onMounted(() => {
  loadUbicaciones()
})
</script>
