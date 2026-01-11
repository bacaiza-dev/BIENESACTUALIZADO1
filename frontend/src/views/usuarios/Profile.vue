<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg
                v-if="!isDarkMode"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="lg:col-span-1">
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div class="text-center">
              <div class="relative inline-block">
                <div
                  class="h-24 w-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mx-auto mb-4"
                >
                  <span class="text-2xl font-bold text-white">
                    {{ userProfile.nombre.charAt(0).toUpperCase()
                    }}{{ userProfile.apellido.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <button
                  @click="avatarInput?.click()"
                  class="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg
                    class="w-4 h-4 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </button>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  @change="handleAvatarChange"
                  class="hidden"
                />
              </div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ userProfile.nombre }} {{ userProfile.apellido }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400">{{ userProfile.email }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">{{ userProfile.rol }}</p>
            </div>

            <div class="mt-6 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Estado de la cuenta</span
                >
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  Activa
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Content -->
        <div class="lg:col-span-2">
          <div class="space-y-6">
            <!-- Personal Information -->
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  Información Personal
                </h3>
                <button
                  v-if="authStore.isAdmin"
                  @click="editPersonalInfo"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                >
                  {{ editingPersonal ? 'Cancelar' : 'Editar' }}
                </button>
              </div>

              <form v-if="editingPersonal" @submit.prevent="savePersonalInfo" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre
                    </label>
                    <input
                      v-model="personalForm.nombre"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellido
                    </label>
                    <input
                      v-model="personalForm.apellido"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    v-model="personalForm.email"
                    type="email"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="cancelPersonalEdit"
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="saving"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    {{ saving ? 'Guardando...' : 'Guardar' }}
                  </button>
                </div>
              </form>

              <div v-else class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre
                    </label>
                    <p class="text-sm text-gray-900 dark:text-white">{{ userProfile.nombre }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apellido
                    </label>
                    <p class="text-sm text-gray-900 dark:text-white">{{ userProfile.apellido }}</p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <p class="text-sm text-gray-900 dark:text-white">{{ userProfile.email }}</p>
                </div>
              </div>
            </div>

            <!-- Change Password -->
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                  Cambiar Contraseña
                </h3>
                <button
                  @click="showPasswordForm = !showPasswordForm"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                >
                  {{ showPasswordForm ? 'Cancelar' : 'Cambiar' }}
                </button>
              </div>

              <form v-if="showPasswordForm" @submit.prevent="changePassword" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="cancelPasswordChange"
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="changingPassword"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    {{ changingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Preferences -->
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferencias</h3>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notificaciones por Email
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Recibir notificaciones importantes por email
                    </p>
                  </div>
                  <button
                    @click="toggleEmailNotifications"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      preferences.emailNotifications
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700',
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1',
                      ]"
                    ></span>
                  </button>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notificaciones Push
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Recibir notificaciones en tiempo real
                    </p>
                  </div>
                  <button
                    @click="togglePushNotifications"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      preferences.pushNotifications
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700',
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1',
                      ]"
                    ></span>
                  </button>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Modo Oscuro
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Usar tema oscuro por defecto
                    </p>
                  </div>
                  <button
                    @click="toggleDarkModePreference"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      preferences.darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        preferences.darkMode ? 'translate-x-6' : 'translate-x-1',
                      ]"
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Security -->
            <div
              class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Seguridad</h3>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Autenticación de Dos Factores
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Agregar una capa extra de seguridad
                    </p>
                  </div>
                  <button
                    @click="setupTwoFactor"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Configurar
                  </button>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sesiones Activas
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Gestionar dispositivos conectados
                    </p>
                  </div>
                  <button
                    @click="viewActiveSessions"
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Ver Sesiones
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'
import type { User } from '@/types'

const authStore = useAuthStore()
const uiStore = useUIStore()
const toast = useToast()

// Reactive data
const isDarkMode = ref(false)
const editingPersonal = ref(false)
const showPasswordForm = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const loading = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)

