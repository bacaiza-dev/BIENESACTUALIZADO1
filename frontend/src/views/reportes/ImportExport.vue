<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <div class="max-w-7xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Importación y Exportación de Datos
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Sección de Exportación -->
          <div
            class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-6"
          >
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4">
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Exportar Datos</h2>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar Tabla
                </label>
                <select
                  v-model="exportForm.table"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Seleccionar tabla</option>
                  <option v-for="table in availableTables" :key="table.value" :value="table.value">
                    {{ table.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato de Exportación
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <label
                    class="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      v-model="exportForm.format"
                      type="radio"
                      value="excel"
                      class="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span class="text-sm text-gray-900 dark:text-white">Excel (.xlsx)</span>
                  </label>
                  <label
                    class="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      v-model="exportForm.format"
                      type="radio"
                      value="csv"
                      class="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span class="text-sm text-gray-900 dark:text-white">CSV</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filtros (Opcional)
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    v-model="exportForm.dateFrom"
                    type="date"
                    placeholder="Fecha desde"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    v-model="exportForm.dateTo"
                    type="date"
                    placeholder="Fecha hasta"
                    class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div class="flex items-center">
                <input
                  v-model="exportForm.includeHeaders"
                  type="checkbox"
                  id="includeHeaders"
                  class="mr-2 text-green-600 focus:ring-green-500 rounded"
                />
                <label for="includeHeaders" class="text-sm text-gray-700 dark:text-gray-300">
                  Incluir encabezados
                </label>
              </div>

              <button
                @click="exportData"
                :disabled="!exportForm.table || !exportForm.format || isExporting"
                class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:hover:scale-100"
              >
                <span v-if="isExporting" class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                  Exportando...
                </span>
                <span v-else>Exportar Datos</span>
              </button>
            </div>
          </div>

          <!-- Sección de Importación -->
          <div
            class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6"
          >
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                <svg
                  class="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  ></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Importar Datos</h2>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tabla Destino
                </label>
                <select
                  v-model="importForm.table"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Seleccionar tabla</option>
                  <option v-for="table in availableTables" :key="table.value" :value="table.value">
                    {{ table.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Archivo
                </label>
                <div
                  @drop="handleDrop"
                  @dragover.prevent
                  @dragenter.prevent
                  class="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200 cursor-pointer"
                  :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900': isDragging }"
                >
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    @change="handleFileSelect"
                    class="hidden"
                  />

                  <div v-if="!importForm.file" @click="$refs.fileInput.click()">
                    <svg
                      class="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span class="font-medium text-blue-600 hover:text-blue-500"
                        >Haga clic para seleccionar</span
                      >
                      o arrastre y suelte
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">CSV, XLSX hasta 10MB</p>
                  </div>

                  <div v-else class="flex items-center justify-between">
                    <div class="flex items-center">
                      <svg
                        class="h-8 w-8 text-blue-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      <span class="text-sm text-gray-900 dark:text-white">{{
                        importForm.file.name
                      }}</span>
                    </div>
                    <button @click="removeFile" class="text-red-600 hover:text-red-800 p-1">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center">
                  <input
                    v-model="importForm.hasHeaders"
                    type="checkbox"
                    id="hasHeaders"
                    class="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <label for="hasHeaders" class="text-sm text-gray-700 dark:text-gray-300">
                    El archivo tiene encabezados
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="importForm.updateExisting"
                    type="checkbox"
                    id="updateExisting"
                    class="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <label for="updateExisting" class="text-sm text-gray-700 dark:text-gray-300">
                    Actualizar registros existentes
                  </label>
                </div>
              </div>

              <button
                @click="importData"
                :disabled="!importForm.table || !importForm.file || isImporting"
                class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:hover:scale-100"
              >
                <span v-if="isImporting" class="flex items-center justify-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                  Importando...
                </span>
                <span v-else>Importar Datos</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Historial de Operaciones -->
        <div class="mt-8 bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Historial de Operaciones
          </h3>

          <div class="overflow-x-auto">
            <table class="w-full table-auto">
              <thead class="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Operación
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Tabla
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Registros
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr
                  v-for="operation in operationsHistory"
                  :key="operation.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {{ formatDate(operation.fecha) }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {{ operation.tipo }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {{ operation.tabla }}
                  </td>
                  <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">
                    {{ operation.registros }}
                  </td>
                  <td class="px-4 py-2">
                    <span
                      :class="getStatusColor(operation.estado)"
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ operation.estado }}
                    </span>
                  </td>
                  <td class="px-4 py-2 text-sm">
                    <button
                      v-if="operation.archivo_resultado"
                      @click="downloadFile(operation.archivo_resultado)"
                      class="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Descargar
                    </button>
                    <button
                      @click="viewDetails(operation)"
                      class="text-green-600 hover:text-green-800"
                    >
                      Detalles
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

