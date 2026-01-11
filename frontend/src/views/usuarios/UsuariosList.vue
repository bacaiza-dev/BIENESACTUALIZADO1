<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Administra usuarios del sistema institucional
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
            Nuevo Usuario
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="lg:col-span-2">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar por nombre, email, cédula..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <select
              v-model="filters.rol"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los roles</option>
              <option v-for="rol in roles" :key="rol.id" :value="rol.nombre">
                {{ rol.nombre }}
              </option>
            </select>
          </div>
          <div>
            <select
              v-model="filters.estado"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
          <div>
            <select
              v-model="filters.departamento"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los departamentos</option>
              <option
                v-for="departamento in departamentos"
                :key="departamento.id"
                :value="departamento.nombre"
              >
                {{ departamento.nombre }}
              </option>
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

    <!-- DataTable de usuarios -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Usuario
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
Cédula
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Departamento
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Rol
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-4 text-center">
                <div class="flex items-center justify-center">
                  <svg
                    class="animate-spin h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Cargando usuarios...
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedUsers.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No se encontraron usuarios
              </td>
            </tr>
            <tr
              v-else
              v-for="user in paginatedUsers"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div
                      class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
                    >
                      <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {{ user.nombre.charAt(0).toUpperCase()
                        }}{{ user.apellido?.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.nombre }} {{ user.apellido }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ user.documento }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ user.departamento }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getRolClass(user.rol)"
                >
                  {{ user.rol }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getEstadoClass(user.estado)"
                >
                  {{ user.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="viewUser(user)"
                    class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Ver detalles del usuario"
                  >
                    <i class="bx bx-show text-lg"></i>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="editUser(user)"
                    class="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Editar usuario"
                  >
                    <i class="bx bx-edit text-lg"></i>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="toggleUserStatus(user)"
                    :class="[
                      'p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation',
                      user.estado === 'activo'
                        ? 'text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900'
                        : 'text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900'
                    ]"
                    :title="user.estado === 'activo' ? 'Desactivar usuario' : 'Activar usuario'"
                  >
                    <i :class="user.estado === 'activo' ? 'bx bx-user-x' : 'bx bx-user-check'" class="text-lg"></i>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="deleteUser(user.id)"
                    class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Eliminar usuario"
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
            {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} de
            {{ filteredUsers.length }} usuarios
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
          {{ showEditModal ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h2>
        <form @submit.prevent="saveUser" class="space-y-4">
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
                >Apellido *</label
              >
              <input
                v-model="form.apellido"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Email *</label
              >
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Cédula *</label
              >
              <input
                v-model="form.documento"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Departamento *</label
              >
              <input
                v-model="form.departamento"
                type="text"
                required
                list="departamentos-list"
                placeholder="Ingresa o selecciona el departamento"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <datalist id="departamentos-list">
                <option value="Diseño Gráfico y Multimedia"></option>
                <option value="Administración"></option>
                <option value="Desarrollo de Software"></option>
                <option
                  v-for="departamento in departamentos"
                  :key="departamento.id"
                  :value="departamento.nombre"
                ></option>
              </datalist>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Rol *</label
              >
              <select
                v-model="form.rol"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar rol</option>
                <option v-for="rol in roles" :key="rol.id" :value="rol.nombre">
                  {{ rol.nombre }}
                </option>
              </select>
            </div>
            <div v-if="!showEditModal">
              <BaseInput
                v-model="form.password"
                type="password"
                label="Contraseña *"
                placeholder="Ingresa la contraseña"
                required
                :show-password-toggle="true"
              />
            </div>
            <div v-if="!showEditModal">
              <BaseInput
                v-model="form.confirmPassword"
                type="password"
                label="Confirmar Contraseña *"
                placeholder="Confirma la contraseña"
                required
                :show-password-toggle="true"
              />
            </div>
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
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Detalles del Usuario</h2>
        <div v-if="selectedUser" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Nombre</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedUser.nombre }} {{ selectedUser.apellido }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Email</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Cédula</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedUser.documento }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Departamento</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedUser.departamento }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getRolClass(selectedUser.rol)"
              >
                {{ selectedUser.rol }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Estado</label
              >
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getEstadoClass(selectedUser.estado)"
              >
                {{ selectedUser.estado }}
              </span>
            </div>
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
import BaseInput from '@/components/shared/BaseInput.vue'
import type { User, Role } from '@/types'

// Stores
const authStore = useAuthStore()
const toast = useToast()

// Control de acceso por rol
const isAdmin = computed(() => authStore.hasRole('Administrador'))

// Estado del componente
const users = ref<User[]>([])
const roles = ref<Role[]>([])
const departamentos = ref<any[]>([])
const loading = ref(false)

const filters = ref({
  search: '',
  rol: '',
  estado: '',
  departamento: '',
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const selectedUser = ref<User | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const form = ref({
  id: null as number | null,
  nombre: '',
  apellido: '',
  email: '',
  documento: '',
  departamento: '',
  rol: '',
  password: '',
  confirmPassword: '',
  telefono: '',
})

// Filtros y búsqueda
const filteredUsers = computed(() => {
  let result = users.value
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      u =>
        u.nombre.toLowerCase().includes(search) ||
        u.apellido?.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.documento?.includes(search)
    )
  }
  if (filters.value.rol) {
    result = result.filter(u => u.rol === filters.value.rol)
  }
  if (filters.value.estado) {
    result = result.filter(u => u.estado === filters.value.estado)
  }
  if (filters.value.departamento) {
    result = result.filter(u => u.departamento === filters.value.departamento)
  }
  return result
})

// Paginación
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUsers.value.slice(start, start + itemsPerPage.value)
})
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Clases para badges
const getRolClass = (rol: string): string => {
  const map: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    usuario: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    tecnico: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    supervisor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }
  return map[rol] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const getEstadoClass = (estado: string): string => {
  const map: Record<string, string> = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }
  return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Métodos de carga de datos
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/usuarios', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) throw new Error('Error al cargar usuarios')

    const data = await response.json()
    if (data.success) {
      users.value = data.data || []
    } else {
      throw new Error(data.message || 'Error al cargar usuarios')
    }
  } catch (error) {
    console.error('Error loading users:', error)
    users.value = []
    toast.error('Error al cargar los usuarios. Intente nuevamente.')
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const response = await fetch('/api/roles', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar roles')

    const data = await response.json()
    if (data.success) {
      roles.value = data.data || []
    }
  } catch (error) {
    console.error('Error al cargar roles:', error)
    roles.value = []
    toast.error('Error al cargar los roles')
  }
}

