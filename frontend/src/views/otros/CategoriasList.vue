<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Categorías</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Administra las categorías de bienes institucionales
            </p>
          </div>
          <button
            v-if="isAdmin"
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nueva Categoría
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="lg:col-span-2">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar por nombre, descripción..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <select
              v-model="filters.estado"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div>
            <select
              v-model="filters.tipo"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los tipos</option>
              <option value="tecnologia">Tecnología</option>
              <option value="mobiliario">Mobiliario</option>
              <option value="equipos">Equipos</option>
              <option value="vehiculos">Vehículos</option>
              <option value="herramientas">Herramientas</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- DataTable de categorías -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Categoría
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Descripción
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Bienes Asociados
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Fecha Creación
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="categoria in paginatedCategorias"
              :key="categoria.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      class="h-10 w-10 rounded-full flex items-center justify-center"
                      :class="getCategoriaColor(categoria.tipo)"
                    >
                      <span class="text-sm font-medium text-white">
                        {{ categoria.nombre.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ categoria.nombre }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      Código: {{ categoria.codigo }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getTipoClass(categoria.tipo)"
                >
                  {{ categoria.tipo }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                  {{ categoria.descripcion }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getEstadoClass(categoria.estado)"
                >
                  {{ categoria.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ categoria.bienesAsociados }} bienes
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(categoria.fechaCreacion) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="viewCategoria(categoria)"
                    class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Ver detalles de la categoría"
                  >
                    <i class="bx bx-show text-lg"></i>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="editCategoria(categoria)"
                    class="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Editar categoría"
                  >
                    <i class="bx bx-edit text-lg"></i>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="toggleCategoriaStatus(categoria)"
                    :class="[
                      'p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation',
                      categoria.estado === 'activo'
                        ? 'text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900'
                        : 'text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900'
                    ]"
                    :title="categoria.estado === 'activo' ? 'Desactivar categoría' : 'Activar categoría'"
                  >
                    <i :class="categoria.estado === 'activo' ? 'bx bx-toggle-right' : 'bx bx-toggle-left'" class="text-lg"></i>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="deleteCategoria(categoria.id)"
                    class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Eliminar categoría"
                  >
                    <i class="bx bx-trash text-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Paginación -->
        <div
          class="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700"
        >
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
            {{ Math.min(currentPage * itemsPerPage, filteredCategorias.length) }} de
            {{ filteredCategorias.length }} categorías
          </div>
          <div class="flex space-x-1">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded',
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white',
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ showEditModal ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>
        <form @submit.prevent="saveCategoria" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Nombre *</label
              >
              <input
                v-model="form.nombre"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Código *</label
              >
              <input
                v-model="form.codigo"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Tipo *</label
              >
              <select
                v-model="form.tipo"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar tipo</option>
                <option value="tecnologia">Tecnología</option>
                <option value="mobiliario">Mobiliario</option>
                <option value="equipos">Equipos</option>
                <option value="vehiculos">Vehículos</option>
                <option value="herramientas">Herramientas</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Estado *</label
              >
              <select
                v-model="form.estado"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Descripción</label
            >
            <textarea
              v-model="form.descripcion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Observaciones</label
            >
            <textarea
              v-model="form.observaciones"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {{ showEditModal ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div
      v-if="showViewModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeViewModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Detalles de la Categoría
        </h2>
        <div v-if="selectedCategoria" class="space-y-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-12 w-12">
              <div
                class="h-12 w-12 rounded-full flex items-center justify-center"
                :class="getCategoriaColor(selectedCategoria.tipo)"
              >
                <span class="text-lg font-medium text-white">
                  {{ selectedCategoria.nombre.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ selectedCategoria.nombre }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Código: {{ selectedCategoria.codigo }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getTipoClass(selectedCategoria.tipo)"
              >
                {{ selectedCategoria.tipo }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Estado</label
              >
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getEstadoClass(selectedCategoria.estado)"
              >
                {{ selectedCategoria.estado }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Bienes Asociados</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedCategoria.bienesAsociados }} bienes
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Fecha Creación</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(selectedCategoria.fechaCreacion) }}
              </p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Descripción</label
            >
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selectedCategoria.descripcion }}
            </p>
          </div>
          <div v-if="selectedCategoria.observaciones">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Observaciones</label
            >
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selectedCategoria.observaciones }}
            </p>
          </div>
          <div class="flex justify-end pt-4">
            <button
              @click="closeViewModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import type { Category } from '@/types'

// Stores
const authStore = useAuthStore()
const toast = useToast()

// Control de acceso por rol
const isAdmin = computed(() => authStore.hasRole('Administrador'))

// Estado del componente
const categorias = ref<Category[]>([])
const loading = ref(false)

const filters = ref({
  search: '',
  estado: '',
  tipo: '',
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const selectedCategoria = ref<Category | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const form = ref({
  id: null as number | null,
  nombre: '',
  codigo: '',
  tipo: '',
  descripcion: '',
  estado: '',
  observaciones: '',
})

// Métodos de carga de datos
const loadCategorias = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/categorias', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar categorías')

    const data = await response.json()
    if (data.success) {
      categorias.value = data.data.map((cat: any) => ({
        ...cat,
        codigo: cat.codigo || `CAT-${cat.id.toString().padStart(3, '0')}`,
        tipo: cat.tipo || 'tecnologia',
        bienesAsociados: cat.bienesAsociados || 0,
        fechaCreacion: cat.created_at || new Date().toISOString().split('T')[0],
        estado: cat.activo ? 'activo' : 'inactivo',
      })) || []
    } else {
      throw new Error(data.message || 'Error al cargar categorías')
    }
  } catch (error) {
    toast.error('Error al cargar las categorías')
  } finally {
    loading.value = false
  }
}

