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
            Mi Dashboard
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Bienvenido {{ authStore.user?.nombre }}, aquí tienes un resumen de tus bienes asignados
          </p>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Última actualización: {{ formatTime(new Date()) }}</span>
            <span>•</span>
            <span>Rol: {{ authStore.user?.rol }}</span>
          </div>
        </div>
        <div class="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            @click="cargarDatos"
            :disabled="cargando"
            class="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
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

    <!-- Métricas del Usuario -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Mis Bienes"
        :value="metricas.misBienes"
        :change="metricas.incrementoBienes"
        change-type="neutral"
        icon="bx-package"
        color="blue"
        :loading="cargando"
      />
      <MetricCard
        title="Valor Total"
        :value="formatCurrency(metricas.valorTotal)"
        :change="metricas.incrementoValor"
        change-type="neutral"
        icon="bx-dollar-circle"
        color="green"
        :loading="cargando"
      />
      <MetricCard
        title="Mantenimientos"
        :value="metricas.mantenimientosPendientes"
        :subtitle="`${metricas.mantenimientosVencidos} vencidos`"
        icon="bx-wrench"
        color="yellow"
        :loading="cargando"
      />
      <MetricCard
        title="Mis Alertas"
        :value="metricas.alertasActivas"
        :subtitle="`${metricas.alertasCriticas} críticas`"
        icon="bx-bell"
        color="red"
        :loading="cargando"
      />
    </div>

    <!-- Mis Bienes Recientes -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Mis Bienes Recientes</h3>
            <router-link
              to="/bienes"
              class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
            >
              Ver todos
            </router-link>
          </div>
        </div>
        <div class="p-6">
          <div v-if="cargando" class="space-y-4">
            <div v-for="i in 3" :key="i" class="animate-pulse">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="bienes.length === 0" class="text-center py-8">
            <i class="bx bx-package text-4xl text-gray-400 dark:text-gray-600"></i>
            <p class="text-gray-500 dark:text-gray-400 mt-2">No tienes bienes asignados</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="bien in bienes.slice(0, 5)"
              :key="bien.id"
              class="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center"
              >
                <i class="bx bx-package text-primary-600 dark:text-primary-400 text-xl"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 dark:text-white">{{ bien.nombre }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ bien.codigo_institucional }} • {{ bien.categoria?.nombre }}
                </p>
              </div>
              <div class="text-right">
                <span class="text-sm font-medium text-green-600 dark:text-green-400">
                  {{ formatCurrency(bien.valor_adquisicion) }}
                </span>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(bien.fecha_adquisicion) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Próximos Mantenimientos -->
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Próximos Mantenimientos</h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ mantenimientos.length }} programados
            </span>
          </div>
        </div>
        <div class="p-6">
          <div v-if="cargando" class="space-y-4">
            <div v-for="i in 3" :key="i" class="animate-pulse">
              <div class="flex items-center space-x-4">
                <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="mantenimientos.length === 0" class="text-center py-8">
            <i class="bx bx-wrench text-4xl text-gray-400 dark:text-gray-600"></i>
            <p class="text-gray-500 dark:text-gray-400 mt-2">No hay mantenimientos programados</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="mantenimiento in mantenimientos.slice(0, 5)"
              :key="mantenimiento.id"
              class="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center"
              >
                <i class="bx bx-wrench text-yellow-600 dark:text-yellow-400"></i>
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 dark:text-white">
                  {{ mantenimiento.tipo === 'preventivo' ? 'Mantenimiento Preventivo' : mantenimiento.tipo === 'correctivo' ? 'Mantenimiento Correctivo' : 'Mantenimiento Predictivo' }}
                </h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ mantenimiento.bien?.nombre }}
                </p>
                <div class="flex items-center space-x-2 mt-1">
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="getTipoMantenimientoClass(mantenimiento.tipo)"
                  >
                    {{ mantenimiento.tipo }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDate(mantenimiento.fecha_programada) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alertas Recientes -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
    >
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Mis Alertas Recientes</h3>
      </div>
      <div class="p-6">
        <div v-if="cargando" class="space-y-4">
          <div v-for="i in 3" :key="i" class="animate-pulse">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="alertas.length === 0" class="text-center py-8">
          <i class="bx bx-bell text-4xl text-gray-400 dark:text-gray-600"></i>
          <p class="text-gray-500 dark:text-gray-400 mt-2">No tienes alertas activas</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="alerta in alertas.slice(0, 3)"
            :key="alerta.id"
            class="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="getAlertaIconClass(alerta.tipo)"
            >
              <i class="bx bx-bell text-lg"></i>
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 dark:text-white">{{ alerta.tipo === 'mantenimiento' ? 'Mantenimiento Requerido' : alerta.tipo === 'vencimiento' ? 'Próximo a Vencer' : alerta.tipo === 'baja' ? 'Proceso de Baja' : 'Nueva Asignación' }}</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ alerta.mensaje }}</p>
              <div class="flex items-center space-x-2 mt-1">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="getAlertaStatusClass(alerta.tipo)"
                >
                  {{ alerta.tipo }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatTime(alerta.fecha_creacion) }}
                </span>
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
import MetricCard from '@/components/shared/MetricCard.vue'
import type { Asset, Maintenance, Alert } from '@/types'

