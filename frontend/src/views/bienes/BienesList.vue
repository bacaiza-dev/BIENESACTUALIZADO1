<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Gestión de Bienes
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Administra todos los bienes institucionales con filtros avanzados y acciones rápidas
          </p>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ bienes.length }} bienes totales</span>
            <span>•</span>
            <span>{{ bienesActivos.length }} activos</span>
          </div>
        </div>
        <div
          class="mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div class="relative">
            <button @click="mostrarMenuExportar = !mostrarMenuExportar"
              class="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              title="Exportar datos">
              <i class="bx bx-download text-lg"></i>
              <span class="hidden sm:inline">Exportar</span>
              <i class="bx bx-chevron-down text-sm"></i>
            </button>
            <!-- Menú desplegable -->
            <div v-if="mostrarMenuExportar"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
              <button @click="exportarPDF"
                class="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl">
                <i class="bx bxs-file-pdf text-red-500 text-xl"></i>
                <span>Exportar PDF</span>
              </button>
              <button @click="exportarExcel"
                class="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="bx bxs-file-export text-green-500 text-xl"></i>
                <span>Exportar Excel</span>
              </button>
              <button @click="exportarCSV"
                class="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl">
                <i class="bx bx-spreadsheet text-blue-500 text-xl"></i>
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
          <button v-if="canCreateAsset" @click="router.push('/bienes/create')"
            class="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            title="Crear nuevo bien institucional">
            <i class="bx bx-plus-circle text-lg"></i>
            <span>Nuevo Bien</span>
          </button>
        </div>
      </div>
    </div>



    <!-- DataTable -->
    <DataTable
      title="Lista de Bienes"
      :data="bienes"
      :columns="columns"
      :loading="cargando"
      :search-term="filtros.busqueda"
      :page-size="filtros.limite"
      :current-page="paginaActual"
      :selectable="canEditAsset"
      :has-actions="true"
      :selected-items="bienesSeleccionados"
      empty-message="No hay bienes registrados"
      search-placeholder="Buscar por código, nombre, responsable..."
      @update:search-term="filtros.busqueda = $event"
      @update:page-size="filtros.limite = $event"
      @update:currentPage="paginaActual = $event"
      @edit="editarBien"
      @view="verBien"
      @delete="eliminarBien"
      @update:selectedItems="bienesSeleccionados = $event"
      @bulk-delete="eliminarSeleccionados"
    >


      <template #cell-codigo_institucional="{ value }">
        <span class="font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-2 py-1 rounded">
          {{ value }}
        </span>
      </template>


      <template #cell-estado="{ value }">
        <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getEstadoClass(value)">
          {{ value }}
        </span>
      </template>

      <template #cell-valor_adquisicion="{ value }">
        <span class="font-medium text-green-600 dark:text-green-400">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <template #cell-fecha_adquisicion="{ value }">
        <span class="text-sm text-gray-900 dark:text-gray-200">
          {{ value ? new Date(value).toLocaleDateString() : '-' }}
        </span>
      </template>

      <template #cell-responsable_completo="{ value }">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <i class="bx bx-user text-primary-600 dark:text-primary-400"></i>
          </div>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ value || 'Sin asignar' }}</span>
        </div>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="generarQR(item)"
            class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors"
            title="Generar QR">
            <i class="bx bx-qr text-lg"></i>
          </button>
          <button @click="verBien(item)"
            class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
            title="Ver detalles">
            <i class="bx bx-show text-lg"></i>
          </button>
          <button v-if="canEditAsset" @click="editarBien(item)"
            class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
            title="Editar">
            <i class="bx bx-edit text-lg"></i>
          </button>
          <button v-if="canDeleteAsset" @click="eliminarBien(item)"
            class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            title="Eliminar">
            <i class="bx bx-trash text-lg"></i>
          </button>
        </div>
      </template>

      <!-- Bulk actions slot: muestra botón controlado por permisos -->
      <template #bulk-actions="{ selectedItems }">
        <div class="flex items-center space-x-2">
          <button v-if="canDeleteAsset && selectedItems && selectedItems.length" @click.prevent="eliminarSeleccionados(selectedItems)"
            class="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors">
            <i class="bx bx-trash mr-1"></i>
            Eliminar seleccionados
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Modales eliminados, ahora se usa navegación a /bienes/create y /bienes/:id/edit -->

    <!-- Modal de código QR -->
    <div v-if="mostrarModalQR" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cerrarModalQR">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Código QR del Bien
          </h2>
          <button @click="cerrarModalQR"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>

        <div v-if="qrActual" class="text-center space-y-4">
          <div class="bg-white p-4 rounded-lg border inline-block">
            <div id="qr-code" class="w-48 h-48 mx-auto"></div>
          </div>

          <div class="space-y-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Código: <span class="font-mono">{{ qrActual.codigo }}</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500">
              URL: {{ qrActual.url }}
            </p>
          </div>

          <div class="flex space-x-3">
            <button @click="descargarQR"
              class="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <i class="bx bx-download"></i>
              <span>Descargar</span>
            </button>
            <button @click="imprimirQR"
              class="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors">
              <i class="bx bx-printer"></i>
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useAuth } from '@/composables/useAuth'
import DataTable from '@/components/shared/DataTable.vue'
import QRCode from 'qrcode'
import apiClient from '@/api/client'
import { confirm } from '@/composables/useConfirm'
import type { Asset, DataTableColumn, Category, Location, User } from '@/types'
import { exportToPDF, exportToExcel, exportToCSV } from '@/utils/exportUtils'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { canCreateAsset, canEditAsset, canDeleteAsset } = useAuth()

