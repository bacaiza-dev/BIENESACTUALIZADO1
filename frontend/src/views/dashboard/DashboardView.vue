<template>
  <div class="space-y-6">
    <!-- Header -->
    <BaseCard variant="elevated" size="lg" class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Dashboard Ejecutivo
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Panel de control y métricas clave del sistema de gestión de bienes
            </p>
            <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Última actualización: {{ formatTime(new Date()) }}</span>
              <span>•</span>
              <span>Usuario: {{ authStore.user?.nombre }}</span>
            </div>
          </div>
          <div class="mt-4 sm:mt-0">
            <BaseButton
              @click="cargarDatos"
              :loading="cargando"
              :disabled="cargando"
              variant="primary"
              size="md"
              icon="bx bx-refresh"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
            >
              {{ cargando ? 'Cargando...' : 'Actualizar' }}
            </BaseButton>
          </div>
        </div>
    </BaseCard>

    <!-- Métricas Principales -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <MetricCard
        title="Total Bienes"
        :value="metricas.totalBienes"
        :change="metricas.incrementoBienes"
        change-type="increase"
        icon="bx-package"
        color="blue"
        :loading="cargando"
      />
      <MetricCard
        title="Valor Total"
        :value="formatCurrency(metricas.valorTotal)"
        :change="metricas.incrementoValor"
        change-type="increase"
        icon="bx-dollar-circle"
        color="green"
        :loading="cargando"
      />
      <MetricCard
        title="Alertas Activas"
        :value="metricas.alertasActivas"
        :subtitle="`${metricas.alertasCriticas} críticas`"
        icon="bx-error-circle"
        color="yellow"
        :loading="cargando"
      />
      <MetricCard
        title="Usuarios Activos"
        :value="metricas.usuariosActivos"
        :subtitle="`${metricas.nuevosUsuarios} nuevos`"
        icon="bx-group"
        color="purple"
        :loading="cargando"
      />
    </div>

    <!-- Resumen Adicional -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <svg
              class="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              ${{ metricas.valorTotal.toLocaleString() }}
            </p>
            <p class="text-sm text-green-600 dark:text-green-400">
              +{{ metricas.incrementoValor }}% este mes
            </p>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <svg
              class="w-6 h-6 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Alertas Activas</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ metricas.alertasActivas }}
            </p>
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ metricas.alertasCriticas }} críticas
            </p>
          </div>
        </div>
      </div>
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <svg
              class="w-6 h-6 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Usuarios Activos</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ metricas.usuariosActivos }}
            </p>
            <p class="text-sm text-blue-600 dark:text-blue-400">
              {{ metricas.nuevosUsuarios }} nuevos
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficos y Estadísticas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Gráfico de Bienes por Categoría -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Bienes por Categoría
        </h3>
        <div class="space-y-4">
          <div
            v-for="categoria in bienesPorCategoria"
            :key="categoria.nombre"
            class="flex items-center justify-between"
          >
            <div class="flex items-center">
              <div
                class="w-4 h-4 rounded-full mr-3"
                :style="{ backgroundColor: categoria.color }"
              ></div>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ categoria.nombre }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="h-2 rounded-full"
                  :style="{
                    width: categoria.porcentaje + '%',
                    backgroundColor: categoria.color,
                  }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                {{ categoria.cantidad }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráfico de Valor por Ubicación -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Valor por Ubicación
        </h3>
        <div class="space-y-4">
          <div
            v-for="ubicacion in valorPorUbicacion"
            :key="ubicacion.nombre"
            class="flex items-center justify-between"
          >
            <div class="flex items-center">
              <div
                class="w-4 h-4 rounded-full mr-3"
                :style="{ backgroundColor: ubicacion.color }"
              ></div>
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ ubicacion.nombre }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="h-2 rounded-full"
                  :style="{
                    width: ubicacion.porcentaje + '%',
                    backgroundColor: ubicacion.color,
                  }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                ${{ ubicacion.valor.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alertas y Actividades -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Alertas Recientes -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Alertas Recientes</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div
              v-for="alerta in alertasRecientes"
              :key="alerta.id"
              class="flex items-start space-x-3"
            >
              <div class="flex-shrink-0">
                <div
                  :class="getAlertaIconClass(alerta.tipo)"
                  class="w-8 h-8 rounded-full flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ alerta.titulo }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ alerta.descripcion }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {{ formatTime(alerta.tiempo) }}
                </p>
              </div>
              <div class="flex-shrink-0">
                <span
                  :class="getAlertaStatusClass(alerta.tipo)"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ alerta.tipo }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actividades Recientes -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Actividades Recientes</h3>
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
                <p class="text-sm text-gray-900 dark:text-white">
                  <span class="font-medium">{{ actividad.usuario }}</span>
                  {{ actividad.accion }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ actividad.detalle }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {{ formatTime(actividad.tiempo) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useToast } from 'vue-toastification'
import { useErrorHandler } from '@/composables/useErrorHandler'
import MetricCard from '@/components/shared/MetricCard.vue'
import BaseCard from '@/components/shared/BaseCard.vue'
import BaseButton from '@/components/shared/BaseButton.vue'

interface CategoryData {
  nombre: string
  cantidad: number
  porcentaje: number
  color: string
}

interface LocationData {
  nombre: string
  valor: number
  cantidad: number
  porcentaje: number
  color: string
}

interface RecentAlert {
  id: number
  tipo: string
  titulo: string
  descripcion: string
  tiempo: string
}

interface RecentActivity {
  id: number
  usuario: string
  accion: string
  detalle: string
  tiempo: string
}

const authStore = useAuthStore()
const uiStore = useUIStore()
const toast = useToast()
const { handleError, handleSuccess } = useErrorHandler()

// Estado del componente
const cargando = ref(false)

// Métricas del dashboard
const metricas = reactive({
  totalBienes: 0,
  incrementoBienes: 0,
  valorTotal: 0,
  incrementoValor: 0,
  alertasActivas: 0,
  alertasCriticas: 0,
  usuariosActivos: 0,
  nuevosUsuarios: 0,
})

// Datos de gráficos
const bienesPorCategoria = ref<CategoryData[]>([])
const valorPorUbicacion = ref<LocationData[]>([])
const alertasRecientes = ref<RecentAlert[]>([])
const actividadesRecientes = ref<RecentActivity[]>([])

// Computadas
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Métodos
const cargarDatos = async () => {
  cargando.value = true
  uiStore.setLoading(true)

  try {
    // Cargar métricas del dashboard
    await Promise.all([
      cargarMetricas(),
      cargarBienesPorCategoria(),
      cargarValorPorUbicacion(),
      cargarAlertasRecientes(),
      cargarActividadesRecientes(),
    ])

    handleSuccess('Dashboard actualizado correctamente')
  } catch (error) {
    handleError(error, 'carga del dashboard')
  } finally {
    cargando.value = false
    uiStore.setLoading(false)
  }
}

const cargarMetricas = async () => {
  try {
    const response = await fetch('/api/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar métricas')

    const data = await response.json()
    if (data.success) {
      Object.assign(metricas, data.data)
    }
  } catch (error) {
    // Set default values if API fails
    Object.assign(metricas, {
      totalBienes: 0,
      incrementoBienes: 0,
      valorTotal: 0,
      incrementoValor: 0,
      alertasActivas: 0,
      alertasCriticas: 0,
      usuariosActivos: 0,
      nuevosUsuarios: 0,
    })
  }
}

const cargarBienesPorCategoria = async () => {
  try {
    const response = await fetch('/api/dashboard/bienes-por-categoria', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar bienes por categoría')

    const data = await response.json()
    if (data.success) {
      bienesPorCategoria.value = data.data
    }
  } catch (error) {
    bienesPorCategoria.value = []
  }
}

const cargarValorPorUbicacion = async () => {
  try {
    const response = await fetch('/api/dashboard/valor-por-ubicacion', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar valor por ubicación')

    const data = await response.json()
    if (data.success) {
      valorPorUbicacion.value = data.data
    }
  } catch (error) {
    valorPorUbicacion.value = []
  }
}

const cargarAlertasRecientes = async () => {
  try {
    const response = await fetch('/api/dashboard/alertas-recientes', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar alertas recientes')

    const data = await response.json()
    if (data.success) {
      alertasRecientes.value = data.data
    }
  } catch (error) {
    alertasRecientes.value = []
  }
}

const cargarActividadesRecientes = async () => {
  try {
    const response = await fetch('/api/dashboard/actividades-recientes', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar actividades recientes')

    const data = await response.json()
    if (data.success) {
      actividadesRecientes.value = data.data
    }
  } catch (error) {
    actividadesRecientes.value = []
  }
}

const getAlertaIconClass = (tipo: string) => {
  switch (tipo) {
    case 'Crítica':
      return 'w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center'
    case 'Advertencia':
      return 'w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center'
    case 'Info':
      return 'w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'
    default:
      return 'w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center'
  }
}

const getAlertaStatusClass = (tipo: string) => {
  switch (tipo) {
    case 'Crítica':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'Advertencia':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'Info':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const formatTime = (time: string | Date) => {
  const date = new Date(time)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return 'Hace unos minutos'
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} horas`
  } else {
    return date.toLocaleDateString('es-ES')
  }
}

// Lifecycle
onMounted(async () => {
  // Asegurar que el loading se apague después de un tiempo
  setTimeout(() => {
    uiStore.setLoading(false)
  }, 2000)
  
  await cargarDatos()
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