const authStore = useAuthStore()
const uiStore = useUIStore()
const toast = useToast()

// Estado del componente
const cargando = ref(false)

// Métricas del usuario
const metricas = reactive({
  misBienes: 0,
  incrementoBienes: 0,
  valorTotal: 0,
  incrementoValor: 0,
  mantenimientosPendientes: 0,
  mantenimientosVencidos: 0,
  alertasActivas: 0,
  alertasCriticas: 0,
})

// Datos
const bienes = ref<Asset[]>([])
const mantenimientos = ref<Maintenance[]>([])
const alertas = ref<Alert[]>([])

// Métodos de carga de datos
const cargarDatos = async () => {
  cargando.value = true
  uiStore.setLoading(true)

  if (!authStore.user?.id) {
    cargando.value = false
    uiStore.setLoading(false)
    return
  }

  try {
    // Cargar listas primero
    await Promise.all([cargarBienes(), cargarMantenimientos(), cargarAlertas()])
    
    // Calcular métricas localmente ya que no hay endpoint específico
    calcularMetricas()

    toast.success('Dashboard actualizado correctamente')
  } catch (error) {
    console.error(error)
    toast.error('Error al cargar los datos del dashboard')
  } finally {
    cargando.value = false
    uiStore.setLoading(false)
  }
}

const calcularMetricas = () => {
  metricas.misBienes = bienes.value.length
  metricas.valorTotal = bienes.value.reduce((total, bien) => total + (bien.valor || bien.valor_adquisicion || 0), 0)
  metricas.mantenimientosPendientes = mantenimientos.value.filter(m => m.estado !== 'COMPLETADO').length
  metricas.mantenimientosVencidos = mantenimientos.value.filter(m => m.estado !== 'COMPLETADO' && new Date(m.fecha_programada) < new Date()).length
  metricas.alertasActivas = alertas.value.filter(a => a.estado === 'pendiente').length
  metricas.alertasCriticas = alertas.value.filter(a => a.estado === 'pendiente' && a.prioridad === 'ALTA' || a.tipo_alerta === 'critica').length
}

const cargarBienes = async () => {
  try {
    const response = await fetch(`/api/bienes?responsable=${authStore.user?.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar bienes')

    const data = await response.json()
    if (data.success) {
      bienes.value = data.data
    }
  } catch (error) {
    console.error('Error al cargar bienes:', error)
  }
}

const cargarMantenimientos = async () => {
  try {
    const response = await fetch(`/api/mantenimientos?responsable=${authStore.user?.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar mantenimientos')

    const data = await response.json()
    if (data.success) {
      mantenimientos.value = data.data
    }
  } catch (error) {
    console.error('Error al cargar mantenimientos:', error)
  }
}

const cargarAlertas = async () => {
  try {
    const response = await fetch(`/api/alertas?responsable=${authStore.user?.id}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar alertas')

    const data = await response.json()
    if (data.success) {
      alertas.value = data.data
    }
  } catch (error) {
    console.error('Error al cargar alertas:', error)
  }
}

// Métodos de utilidad
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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

const getTipoMantenimientoClass = (tipo: string): string => {
  const map: Record<string, string> = {
    preventivo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    correctivo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    emergencia: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return map[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const getAlertaIconClass = (tipo: string): string => {
  const map: Record<string, string> = {
    critica: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    advertencia: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    info: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
  }
  return map[tipo] || 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
}

const getAlertaStatusClass = (tipo: string): string => {
  const map: Record<string, string> = {
    critica: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    advertencia: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  }
  return map[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Lifecycle
onMounted(() => {
  cargarDatos()
})
</script>