// Estado del componente
const cargando = ref(false)
const mostrarFiltrosMobile = ref(false)
const mostrarMenuExportar = ref(false)
const bienActual = ref<Asset | null>(null)
const bienesSeleccionados = ref<(string | number)[]>([])
const mostrarModalQR = ref(false)
const qrActual = ref<{ codigo: string; url: string } | null>(null)
// Control de paginación
const paginaActual = ref(1)

// Filtros
const filtros = reactive({
  busqueda: '',
  categoria: '',
  estado: '',
  ubicacion: '',
  limite: 10,
})

// Filtros

// Datos de bienes
const bienes = ref<Asset[]>([])
const categorias = ref<Category[]>([])
const ubicaciones = ref<Location[]>([])
const usuarios = ref<User[]>([])

// Computadas
const bienesActivos = computed(() => bienes.value.filter((bien: Asset) => bien.estado === 'activo'))

// Columnas de la tabla
const columns: DataTableColumn[] = [
  { key: 'codigo_institucional', label: 'Código Institucional', sortable: true },
  { key: 'codigo_senescyt', label: 'Código SENESCYT', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'marca', label: 'Marca', sortable: true },
  { key: 'modelo', label: 'Modelo', sortable: true },
  { key: 'serie', label: 'Serie', sortable: true },
  { key: 'categoria.nombre', label: 'Categoría', sortable: true },
  { key: 'ubicacion.nombre', label: 'Ubicación', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'valor_adquisicion', label: 'Valor', sortable: true },
  { key: 'responsable_completo', label: 'Responsable', sortable: true },
  { key: 'fecha_adquisicion', label: 'Fecha Adquisición', sortable: true },
]

// Métodos
const cargarBienes = async () => {
  cargando.value = true
  try {
    const response = await apiClient.get('/bienes')
    if (response.success && response.data) {
      // Si la respuesta es paginada, usar response.data.data, sino usar response.data directamente
      const bienesData = Array.isArray(response.data) ? response.data : (response.data as any)?.data || []

      // Agregar campos calculados para mejor búsqueda y visualización
      bienes.value = bienesData.map((bien: any) => ({
        ...bien,
        responsable_completo: bien.responsable ?
          `${bien.responsable.nombre || ''} ${bien.responsable.apellido || ''}`.trim() ||
          'Sin asignar' : 'Sin asignar',
        categoria: bien.categoria || { id: bien.categoria_id || 0, nombre: 'Sin categoría' },
        ubicacion: bien.ubicacion || { id: bien.ubicacion_id || 0, nombre: 'Sin ubicación' },
      }))

      toast.success('Bienes cargados correctamente')
    } else {
      throw new Error(response.message || 'Error al cargar bienes')
    }
  } catch (error) {
    console.error('Error loading bienes:', error)
    bienes.value = []
    toast.error('Error al cargar los bienes. Intente nuevamente.')
  } finally {
    cargando.value = false
  }
}

const verBien = (bien: Asset) => {
  router.push(`/bienes/${bien.id}`)
}

