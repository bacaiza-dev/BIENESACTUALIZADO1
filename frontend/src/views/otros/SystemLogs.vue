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
            Logs del Sistema
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Monitoreo y registro de actividades del sistema
          </p>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            @click="actualizarLogs"
            :disabled="cargando"
            class="btn btn-primary flex items-center space-x-2 transition-all duration-300 hover:scale-105"
          >
            <i
              :class="cargando ? 'bx bx-loader-alt animate-spin' : 'bx bx-refresh'"
              class="text-lg"
            ></i>
            <span>{{ cargando ? 'Cargando...' : 'Actualizar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nivel
          </label>
          <select v-model="filtros.nivel" @change="aplicarFiltros" class="input-field">
            <option value="">Todos los niveles</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Módulo
          </label>
          <select v-model="filtros.modulo" @change="aplicarFiltros" class="input-field">
            <option value="">Todos los módulos</option>
            <option value="auth">Autenticación</option>
            <option value="bienes">Bienes</option>
            <option value="usuarios">Usuarios</option>
            <option value="api">API</option>
            <option value="database">Base de Datos</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha Desde
          </label>
          <input
            type="date"
            v-model="filtros.fechaDesde"
            @change="aplicarFiltros"
            class="input-field"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha Hasta
          </label>
          <input
            type="date"
            v-model="filtros.fechaHasta"
            @change="aplicarFiltros"
            class="input-field"
          />
        </div>
      </div>
    </div>

    <!-- Logs -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
    >
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Registros del Sistema ({{ logsFiltrados.length }})
          </h3>
          <button @click="limpiarLogs" class="btn btn-outline-red flex items-center space-x-2">
            <i class="bx bx-trash"></i>
            <span>Limpiar Logs</span>
          </button>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        <div v-if="cargando" class="p-6 text-center">
          <div class="inline-flex items-center space-x-2">
            <i class="bx bx-loader-alt animate-spin text-2xl text-primary-500"></i>
            <span class="text-gray-600 dark:text-gray-400">Cargando logs...</span>
          </div>
        </div>

        <div v-else-if="logsFiltrados.length === 0" class="p-6 text-center">
          <i class="bx bx-info-circle text-4xl text-gray-400 dark:text-gray-600 mb-2"></i>
          <p class="text-gray-600 dark:text-gray-400">No hay logs disponibles</p>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="log in logsFiltrados"
            :key="log.id"
            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0">
                <div
                  :class="{
                    'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400':
                      log.nivel === 'info',
                    'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400':
                      log.nivel === 'warning',
                    'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400':
                      log.nivel === 'error',
                    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400':
                      log.nivel === 'debug',
                  }"
                  class="p-2 rounded-lg"
                >
                  <i
                    :class="{
                      'bx bx-info-circle': log.nivel === 'info',
                      'bx bx-error-circle': log.nivel === 'warning',
                      'bx bx-x-circle': log.nivel === 'error',
                      'bx bx-code-alt': log.nivel === 'debug',
                    }"
                    class="text-lg"
                  ></i>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-1">
                  <span
                    :class="{
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200':
                        log.nivel === 'info',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
                        log.nivel === 'warning',
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200':
                        log.nivel === 'error',
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200':
                        log.nivel === 'debug',
                    }"
                    class="px-2 py-1 text-xs font-medium rounded-full uppercase"
                  >
                    {{ log.nivel }}
                  </span>
                  <span
                    class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full"
                  >
                    {{ log.modulo }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatearFecha(log.timestamp) }}
                  </span>
                </div>

                <p class="text-sm text-gray-900 dark:text-white font-medium mb-1">
                  {{ log.mensaje }}
                </p>

                <div
                  v-if="log.detalles"
                  class="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded mt-2 font-mono"
                >
                  {{ log.detalles }}
                </div>

                <div v-if="log.usuario" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Usuario: {{ log.usuario }}
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

// Estados reactivos
const cargando = ref(false)
const logs = ref([
  {
    id: 1,
    timestamp: new Date('2024-01-15T10:30:00'),
    nivel: 'info',
    modulo: 'auth',
    mensaje: 'Usuario autenticado exitosamente',
    usuario: 'admin@int.edu.co',
    detalles: null,
  },
  {
    id: 2,
    timestamp: new Date('2024-01-15T10:25:00'),
    nivel: 'warning',
    modulo: 'bienes',
    mensaje: 'Bien con ID 123 próximo a vencer garantía',
    usuario: 'user@int.edu.co',
    detalles: 'Vencimiento: 2024-02-01',
  },
  {
    id: 3,
    timestamp: new Date('2024-01-15T10:20:00'),
    nivel: 'error',
    modulo: 'database',
    mensaje: 'Error de conexión a la base de datos',
    usuario: 'system',
    detalles: 'Connection timeout after 30 seconds',
  },
  {
    id: 4,
    timestamp: new Date('2024-01-15T10:15:00'),
    nivel: 'debug',
    modulo: 'api',
    mensaje: 'Procesando solicitud GET /api/v1/bienes',
    usuario: 'admin@int.edu.co',
    detalles: 'Response time: 245ms',
  },
])

// Filtros
const filtros = reactive({
  nivel: '',
  modulo: '',
  fechaDesde: '',
  fechaHasta: '',
})

// Toast para notificaciones
const toast = useToast()

// Computed
const logsFiltrados = computed(() => {
  let resultado = logs.value

  if (filtros.nivel) {
    resultado = resultado.filter(log => log.nivel === filtros.nivel)
  }

  if (filtros.modulo) {
    resultado = resultado.filter(log => log.modulo === filtros.modulo)
  }

  if (filtros.fechaDesde) {
    const fechaDesde = new Date(filtros.fechaDesde)
    resultado = resultado.filter(log => log.timestamp >= fechaDesde)
  }

  if (filtros.fechaHasta) {
    const fechaHasta = new Date(filtros.fechaHasta)
    fechaHasta.setHours(23, 59, 59, 999)
    resultado = resultado.filter(log => log.timestamp <= fechaHasta)
  }

  return resultado.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
})

// Métodos
const actualizarLogs = async () => {
  cargando.value = true
  try {
    // Simular carga de logs
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Logs actualizados correctamente')
  } catch (error) {
    toast.error('Error al cargar los logs')
  } finally {
    cargando.value = false
  }
}

const aplicarFiltros = () => {
  // Los filtros se aplican automáticamente por el computed
}

const limpiarLogs = () => {
  logs.value = []
  toast.info('Logs limpiados')
}

const formatearFecha = (fecha: Date) => {
  return fecha.toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  // Configurar fecha por defecto (últimos 7 días)
  const hoy = new Date()
  const sieteDiasAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)

  filtros.fechaDesde = sieteDiasAtras.toISOString().split('T')[0]
  filtros.fechaHasta = hoy.toISOString().split('T')[0]
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
