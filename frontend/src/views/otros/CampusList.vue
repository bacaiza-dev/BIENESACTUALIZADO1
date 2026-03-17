<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Campus</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Administra los campus disponibles en el sistema
            </p>
          </div>
          <button v-if="isAdmin" @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Campus
          </button>
        </div>
      </div>
    </div>

    <!-- Búsqueda -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="flex gap-4">
          <input v-model="filters.search" type="text" placeholder="Buscar por nombre..."
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
          <button @click="clearFilters"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Campus -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descripción
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="campus in filteredCampus" :key="campus.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ campus.nombre }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                {{ campus.descripcion || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button v-if="isAdmin" @click="editCampus(campus)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button v-if="isAdmin" @click="deleteCampus(campus.id)" title="Eliminar campus"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ showEditModal && form.id ? 'Editar Campus' : 'Nuevo Campus' }}
          </h2>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
            <input v-model="form.nombre" type="text" required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea v-model="form.descripcion" rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
        </div>
        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button @click="closeModals"
            class="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
            Cancelar
          </button>
          <button @click="saveCampus"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuth } from '@/composables/useAuth'
import { confirm } from '@/composables/useConfirm'
import apiClient from '@/api/client'

const toast = useToast()
const { isAdmin } = useAuth()

interface Campus {
  id: number
  id_departamento?: number
  nombre: string
  descripcion?: string
  activo: boolean
}

interface ApiResponse {
  success: boolean
  data?: any
  message?: string
  inUse?: boolean
  ubicacionesCount?: number
}

const campus = ref<Campus[]>([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)

const filters = ref({
  search: '',
})

const form = ref({
  id: null as number | null,
  nombre: '',
  descripcion: '',
})

const filteredCampus = computed(() => {
  let result = campus.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter((c: Campus) =>
      c.nombre.toLowerCase().includes(search) ||
      (c.descripcion?.toLowerCase().includes(search) || false)
    )
  }

  return result
})

const loadCampus = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/campus')
    if (response.success) {
      campus.value = response.data
    } else {
      throw new Error(response.message || 'Error al cargar campus')
    }
  } catch (error) {
    toast.error('Error al cargar los campus')
  } finally {
    loading.value = false
  }
}

const editCampus = (c: Campus) => {
  form.value = {
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion || '',
    activo: c.activo,
  }
  showEditModal.value = true
}

const saveCampus = async () => {
  if (!form.value.nombre.trim()) {
    toast.error('El nombre es requerido')
    return
  }

  // Validación cliente: evitar duplicados (case-insensitive)
  const nombreClean = form.value.nombre.trim().toLowerCase()
  const duplicate = campus.value.find((c: Campus) => c.nombre?.trim().toLowerCase() === nombreClean)
  if (duplicate && !(showEditModal.value && form.value.id === duplicate.id)) {
    toast.error('Ya existe un campus con ese nombre')
    return
  }

  try {
    const payload = {
      nombre: form.value.nombre,
      descripcion: form.value.descripcion,
    }

    let response
    if (showEditModal.value && form.value.id) {
      response = await apiClient.put(`/campus/${form.value.id}`, payload)
    } else {
      response = await apiClient.post('/campus', payload)
    }

    if (response.success) {
      toast.success(showEditModal.value ? 'Campus actualizado' : 'Campus creado')
      closeModals()
      loadCampus()
    } else {
      toast.error(response.message || 'Error al guardar campus')
    }
  } catch (error: any) {
    toast.error(error.message || 'Error al guardar campus')
  }
}

const deleteCampus = async (id: number) => {
  const confirmed = await confirm({
    title: 'Eliminar campus',
    message: '¿Está seguro de que desea eliminar este campus?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    destructive: true,
  })

  if (!confirmed) return

  try {
    const response: ApiResponse = await apiClient.delete(`/campus/${id}`)
    if (response.success) {
      toast.success('Campus eliminado correctamente')
      loadCampus()
    } else {
      if (response.inUse) {
        toast.error(response.message || 'Este campus está en uso y no se puede eliminar')
      } else {
        toast.error(response.message || 'Error al eliminar campus')
      }
    }
  } catch (error: any) {
    toast.error(error.message || 'Error al eliminar campus')
  }
}

const clearFilters = () => {
  filters.value = { search: '' }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  form.value = {
    id: null,
    nombre: '',
    descripcion: '',
  }
}

// Load campus on mount
loadCampus()
</script>
