<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Reportes y Análisis</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Genera reportes detallados y análisis estadísticos de los bienes institucionales
            </p>
          </div>
          <div class="flex items-center space-x-3">
            <button @click="toggleDarkMode"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            </button>
            <button @click="exportarReporte"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
              </svg>
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtros de Reporte</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Reporte
            </label>
            <select v-model="filtros.tipoReporte"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">Todos los reportes</option>
              <option value="inventario">Inventario General</option>
              <option value="depreciacion">Depreciación</option>
              <option value="ubicacion">Por Ubicación</option>
              <option value="categoria">Por Categoría</option>
              <option value="estado">Por Estado</option>
              <option value="valor">Análisis de Valor</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha Desde
            </label>
            <input type="date" v-model="filtros.fechaDesde"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha Hasta
            </label>
            <input type="date" v-model="filtros.fechaHasta"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select v-model="filtros.categoria"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="">Todas las categorías</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                {{ cat.nombre }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button @click="generarReporte" :disabled="generandoReporte"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
            <svg v-if="generandoReporte" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            <span>{{ generandoReporte ? 'Generando...' : 'Generar Reporte' }}</span>
          </button>
        </div>
      </div>

      <!-- Estadísticas Rápidas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                </path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bienes</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ estadisticas.totalBienes || 0 }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1">
                </path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                ${{ (estadisticas.valorTotal || 0).toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Último Reporte</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ estadisticas.ultimoReporte || 'N/A' }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                </path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Reportes Generados</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ estadisticas.reportesGenerados || 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reportes Generados -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Reportes Generados</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Generado Por
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="cargandoReportes">
                <td colspan="5" class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center">
                    <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    Cargando reportes...
                  </div>
                </td>
              </tr>
              <tr v-else-if="reportesGenerados.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No hay reportes generados
                </td>
              </tr>
              <tr v-else v-for="reporte in reportesGenerados" :key="reporte.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-8 w-8">
                      <div class="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                          </path>
                        </svg>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ reporte.tipo }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ reporte.descripcion }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ formatDate(reporte.fecha) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {{ reporte.generadoPor }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getEstadoClass(reporte.estado)">
                    {{ reporte.estado }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button @click="verReporte(reporte)"
                      class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                      title="Ver reporte">
                      <i class="bx bx-show text-lg"></i>
                    </button>
                    <button @click="descargarReporte(reporte)"
                      class="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                      title="Descargar reporte">
                      <i class="bx bx-download text-lg"></i>
                    </button>
                    <button @click="eliminarReporte(reporte.id)"
                      class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                      title="Eliminar reporte">
                      <i class="bx bx-trash text-lg"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de vista de reporte -->
    <div v-if="mostrarModalReporte"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cerrarModalReporte">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ reporteSeleccionado?.tipo }}
          </h2>
          <button @click="cerrarModalReporte" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="reporteSeleccionado" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">Información del Reporte</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">Fecha:</span> {{ formatDate(reporteSeleccionado.fecha) }}
              </div>
              <div>
                <span class="font-medium">Generado por:</span> {{ reporteSeleccionado.generadoPor }}
              </div>
              <div><span class="font-medium">Estado:</span> {{ reporteSeleccionado.estado }}</div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 class="font-medium text-gray-900 dark:text-white mb-2">Contenido del Reporte</h3>
            <div class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {{ reporteSeleccionado.contenido }}
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
import apiClient from '@/api/client'
import type { Category } from '@/types'

// Stores
const authStore = useAuthStore()
const uiStore = useUIStore()
const toast = useToast()

// Estado del componente
const cargandoReportes = ref(false)
const generandoReporte = ref(false)
const mostrarModalReporte = ref(false)
const reporteSeleccionado = ref<any>(null)

// Filtros
const filtros = reactive({
  tipoReporte: '',
  fechaDesde: '',
  fechaHasta: '',
  categoria: '',
})

// Datos
const estadisticas = reactive({
  totalBienes: 0,
  valorTotal: 0,
  ultimoReporte: '',
  reportesGenerados: 0,
})

const categorias = ref<Category[]>([])
const reportesGenerados = ref<any[]>([])

// Métodos de carga de datos
const cargarEstadisticas = async () => {
  try {
    const response = await apiClient.get('/reportes/estadisticas')
    const data = response

    if (data.success) {
      Object.assign(estadisticas, data.data)
    }
  } catch (error) {
    toast.error('Error al cargar las estadísticas')
  }
}

const cargarCategorias = async () => {
  try {
    const response = await apiClient.get('/categorias')
    const data = response

    if (data.success) {
      categorias.value = data.data
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
}

const cargarReportes = async () => {
  cargandoReportes.value = true
  try {
    const response = await apiClient.get('/reportes')
    const data = response

    if (data.success) {
      reportesGenerados.value = data.data
    }
  } catch (error) {
    toast.error('Error al cargar los reportes')
  } finally {
    cargandoReportes.value = false
  }
}

// Métodos de acciones
const generarReporte = async () => {
  generandoReporte.value = true
  try {
    const response = await apiClient.post('/reportes/generar', filtros)
    const data = response

    if (data.success) {
      reportesGenerados.value.unshift(data.data)
      await cargarEstadisticas() // Actualizar estadísticas
      toast.success('Reporte generado correctamente')
    } else {
      throw new Error(data.message || 'Error al generar reporte')
    }
  } catch (error) {
    toast.error('Error al generar el reporte')
  } finally {
    generandoReporte.value = false
  }
}

const exportarReporte = async () => {
  try {
    const token = localStorage.getItem('authToken')
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

    const response = await fetch(`${apiUrl}/reportes/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(filtros)
    })

    if (!response.ok) throw new Error('Error al exportar')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_${filtros.tipoReporte || 'general'}_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Reporte exportado a Excel correctamente')
  } catch (error) {
    console.error('Export error:', error)
    toast.error('Error al exportar el reporte')
  }
}

const verReporte = (reporte: any) => {
  reporteSeleccionado.value = reporte
  mostrarModalReporte.value = true
}

const descargarReporte = async (reporte: any) => {
  try {
    const token = localStorage.getItem('authToken')
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

    const response = await fetch(`${apiUrl}/reportes/${reporte.id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) throw new Error('Error al descargar')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_${reporte.id}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Reporte descargado correctamente')
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Error al descargar el reporte')
  }
}

const eliminarReporte = async (id: number) => {
  if (confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
    try {
      const response = await apiClient.delete(`/reportes/${id}`)
      const data = response

      if (data.success) {
        reportesGenerados.value = reportesGenerados.value.filter((r: any) => r.id !== id)
        await cargarEstadisticas() // Actualizar estadísticas
        toast.success('Reporte eliminado correctamente')
      } else {
        throw new Error(data.message || 'Error al eliminar reporte')
      }
    } catch (error) {
      toast.error('Error al eliminar el reporte')
    }
  }
}

const cerrarModalReporte = () => {
  mostrarModalReporte.value = false
  reporteSeleccionado.value = null
}

const toggleDarkMode = () => {
  uiStore.toggleDarkMode()
}

// Métodos de utilidad
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getEstadoClass = (estado: string): string => {
  const map: Record<string, string> = {
    Completado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'En Proceso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    Error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Pendiente: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  }
  return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Lifecycle
onMounted(async () => {
  await Promise.all([cargarEstadisticas(), cargarCategorias(), cargarReportes()])
})
</script>