// Filtros y búsqueda
const filteredCategorias = computed(() => {
  let result = categorias.value
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      c =>
        c.nombre.toLowerCase().includes(search) ||
        (c.codigo && c.codigo.toLowerCase().includes(search)) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(search))
    )
  }
  if (filters.value.estado) {
    result = result.filter(c => c.estado === filters.value.estado)
  }
  if (filters.value.tipo) {
    result = result.filter(c => c.tipo === filters.value.tipo)
  }
  return result
})

// Paginación
const totalPages = computed(() =>
  Math.ceil(filteredCategorias.value.length / itemsPerPage.value)
)
const paginatedCategorias = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCategorias.value.slice(start, start + itemsPerPage.value)
})
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Clases para badges y colores
const getTipoClass = (tipo: string): string => {
  const map: Record<string, string> = {
    tecnologia: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    mobiliario: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    equipos: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    vehiculos: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    herramientas: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return map[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const getCategoriaColor = (tipo: string): string => {
  const map: Record<string, string> = {
    tecnologia: 'bg-blue-500',
    mobiliario: 'bg-green-500',
    equipos: 'bg-purple-500',
    vehiculos: 'bg-yellow-500',
    herramientas: 'bg-red-500',
  }
  return map[tipo] || 'bg-gray-500'
}

const getEstadoClass = (estado: string): string => {
  const map: Record<string, string> = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Acciones
const clearFilters = () => {
  filters.value = { search: '', estado: '', tipo: '' }
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

const viewCategoria = (categoria: Category) => {
  selectedCategoria.value = categoria
  showViewModal.value = true
}

const editCategoria = (categoria: Category) => {
  form.value = {
    id: categoria.id,
    nombre: categoria.nombre,
    codigo: categoria.codigo || '',
    tipo: categoria.tipo || '',
    descripcion: categoria.descripcion || '',
    estado: categoria.estado || 'activo',
    observaciones: categoria.observaciones || '',
  }
  showEditModal.value = true
}

const toggleCategoriaStatus = async (categoria: Category) => {
  try {
    const newStatus = categoria.estado === 'activo' ? 'inactivo' : 'activo'
    const response = await fetch(`/api/categorias/${categoria.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        activo: newStatus === 'activo',
      }),
    })

    if (!response.ok) throw new Error('Error al cambiar estado')

    const data = await response.json()
    if (data.success) {
      const index = categorias.value.findIndex(c => c.id === categoria.id)
      if (index !== -1) {
        categorias.value[index].estado = newStatus
      }
      toast.success(`Categoría ${newStatus === 'activo' ? 'activada' : 'desactivada'} correctamente`)
    } else {
      throw new Error(data.message || 'Error al cambiar estado')
    }
  } catch (error) {
    toast.error('Error al cambiar el estado de la categoría')
  }
}

const deleteCategoria = async (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })

      if (!response.ok) throw new Error('Error al eliminar categoría')

      const data = await response.json()
      if (data.success) {
        categorias.value = categorias.value.filter(c => c.id !== id)
        toast.success('Categoría eliminada correctamente')
      } else {
        throw new Error(data.message || 'Error al eliminar categoría')
      }
    } catch (error) {
      toast.error('Error al eliminar la categoría')
    }
  }
}

const saveCategoria = async () => {
  try {
    const method = showEditModal.value ? 'PUT' : 'POST'
    const endpoint = showEditModal.value
      ? `/api/categorias/${form.value.id}`
      : '/api/categorias'

    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: form.value.nombre,
        descripcion: form.value.descripcion,
        activo: form.value.estado === 'activo',
      }),
    })

    if (!response.ok) throw new Error('Error al guardar categoría')

    const data = await response.json()
    if (data.success) {
      if (showEditModal.value) {
        const index = categorias.value.findIndex(c => c.id === form.value.id)
        if (index !== -1) {
          // Recargar datos para obtener información actualizada
          await loadCategorias()
        }
        toast.success('Categoría actualizada correctamente')
      } else {
        // Recargar datos para obtener la nueva categoría
        await loadCategorias()
        toast.success('Categoría creada correctamente')
      }
      closeModal()
    } else {
      throw new Error(data.message || 'Error al guardar categoría')
    }
  } catch (error) {
    toast.error('Error al guardar la categoría')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  form.value = {
    id: null,
    nombre: '',
    codigo: '',
    tipo: '',
    descripcion: '',
    estado: '',
    observaciones: '',
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedCategoria.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-EC', {
    timeZone: 'America/Guayaquil'
  })
}

// Control de acceso por rol al cargar
onMounted(async () => {
  // Cargar categorías para todos los usuarios
  await loadCategorias()
})
</script>