// Form data
const personalForm = ref({
  nombre: '',
  apellido: '',
  email: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// User profile data
const userProfile = ref<User>({
  id: 0,
  nombre: '',
  apellido: '',
  email: '',
  rol: '',
  estado: 'activo',
  documento: '',
  departamento: '',
  roles: [],
  activo: true,
  created_at: '',
  updated_at: '',
})

// User preferences
const preferences = ref({
  emailNotifications: true,
  pushNotifications: false,
  darkMode: false,
})

// Métodos de carga de datos
const loadUserProfile = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/auth/profile')
    if (response.success) {
      const data = response
      const userData = data.data.user
      userProfile.value = {
        id: userData.id,
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        rol: data.data.roles[0]?.nombre || 'Usuario',
        estado: userData.activo ? 'activo' : 'inactivo',
        documento: userData.documento,
        departamento: userData.departamento || '',
        roles: data.data.roles || [],
        activo: userData.activo,
        created_at: userData.created_at || '',
        updated_at: userData.updated_at || '',
      }
      
      // También actualizar el formulario personal
      personalForm.value = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
      }
    } else {
      throw new Error(data.message || 'Error al cargar perfil')
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
    // Use auth store user data as fallback
    if (authStore.user) {
      userProfile.value = {
        id: authStore.user.id,
        nombre: authStore.user.nombre,
        apellido: authStore.user.apellido,
        email: authStore.user.email,
        rol: authStore.user.rol,
        estado: authStore.user.estado,
        documento: authStore.user.documento,
        departamento: authStore.user.departamento,
        roles: authStore.user.roles,
        activo: authStore.user.activo,
        created_at: authStore.user.created_at,
        updated_at: authStore.user.updated_at,
      }
    }
    toast.error('Error al cargar el perfil del usuario')
  } finally {
    loading.value = false
  }
}

const loadUserPreferences = async () => {
  try {
    // Load preferences from localStorage first
    const savedPreferences = localStorage.getItem('user_preferences')
    if (savedPreferences) {
      Object.assign(preferences.value, JSON.parse(savedPreferences))
    } else {
      // Set default preferences if none saved
      Object.assign(preferences.value, {
        emailNotifications: true,
        pushNotifications: false,
        darkMode: false,
      })
    }
  } catch (error) {
    // Set default preferences if loading fails
    Object.assign(preferences.value, {
      emailNotifications: true,
      pushNotifications: false,
      darkMode: false,
    })
  }
}

// Métodos de utilidad
const toggleDarkMode = () => {
  uiStore.toggleDarkMode()
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'No disponible'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    try {
      // API endpoint not available
      toast.error('Función de subida de avatar no disponible temporalmente')
      throw new Error('Avatar upload endpoint not available')
    } catch (error) {
      toast.error('Error al actualizar el avatar')
    }
  }
}

const editPersonalInfo = () => {
  editingPersonal.value = true
  personalForm.value = {
    nombre: userProfile.value.nombre,
    apellido: userProfile.value.apellido,
    email: userProfile.value.email,
  }
}

const cancelPersonalEdit = () => {
  editingPersonal.value = false
  personalForm.value = {
    nombre: '',
    apellido: '',
    email: '',
  }
}

const savePersonalInfo = async () => {
  saving.value = true
  try {
    const response = await apiClient.put('/auth/profile', personalForm.value)
    
    if (response.success) {
      // Actualizar el perfil con los datos devueltos
      userProfile.value = { ...userProfile.value, ...personalForm.value }
      editingPersonal.value = false
      toast.success('Perfil actualizado correctamente')
    } else {
      throw new Error(response.message || 'Error al guardar perfil')
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error('Error al actualizar el perfil')
  } finally {
    saving.value = false
  }
}

const cancelPasswordChange = () => {
  showPasswordForm.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Las contraseñas no coinciden')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    toast.error('La nueva contraseña debe tener al menos 6 caracteres')
    return
  }

  changingPassword.value = true
  try {
    const response = await apiClient.put('/auth/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })

    if (response.success) {
      showPasswordForm.value = false
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
      toast.success('Contraseña actualizada correctamente')
    } else {
      throw new Error(response.message || 'Error al cambiar la contraseña')
    }
  } catch (error) {
    console.error('Error changing password:', error)
    toast.error(error.message || 'Error al cambiar la contraseña')
  } finally {
    changingPassword.value = false
  }
}

const savePreferences = async () => {
  try {
    // API endpoint not available, saving locally only
    localStorage.setItem('user_preferences', JSON.stringify(preferences.value))
    toast.success('Preferencias guardadas localmente')
  } catch (error) {
    toast.error('Error al actualizar las preferencias')
  }
}

const toggleEmailNotifications = () => {
  preferences.value.emailNotifications = !preferences.value.emailNotifications
  savePreferences()
}

const togglePushNotifications = () => {
  preferences.value.pushNotifications = !preferences.value.pushNotifications
  savePreferences()
}

const toggleDarkModePreference = () => {
  preferences.value.darkMode = !preferences.value.darkMode
  uiStore.toggleDarkMode()
  savePreferences()
}

const setupTwoFactor = () => {
  toast.info('Funcionalidad de autenticación de dos factores próximamente')
}

const viewActiveSessions = () => {
  toast.info('Gestión de sesiones activas próximamente')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadUserProfile(), loadUserPreferences()])
})
</script>

<style scoped>
/* Custom scrollbar for dark mode */
.dark ::-webkit-scrollbar {
  width: 8px;
}

.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