// Estado reactivo
const isExporting = ref(false)
const isImporting = ref(false)
const isDragging = ref(false)
const operationsHistory = ref([])

// Formularios
const exportForm = ref({
  table: '',
  format: 'excel',
  dateFrom: '',
  dateTo: '',
  includeHeaders: true,
})

const importForm = ref({
  table: '',
  file: null,
  hasHeaders: true,
  updateExisting: false,
})

// Datos
const availableTables = ref([
  { value: 'bienes', label: 'Bienes' },
  { value: 'usuarios', label: 'Usuarios' },
  { value: 'ubicaciones', label: 'Ubicaciones' },
  { value: 'categorias', label: 'Categorías' },
  { value: 'mantenimientos', label: 'Mantenimientos' },
])

// Métodos
const exportData = async () => {
  isExporting.value = true
  try {
    let url = `/api/export/${exportForm.value.table}?formato=${exportForm.value.format}`
    if (exportForm.value.dateFrom) url += `&dateFrom=${exportForm.value.dateFrom}`
    if (exportForm.value.dateTo) url += `&dateTo=${exportForm.value.dateTo}`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Error en la exportación')
    }

    // Descargar archivo
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `export_${exportForm.value.table}_${Date.now()}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)

    // Agregar al historial
    const newOperation = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      tipo: 'Exportación',
      tabla: exportForm.value.table,
      registros: '—',
      estado: 'completado',
      archivo_resultado: `export_${exportForm.value.table}.xlsx`,
    }
    operationsHistory.value.unshift(newOperation)
    
    toast.success('Exportación completada exitosamente')
  } catch (error) {
    console.error('Error exportando:', error)
    toast.error('Error en la exportación')
  } finally {
    isExporting.value = false
  }
}

const importData = async () => {
  isImporting.value = true
  try {
    const formData = new FormData()
    formData.append('file', importForm.value.file)
    formData.append('hasHeaders', importForm.value.hasHeaders.toString())
    formData.append('updateExisting', importForm.value.updateExisting.toString())

    const response = await fetch(`/api/import/${importForm.value.table}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      // Agregar al historial
      const newOperation = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        tipo: 'Importación',
        tabla: importForm.value.table,
        registros: data.data.inserted,
        estado: data.data.errors > 0 ? 'parcial' : 'completado',
        archivo_resultado: null,
      }
      operationsHistory.value.unshift(newOperation)

      toast.success(`Importación completada: ${data.data.inserted} registros insertados`)
      
      if (data.data.errors > 0) {
        toast.warning(`${data.data.errors} filas con errores`)
      }

      // Limpiar formulario
      importForm.value.file = null
      importForm.value.table = ''
    } else {
      throw new Error(data.message || 'Error en la importación')
    }
  } catch (error) {
    console.error('Error importando:', error)
    toast.error('Error en la importación: ' + error.message)
  } finally {
    isImporting.value = false
  }
}

const handleFileSelect = event => {
  const file = event.target.files[0]
  if (file) {
    importForm.value.file = file
  }
}

const handleDrop = event => {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer.files
  if (files.length > 0) {
    importForm.value.file = files[0]
  }
}

const removeFile = () => {
  importForm.value.file = null
}

const downloadFile = filename => {
  // Simular descarga de archivo
  alert(`Descargando: ${filename}`)
}

const viewDetails = operation => {
  alert(`Detalles de operación: ${operation.tipo} en tabla ${operation.tabla}`)
}

const getStatusColor = estado => {
  const colors = {
    completado: 'bg-green-100 text-green-800',
    en_proceso: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }
  return colors[estado] || 'bg-gray-100 text-gray-800'
}

const formatDate = dateString => {
  return new Date(dateString).toLocaleString('es-ES')
}

const loadOperationsHistory = () => {
  // Simular historial de operaciones
  operationsHistory.value = [
    {
      id: 1,
      fecha: '2024-12-10T10:30:00.000Z',
      tipo: 'Exportación',
      tabla: 'bienes',
      registros: 245,
      estado: 'completado',
      archivo_resultado: 'export_bienes_20241210.xlsx',
    },
    {
      id: 2,
      fecha: '2024-12-09T15:45:00.000Z',
      tipo: 'Importación',
      tabla: 'usuarios',
      registros: 15,
      estado: 'completado',
      archivo_resultado: null,
    },
    {
      id: 3,
      fecha: '2024-12-08T09:15:00.000Z',
      tipo: 'Exportación',
      tabla: 'mantenimientos',
      registros: 89,
      estado: 'error',
      archivo_resultado: null,
    },
  ]
}

// Lifecycle
onMounted(() => {
  loadOperationsHistory()
})
</script>