const loadDepartamentos = async () => {
  try {
    const response = await fetch('/api/departamentos', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar departamentos')

    const data = await response.json()
    if (data.success) {
      departamentos.value = data.data
    }
  } catch (error) {
    console.error('Error al cargar departamentos:', error)
  }
}

// Acciones
const clearFilters = () => {
  filters.value = { search: '', rol: '', estado: '', departamento: '' }
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

const viewUser = (user: User) => {
  selectedUser.value = user
  showViewModal.value = true
}

const editUser = (user: User) => {
  form.value = {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido || '',
    email: user.email,
    documento: user.documento || '',
    departamento: user.departamento || '',
    rol: user.rol || '',
    password: '',
    confirmPassword: '',
    telefono: user.telefono || '',
  }
  showEditModal.value = true
}

const toggleUserStatus = async (user: User) => {
  try {
    const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo'
    const response = await fetch(`/api/usuarios/${user.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        documento: user.documento,
        departamento: user.departamento,
        rol: user.rol,
        activo: newStatus === 'activo'
      }),
    })

    if (!response.ok) throw new Error('Error al cambiar estado')

    const data = await response.json()
    if (data.success) {
      const index = users.value.findIndex(u => u.id === user.id)
      if (index !== -1) {
        users.value[index].estado = newStatus
      }
      toast.success(`Usuario ${newStatus === 'activo' ? 'activado' : 'desactivado'} correctamente`)
    } else {
      throw new Error(data.message || 'Error al cambiar estado')
    }
  } catch (error) {
    toast.error('Error al cambiar el estado del usuario')
  }
}

const deleteUser = async (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Error al eliminar usuario')

      const data = await response.json()
      if (data.success) {
        users.value = users.value.filter(u => u.id !== id)
        toast.success('Usuario eliminado correctamente')
      } else {
        throw new Error(data.message || 'Error al eliminar usuario')
      }
    } catch (error) {
      toast.error('Error al eliminar el usuario')
    }
  }
}

const saveUser = async () => {
  try {
    if (form.value.password !== form.value.confirmPassword && !showEditModal.value) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    const method = showEditModal.value ? 'PUT' : 'POST'
    const endpoint = showEditModal.value ? `/api/usuarios/${form.value.id}` : '/api/usuarios'

    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...form.value,
        confirmPassword: undefined, // No enviar confirmación al backend
      }),
    })

    if (!response.ok) throw new Error('Error al guardar usuario')

    const data = await response.json()
    if (data.success) {
      if (showEditModal.value) {
        // Recargar datos para obtener información actualizada
        await loadUsers()
        toast.success('Usuario actualizado correctamente')
      } else {
        // Recargar datos para obtener el nuevo usuario
        await loadUsers()
        toast.success('Usuario creado correctamente')
      }
      closeModal()
    } else {
      throw new Error(data.message || 'Error al guardar usuario')
    }
  } catch (error) {
    toast.error('Error al guardar el usuario')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  form.value = {
    id: null,
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    departamento: '',
    rol: '',
    password: '',
    confirmPassword: '',
    telefono: '',
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedUser.value = null
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Nunca'
  return new Date(dateString).toLocaleDateString('es-EC', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Control de acceso por rol al cargar
onMounted(async () => {
  if (!isAdmin.value) {
    toast.error('Acceso denegado: solo administradores pueden gestionar usuarios')
    return
  }

  await Promise.all([loadUsers(), loadRoles(), loadDepartamentos()])
})
</script>