const editarBien = (bien: Asset) => {
  router.push(`/bienes/${bien.id}/edit`)
}

const eliminarBien = async (bien: Asset) => {
  const confirmed = await confirm({
    title: 'Eliminar bien',
    message: `¿Estás seguro de eliminar el bien "${bien.nombre}"?`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    destructive: true,
  })
  if (!confirmed) return

  try {
    const response = await apiClient.delete(`/bienes/${bien.id}`)
    if (!response.success) throw new Error(response.message || 'Error al eliminar bien')

    const index = bienes.value.findIndex((b: Asset) => b.id === bien.id)
    if (index > -1) {
      bienes.value.splice(index, 1)
    }
    toast.success('Bien eliminado correctamente')
  } catch (error) {
    toast.error('Error al eliminar el bien')
  }
}

// Eliminación en lote (handler conectado al DataTable)
const eliminarSeleccionados = async (selectedIds?: Array<string | number>) => {
  // DataTable emite sin payload desde TablePagination; usamos el estado local si no viene lista
  const ids = Array.isArray(selectedIds) && selectedIds.length ? selectedIds : bienesSeleccionados.value
  if (!ids || !ids.length) return

  if (!canDeleteAsset.value) {
    toast.error('No tienes permisos para eliminar elementos')
    return
  }

  const confirmed = await confirm({
    title: ids.length > 1 ? 'Eliminar bienes' : 'Eliminar bien',
    message: `¿Eliminar ${ids.length} bien${ids.length > 1 ? 'es' : ''} seleccionad${ids.length > 1 ? 'os' : 'o'}? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    destructive: true,
  })
  if (!confirmed) return

  const toastId = toast.info(`Eliminando ${ids.length} bien${ids.length > 1 ? 'es' : ''}...`, { timeout: false })
  try {
    const response = await apiClient.post('/bienes/bulk-delete', { ids })
    if (!response.success) throw new Error(response.message || 'Error eliminando en lote')

    // Remover los bienes del estado local
    const idSet = new Set(ids.map(String))
    bienes.value = bienes.value.filter((b: any) => !idSet.has(String(b.id)))

    // Limpiar selección
    bienesSeleccionados.value = []

    toast.dismiss(toastId)
    toast.success(response.message || `${ids.length} bienes eliminados`)    
  } catch (error) {
    console.error('Error bulk delete:', error)
    toast.dismiss(toastId)
    toast.error('Error al eliminar bienes seleccionados')
  }
}

// Métodos eliminados (guardarBien, cerrarModal) ya no necesarios

const limpiarFiltros = () => {
  Object.assign(filtros, {
    busqueda: '',
    categoria: '',
    estado: '',
    ubicacion: '',
    limite: 10,
  })
}

// Columnas para exportación
const exportColumns = [
  { key: 'codigo_institucional', label: 'Código Institucional' },
  { key: 'codigo_senescyt', label: 'Código SENESCYT' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'categoria.nombre', label: 'Categoría' },
  { key: 'ubicacion.nombre', label: 'Ubicación' },
  { key: 'estado', label: 'Estado' },
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'serie', label: 'Serie' },
  { key: 'valor_adquisicion', label: 'Valor ($)' },
  { key: 'responsable_completo', label: 'Responsable' },
  { key: 'fecha_adquisicion', label: 'Fecha Adquisición' },
]

const downloadExport = async (format: string) => {
  mostrarMenuExportar.value = false
  const toastId = toast.info(`Generando ${format.toUpperCase()}...`, { timeout: false })
  
  try {
    const response = await apiClient.get(`/export/bienes`, {
      params: { formato: format },
      responseType: 'blob'
    })

    const blob = response
    if (!(blob instanceof Blob)) throw new Error('Respuesta inválida')

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bienes_export_${new Date().toISOString().split('T')[0]}.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.dismiss(toastId)
    toast.success(`${format.toUpperCase()} descargado correctamente`)
  } catch (error) {
    console.error(`Error exportando ${format}:`, error)
    toast.dismiss(toastId)
    toast.error(`Error al generar ${format.toUpperCase()}`)
  }
}

const exportarPDF = () => downloadExport('pdf')
const exportarExcel = () => downloadExport('excel')
const exportarCSV = () => downloadExport('csv')

const getEstadoClass = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'inactivo':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    case 'mantenimiento':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'baja':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

const showQRModal = (item: Asset) => {
  generarQR(item)
}

const generarEtiqueta = (bien: Asset) => {
  // Lógica para generar etiqueta
}
const generarQR = async (bien: Asset) => {
  try {
    // Crear texto del QR simplificado
    const textoQR = `=== INT BIENES ===
Código: ${bien.codigo_institucional || 'N/A'}
SENESCYT: ${bien.codigo_senescyt || 'N/A'}
Nombre: ${bien.nombre || 'N/A'}
Categoría: ${bien.categoria?.nombre || 'N/A'}
Ubicación: ${bien.ubicacion?.nombre || 'N/A'}
Responsable: ${bien.responsable ? `${bien.responsable.nombre || ''} ${bien.responsable.apellido || ''}`.trim() : 'N/A'}
==================
${window.location.origin}/bienes/${bien.id}`

    // Generar QR directamente sin llamar al backend
    qrActual.value = {
      codigo: bien.codigo_institucional,
      url: textoQR
    }
    mostrarModalQR.value = true
  } catch (error) {
    console.error('Error al generar QR:', error)
    toast.error('Error al generar el código QR')
  }
}

// Función para generar el código QR visual
const generarCodigoQRVisual = async (texto: string) => {
  try {
    const qrContainer = document.getElementById('qr-code')
    if (!qrContainer) {
      console.error('Container qr-code no encontrado')
      return
    }

    // Limpiar container
    qrContainer.innerHTML = ''

    // Crear canvas y generar QR
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, texto, {
      width: 192,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })

    qrContainer.appendChild(canvas)
  } catch (error) {
    console.error('Error al generar QR visual:', error)
  }
}

const cerrarModalQR = () => {
  mostrarModalQR.value = false
  qrActual.value = null
}

const descargarQR = async () => {
  if (!qrActual.value) return

  try {
    const canvas = document.querySelector('#qr-code canvas') as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement('a')
      link.download = `qr-bien-${qrActual.value.codigo}.png`
      link.href = canvas.toDataURL()
      link.click()
      toast.success('QR descargado correctamente')
    }
  } catch (error) {
    toast.error('Error al descargar el QR')
  }
}

const imprimirQR = async () => {
  if (!qrActual.value) return

  try {
    // Crear un canvas temporal para imprimir
    const tempCanvas = document.createElement('canvas')
    await QRCode.toCanvas(tempCanvas, qrActual.value.url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
          <head>
            <title>Código QR - ${qrActual.value.codigo}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
              .qr-container { margin: 20px 0; }
              .info { text-align: left; max-width: 600px; margin: 0 auto; font-size: 12px; }
              @media print { 
                body { margin: 0; } 
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h2>Código QR - Bien Institucional</h2>
            <div class="qr-container">
              <img src="${tempCanvas.toDataURL()}" alt="Código QR" />
            </div>
            <div class="info">
              <pre>${qrActual.value.url}</pre>
            </div>
            <button class="no-print" onclick="window.print()">Imprimir</button>
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  } catch (error) {
    console.error('Error al imprimir QR:', error)
    toast.error('Error al imprimir el QR')
  }
}

// Métodos de carga de datos
const cargarCategorias = async () => {
  try {
    const response = await apiClient.get('/categorias')
    if (response.success && response.data) {
      categorias.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    categorias.value = []
    toast.error('Error al cargar las categorías')
  }
}

const cargarUbicaciones = async () => {
  try {
    const response = await apiClient.get('/ubicaciones')
    if (response.success && response.data) {
      ubicaciones.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar ubicaciones:', error)
    ubicaciones.value = []
    toast.error('Error al cargar las ubicaciones')
  }
}

const cargarUsuarios = async () => {
  try {
    const response = await apiClient.get('/usuarios')
    if (response.success && response.data) {
      usuarios.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    usuarios.value = []
    toast.error('Error al cargar los usuarios')
  }
}

// Lifecycle
// Watcher para generar QR visual cuando se muestra el modal
watch([mostrarModalQR, qrActual], async ([modalVisible, qrData]: [boolean, { codigo: string; url: string } | null]) => {
  if (modalVisible && qrData) {
    await nextTick()
    await generarCodigoQRVisual(qrData.url)
  }
})

onMounted(async () => {
  await Promise.all([cargarBienes(), cargarCategorias(), cargarUbicaciones(), cargarUsuarios()])
})
</script>
