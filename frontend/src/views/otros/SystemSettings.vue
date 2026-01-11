<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent"
          >
            Configuración del Sistema
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Ajustes y configuraciones avanzadas del sistema
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            @click="guardarConfiguracion"
            :disabled="guardando"
            class="btn btn-primary flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          >
            <i
              :class="guardando ? 'bx bx-loader-alt animate-spin' : 'bx bx-save'"
              class="text-lg"
            ></i>
            <span>{{ guardando ? 'Guardando...' : 'Guardar Cambios' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Configuración General -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <i class="bx bx-cog mr-2 text-primary-500"></i>
        Configuración General
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre del Sistema
          </label>
          <input
            type="text"
            v-model="configuracion.nombreSistema"
            class="input-field"
            placeholder="Sistema de Gestión de Bienes"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Versión
          </label>
          <input
            type="text"
            v-model="configuracion.version"
            class="input-field"
            placeholder="1.0.0"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Idioma por Defecto
          </label>
          <select v-model="configuracion.idioma" class="input-field">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zona Horaria
          </label>
          <select v-model="configuracion.zonaHoraria" class="input-field">
            <option value="America/Bogota">Bogotá (GMT-5)</option>
            <option value="America/New_York">New York (GMT-5)</option>
            <option value="Europe/Madrid">Madrid (GMT+1)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Configuración de Seguridad -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <i class="bx bx-shield mr-2 text-primary-500"></i>
        Configuración de Seguridad
      </h3>

      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tiempo de Expiración de Sesión (minutos)
            </label>
            <input
              type="number"
              v-model="configuracion.tiempoSesion"
              class="input-field"
              min="5"
              max="1440"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intentos de Login Permitidos
            </label>
            <input
              type="number"
              v-model="configuracion.intentosLogin"
              class="input-field"
              min="1"
              max="10"
            />
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                Autenticación de Dos Factores
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Requiere verificación adicional para el login
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="configuracion.autenticacion2FA"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
              ></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">Logs de Auditoría</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Registrar todas las acciones del sistema
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="configuracion.logsAuditoria" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
              ></div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Configuración de Base de Datos -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <i class="bx bx-data mr-2 text-primary-500"></i>
        Configuración de Base de Datos
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tiempo de Backup Automático (horas)
          </label>
          <input
            type="number"
            v-model="configuracion.tiempoBackup"
            class="input-field"
            min="1"
            max="168"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Retención de Logs (días)
          </label>
          <input
            type="number"
            v-model="configuracion.retencionLogs"
            class="input-field"
            min="1"
            max="365"
          />
        </div>
      </div>

      <div class="mt-6 flex items-center space-x-4">
        <button
          @click="probarConexion"
          :disabled="probandoConexion"
          class="btn btn-outline-primary flex items-center space-x-2"
        >
          <i
            :class="probandoConexion ? 'bx bx-loader-alt animate-spin' : 'bx bx-test-tube'"
            class="text-lg"
          ></i>
          <span>{{ probandoConexion ? 'Probando...' : 'Probar Conexión' }}</span>
        </button>

        <button
          @click="crearBackup"
          :disabled="creandoBackup"
          class="btn btn-outline-green flex items-center space-x-2"
        >
          <i
            :class="creandoBackup ? 'bx bx-loader-alt animate-spin' : 'bx bx-save'"
            class="text-lg"
          ></i>
          <span>{{ creandoBackup ? 'Creando...' : 'Crear Backup' }}</span>
        </button>
      </div>
    </div>

    <!-- Configuración de Notificaciones -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <i class="bx bx-bell mr-2 text-primary-500"></i>
        Configuración de Notificaciones
      </h3>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">
              Notificaciones por Email
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Enviar notificaciones importantes por correo
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="configuracion.notificacionesEmail"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
            ></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">Notificaciones Push</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Mostrar notificaciones en el navegador
            </p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="configuracion.notificacionesPush"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
            ></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Estado del Sistema -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <i class="bx bx-pulse mr-2 text-primary-500"></i>
        Estado del Sistema
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-2">
            <i class="bx bx-check-circle text-green-500 text-xl"></i>
            <span class="text-sm font-medium text-green-700 dark:text-green-400">
              Base de Datos
            </span>
          </div>
          <p class="text-xs text-green-600 dark:text-green-500 mt-1">Conectado</p>
        </div>

        <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-2">
            <i class="bx bx-check-circle text-green-500 text-xl"></i>
            <span class="text-sm font-medium text-green-700 dark:text-green-400"> API </span>
          </div>
          <p class="text-xs text-green-600 dark:text-green-500 mt-1">Funcionando</p>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-2">
            <i class="bx bx-error-circle text-yellow-500 text-xl"></i>
            <span class="text-sm font-medium text-yellow-700 dark:text-yellow-400"> Backup </span>
          </div>
          <p class="text-xs text-yellow-600 dark:text-yellow-500 mt-1">Hace 3 días</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'

// Estados reactivos
const guardando = ref(false)
const probandoConexion = ref(false)
const creandoBackup = ref(false)

// Configuración del sistema
const configuracion = reactive({
  nombreSistema: 'Sistema de Gestión de Bienes INT',
  version: '1.0.0',
  idioma: 'es',
  zonaHoraria: 'America/Bogota',
  tiempoSesion: 120,
  intentosLogin: 3,
  autenticacion2FA: false,
  logsAuditoria: true,
  tiempoBackup: 24,
  retencionLogs: 90,
  notificacionesEmail: true,
  notificacionesPush: true,
})

// Toast para notificaciones
const toast = useToast()

// Métodos
const guardarConfiguracion = async () => {
  guardando.value = true
  try {
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Configuración guardada correctamente')
  } catch (error) {
    toast.error('Error al guardar la configuración')
  } finally {
    guardando.value = false
  }
}

const probarConexion = async () => {
  probandoConexion.value = true
  try {
    // Simular prueba de conexión
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Conexión a la base de datos exitosa')
  } catch (error) {
    toast.error('Error en la conexión a la base de datos')
  } finally {
    probandoConexion.value = false
  }
}

const crearBackup = async () => {
  creandoBackup.value = true
  try {
    // Simular creación de backup
    await new Promise(resolve => setTimeout(resolve, 3000))
    toast.success('Backup creado correctamente')
  } catch (error) {
    toast.error('Error al crear el backup')
  } finally {
    creandoBackup.value = false
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
