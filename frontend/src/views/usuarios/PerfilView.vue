<script>
import { ref, reactive, onMounted } from 'vue'

export default {
  name: 'PerfilView',
  setup() {
    const perfil = reactive({
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@institucion.edu',
      telefono: '+57 300 123 4567',
      direccion: 'Calle 123 #45-67, Bogotá',
      cargo: 'Administradora de Sistemas',
      departamento: 'Tecnología de la Información',
      usuario: 'mgonzalez',
      rol: 'Administrador',
      ultimoAcceso: '2024-01-15 10:30',
      foto: null,
    })

    const cambioPassword = reactive({
      actual: '',
      nueva: '',
      confirmar: '',
    })

    const configuracion = reactive({
      notificacionesEmail: true,
      notificacionesPush: false,
      modoOscuro: false,
    })

    const actividadesRecientes = ref([
      {
        id: 1,
        descripcion: 'Inició sesión en el sistema',
        tiempo: '2024-01-15T10:30:00',
      },
      {
        id: 2,
        descripcion: 'Actualizó información de un bien',
        tiempo: '2024-01-15T09:15:00',
      },
      {
        id: 3,
        descripcion: 'Generó reporte de inventario',
        tiempo: '2024-01-14T16:45:00',
      },
      {
        id: 4,
        descripcion: 'Registró nuevo usuario',
        tiempo: '2024-01-14T14:20:00',
      },
    ])

    const toggleDarkMode = () => {
      document.documentElement.classList.toggle('dark')
    }

    const guardarPerfil = () => {
      // Lógica para guardar perfil
    }

    const cambiarFoto = () => {
      // Lógica para cambiar foto
    }

    const cambiarPassword = () => {
      if (cambioPassword.nueva !== cambioPassword.confirmar) {
        alert('Las contraseñas no coinciden')
        return
      }
      // Lógica para cambiar contraseña
    }

    const exportarDatos = () => {
      // Funcionalidad de exportar datos
      console.log('Exportando datos del usuario...')
    }

    const cerrarSesion = () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        // Redirigir al login
        window.location.href = '/login'
      }
    }

    const formatTime = time => {
      const date = new Date(time)
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

      if (diffInHours < 1) {
        return 'Hace unos minutos'
      } else if (diffInHours < 24) {
        return `Hace ${diffInHours} horas`
      } else {
        return date.toLocaleDateString('es-ES')
      }
    }

    onMounted(() => {
      // Cargar datos del perfil desde el backend
    })

    return {
      perfil,
      cambioPassword,
      configuracion,
      actividadesRecientes,
      toggleDarkMode,
      guardarPerfil,
      cambiarFoto,
      cambiarPassword,
      exportarDatos,
      cerrarSesion,
      formatTime,
    }
  },
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          <div class="flex items-center space-x-3">
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
            </button>
            <button
              @click="guardarPerfil"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Información del Perfil -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Información Personal -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Información Personal
              </h3>
            </div>
            <div class="p-6">
              <div class="flex items-center space-x-6 mb-6">
                <div class="relative">
                  <img
                    :src="perfil.foto || '/default-avatar.png'"
                    alt="Foto de perfil"
                    class="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                  />
                  <button
                    @click="cambiarFoto"
                    class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <h4 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ perfil.nombre }} {{ perfil.apellido }}
                  </h4>
                  <p class="text-gray-600 dark:text-gray-400">{{ perfil.cargo }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-500">{{ perfil.departamento }}</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    v-model="perfil.nombre"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Apellido
                  </label>
                  <input
                    v-model="perfil.apellido"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    v-model="perfil.email"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    v-model="perfil.telefono"
                    type="tel"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección
                  </label>
                  <input
                    v-model="perfil.direccion"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Cambio de Contraseña -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Cambio de Contraseña
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña Actual
                </label>
                <input
                  v-model="cambioPassword.actual"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  v-model="cambioPassword.nueva"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  v-model="cambioPassword.confirmar"
                  type="password"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div class="flex justify-end">
                <button
                  @click="cambiarPassword"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>

          <!-- Configuración Personal -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración Personal
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Notificaciones por Email
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Recibir alertas por correo electrónico
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="configuracion.notificacionesEmail"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                    Notificaciones Push
                  </h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Recibir notificaciones en tiempo real
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="configuracion.notificacionesPush"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Modo Oscuro</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Usar tema oscuro por defecto
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="configuracion.modoOscuro" type="checkbox" class="sr-only peer" />
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                  ></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Lateral -->
        <div class="space-y-6">
          <!-- Información de la Cuenta -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Información de la Cuenta
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Usuario</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  perfil.usuario
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Rol</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  perfil.rol
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                <span
                  class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full"
                >
                  Activo
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Último Acceso</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  perfil.ultimoAcceso
                }}</span>
              </div>
            </div>
          </div>

          <!-- Historial de Actividades -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Actividades Recientes
              </h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="actividad in actividadesRecientes"
                  :key="actividad.id"
                  class="flex items-start space-x-3"
                >
                  <div class="flex-shrink-0">
                    <div
                      class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center"
                    >
                      <svg
                        class="w-4 h-4 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900 dark:text-white">{{ actividad.descripcion }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {{ formatTime(actividad.tiempo) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div
            class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Acciones Rápidas</h3>
            </div>
            <div class="p-6 space-y-3">
              <button
                @click="exportarDatos"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <span>Exportar Mis Datos</span>
              </button>
              <button
                @click="cerrarSesion"
                class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
