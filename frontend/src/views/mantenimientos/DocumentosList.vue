<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Gestión de Documentos
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Administra los documentos asociados a los bienes institucionales
          </p>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ documentos.length }} documentos registrados</span>
            <span>•</span>
            <span>{{ totalSize }}</span>
          </div>
        </div>
        <div class="mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            @click="exportarDatos"
            class="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <i class="bx bx-download text-lg"></i>
            <span class="hidden sm:inline">Exportar</span>
          </button>
          <button
            v-if="canUploadDocuments"
            @click="mostrarModalSubida = true"
            class="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <i class="bx bx-upload text-lg"></i>
            <span>Subir Documento</span>
          </button>
        </div>
      </div>
    </div>


    <!-- Estadísticas rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-file text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Facturas</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ documentosPorTipo.factura }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-shield-check text-green-600 dark:text-green-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Garantías</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ documentosPorTipo.garantia }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-book text-purple-600 dark:text-purple-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Manuales</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ documentosPorTipo.manual }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-image text-orange-600 dark:text-orange-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Fotos</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ documentosPorTipo.foto }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- DataTable -->
    <DataTableNew
      title="Lista de Documentos"
      :data="documentosFiltrados"
      :columns="columns"
      :loading="cargando"
      :search-term="filtros.busqueda"
      :page-size="filtros.limite"
      :selectable="canEditDocuments"
      :has-actions="true"
      empty-message="No hay documentos registrados"
      search-placeholder="Buscar por bien, tipo de documento, nombre de archivo..."
      @update:search-term="filtros.busqueda = $event"
      @update:page-size="filtros.limite = $event"
      @edit="editarDocumento"
      @view="verDocumento"
      @delete="eliminarDocumento"
    >
      <template #header-actions>
        <div class="flex items-center space-x-2">
          <select
            v-model="filtros.tipo"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="factura">Factura</option>
            <option value="garantia">Garantía</option>
            <option value="manual">Manual</option>
            <option value="acta_entrega">Acta de Entrega</option>
            <option value="acta_constatacion">Acta de Constatación</option>
            <option value="foto">Fotografía</option>
            <option value="otro">Otro</option>
          </select>
          <input
            v-model="filtros.fechaDesde"
            type="date"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder="Fecha desde"
          />
          <button
            @click="limpiarFiltros"
            class="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            <i class="bx bx-refresh text-sm"></i>
            <span>Limpiar</span>
          </button>
        </div>
      </template>
      <template #cell-bien="{ value }">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <i class="bx bx-laptop text-primary-600 dark:text-primary-400 text-sm"></i>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ value?.nombre || 'N/A' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ value?.codigo || 'N/A' }}</p>
          </div>
        </div>
      </template>

      <template #cell-tipo="{ value }">
        <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getTipoClass(value)">
          {{ getTipoLabel(value) }}
        </span>
      </template>

      <template #cell-archivo="{ item }">
        <div class="flex items-center space-x-2">
          <div class="flex-shrink-0">
            <i :class="getFileIcon(item.nombre_archivo)" class="text-lg text-gray-400"></i>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ item.nombre_archivo }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(item.tamano) }}</p>
          </div>
        </div>
      </template>

      <template #cell-fecha_subida="{ value }">
        <span class="text-sm text-gray-900 dark:text-white">
          {{ formatDate(value) }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center space-x-2">
          <button
            @click="descargarDocumento(item)"
            class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
            title="Descargar documento"
          >
            <i class="bx bx-download text-lg"></i>
          </button>
          <button
            @click="verDocumento(item)"
            class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
            title="Ver documento"
          >
            <i class="bx bx-show text-lg"></i>
          </button>
          <button
            v-if="canEditDocuments"
            @click="editarDocumento(item)"
            class="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900 rounded-lg transition-colors"
            title="Editar documento"
          >
            <i class="bx bx-edit text-lg"></i>
          </button>
          <button
            v-if="canDeleteDocuments"
            @click="eliminarDocumento(item)"
            class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            title="Eliminar documento"
          >
            <i class="bx bx-trash text-lg"></i>
          </button>
        </div>
      </template>
    </DataTableNew>

    <!-- Modal de Subir/Editar Documento -->
    <BaseModal
      :show="mostrarModalSubida || mostrarModalEdicion"
      :title="documentoActual ? 'Editar Documento' : 'Subir Nuevo Documento'"
      size="large"
      @close="cerrarModal"
    >

      <form @submit.prevent="guardarDocumento" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bien *
            </label>
            <select
              v-model="formulario.bien_id"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona un bien</option>
              <option v-for="bien in bienes" :key="bien.id" :value="bien.id">
                {{ bien.nombre }} ({{ bien.codigo }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Documento *
            </label>
            <select
              v-model="formulario.tipo"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona el tipo</option>
              <option value="factura">Factura</option>
              <option value="garantia">Garantía</option>
              <option value="manual">Manual</option>
              <option value="acta_entrega">Acta de Entrega</option>
              <option value="acta_constatacion">Acta de Constatación</option>
              <option value="foto">Fotografía</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div v-if="!documentoActual">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Archivo *
          </label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-primary-400 transition-colors">
            <div class="space-y-1 text-center">
              <i class="bx bx-cloud-upload text-4xl text-gray-400"></i>
              <div class="flex text-sm text-gray-600 dark:text-gray-400">
                <label class="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                  <span class="px-2">Subir archivo</span>
                  <input
                    type="file"
                    @change="handleFileChange"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xlsx,.xls"
                    :required="!documentoActual"
                    class="sr-only"
                  />
                </label>
                <p class="pl-1">o arrastra y suelta</p>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                PDF, Word, Excel, Imágenes hasta 10MB
              </p>
              <div v-if="archivoSeleccionado" class="mt-2">
                <p class="text-sm text-green-600 dark:text-green-400">
                  ✓ {{ archivoSeleccionado.name }} ({{ formatFileSize(archivoSeleccionado.size) }})
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            v-model="formulario.descripcion"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Descripción del documento"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <BaseButton
            type="button"
            variant="secondary"
            @click="cerrarModal"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            :loading="guardando"
          >
            {{ guardando ? 'Guardando...' : (documentoActual ? 'Actualizar' : 'Subir') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useAuth } from '@/composables/useAuth'
import DataTableNew from '@/components/shared/DataTableNew.vue'
import BaseModal from '@/components/shared/BaseModal.vue'
import BaseButton from '@/components/shared/BaseButton.vue'
import type { DataTableColumn, Asset, User } from '@/types'

interface Documento {
  id: number
  bien_id: number
  bien?: Asset
  tipo: string
  nombre_archivo: string
  ruta_archivo: string
  tamano: number
  descripcion?: string
  subido_por: number
  usuario?: User
  fecha_subida: string
  created_at: string
  updated_at: string
}

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { canUploadDocuments, canEditDocuments, canDeleteDocuments } = useAuth()

// Estado del componente
const cargando = ref(false)
const guardando = ref(false)
const mostrarModalSubida = ref(false)
const mostrarModalEdicion = ref(false)
const documentoActual = ref<Documento | null>(null)
const archivoSeleccionado = ref<File | null>(null)

// Filtros
const filtros = reactive({
  busqueda: '',
  tipo: '',
  fechaDesde: '',
  limite: 10,
})

// Formulario
const formulario = reactive({
  bien_id: '',
  tipo: '',
  descripcion: '',
})

// Datos
const documentos = ref<Documento[]>([])
const bienes = ref<Asset[]>([])

// Computadas
const totalSize = computed(() => {
  const total = documentos.value.reduce((sum, doc) => sum + (doc.tamano || 0), 0)
  return formatFileSize(total)
})

const documentosPorTipo = computed(() => {
  const conteo = {
    factura: 0,
    garantia: 0,
    manual: 0,
    foto: 0,
  }
  
  documentos.value.forEach(doc => {
    if (conteo.hasOwnProperty(doc.tipo)) {
      conteo[doc.tipo as keyof typeof conteo]++
    }
  })
  
  return conteo
})

const documentosFiltrados = computed(() => {
  let resultado = [...documentos.value]

  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.toLowerCase()
    resultado = resultado.filter(doc =>
      doc.bien?.nombre?.toLowerCase().includes(busqueda) ||
      doc.bien?.codigo?.toLowerCase().includes(busqueda) ||
      doc.nombre_archivo.toLowerCase().includes(busqueda) ||
      doc.descripcion?.toLowerCase().includes(busqueda)
    )
  }

  if (filtros.tipo) {
    resultado = resultado.filter(doc => doc.tipo === filtros.tipo)
  }

  if (filtros.fechaDesde) {
    resultado = resultado.filter(doc => {
      const fechaDoc = new Date(doc.fecha_subida)
      const fechaFiltro = new Date(filtros.fechaDesde)
      return fechaDoc >= fechaFiltro
    })
  }

  return resultado
})

// Columnas de la tabla
const columns: DataTableColumn[] = [
  { key: 'bien.nombre', label: 'Bien', sortable: true },
  { key: 'tipo', label: 'Tipo', sortable: true },
  { key: 'archivo', label: 'Archivo', sortable: false },
  { key: 'descripcion', label: 'Descripción', sortable: false },
  { key: 'fecha_subida', label: 'Fecha', sortable: true },
  { key: 'usuario.nombre', label: 'Subido por', sortable: true },
]


// Métodos
const cargarDocumentos = async () => {
  cargando.value = true
  try {
    const response = await fetch('/api/documentos', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) throw new Error('Error al cargar documentos')

    const data = await response.json()
    if (data.success) {
      documentos.value = data.data || []
    }
  } catch (error) {
    console.error('Error loading documentos:', error)
    toast.error('Error al cargar los documentos')
    documentos.value = []
  } finally {
    cargando.value = false
  }
}

const cargarBienes = async () => {
  try {
    const response = await fetch('/api/bienes', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar bienes')

    const data = await response.json()
    if (data.success) {
      bienes.value = data.data || []
    }
  } catch (error) {
    console.error('Error loading bienes:', error)
    bienes.value = []
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error('El archivo es demasiado grande. Máximo 10MB.')
      target.value = ''
      return
    }
    archivoSeleccionado.value = file
  }
}

const guardarDocumento = async () => {
  guardando.value = true
  try {
    const formData = new FormData()
    formData.append('bien_id', formulario.bien_id)
    formData.append('tipo', formulario.tipo)
    formData.append('descripcion', formulario.descripcion)
    
    if (archivoSeleccionado.value && !documentoActual.value) {
      formData.append('archivo', archivoSeleccionado.value)
    }

    const method = documentoActual.value ? 'PUT' : 'POST'
    const endpoint = documentoActual.value 
      ? `/api/documentos/${documentoActual.value.id}` 
      : '/api/documentos'

    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      body: formData,
    })

    if (!response.ok) throw new Error('Error al guardar documento')

    const data = await response.json()
    if (data.success) {
      await cargarDocumentos()
      toast.success(documentoActual.value 
        ? 'Documento actualizado correctamente' 
        : 'Documento subido correctamente'
      )
      cerrarModal()
    }
  } catch (error) {
    console.error('Error saving documento:', error)
    toast.error('Error al guardar el documento')
  } finally {
    guardando.value = false
  }
}

const descargarDocumento = async (documento: Documento) => {
  try {
    toast.info(`Descargando ${documento.nombre_archivo}...`)
    const response = await fetch(`/api/documentos/${documento.id}/download`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al descargar documento')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = documento.nombre_archivo
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Documento descargado correctamente')
  } catch (error) {
    console.error('Error downloading documento:', error)
    toast.error('Error al descargar el documento')
  }
}

const verDocumento = async (documento: Documento) => {
  try {
    const response = await fetch(`/api/documentos/${documento.id}/view`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al abrir documento')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch (error) {
    console.error('Error viewing documento:', error)
    toast.error('Error al abrir el documento')
  }
}

const editarDocumento = (documento: Documento) => {
  documentoActual.value = documento
  Object.assign(formulario, {
    bien_id: documento.bien_id.toString(),
    tipo: documento.tipo,
    descripcion: documento.descripcion || '',
  })
  mostrarModalEdicion.value = true
}

const eliminarDocumento = async (documento: Documento) => {
  if (confirm(`¿Estás seguro de eliminar el documento "${documento.nombre_archivo}"?`)) {
    try {
      const response = await fetch(`/api/documentos/${documento.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })

      if (!response.ok) throw new Error('Error al eliminar documento')

      const data = await response.json()
      if (data.success) {
        const index = documentos.value.findIndex(d => d.id === documento.id)
        if (index > -1) {
          documentos.value.splice(index, 1)
        }
        toast.success('Documento eliminado correctamente')
      }
    } catch (error) {
      console.error('Error deleting documento:', error)
      toast.error('Error al eliminar el documento')
    }
  }
}

const cerrarModal = () => {
  mostrarModalSubida.value = false
  mostrarModalEdicion.value = false
  documentoActual.value = null
  archivoSeleccionado.value = null
  Object.assign(formulario, {
    bien_id: '',
    tipo: '',
    descripcion: '',
  })
}

const limpiarFiltros = () => {
  Object.assign(filtros, {
    busqueda: '',
    tipo: '',
    fechaDesde: '',
    limite: 10,
  })
}

const exportarDatos = async () => {
  try {
    toast.info('Exportando datos...')
    const response = await fetch('/api/documentos/export', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al exportar datos')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `documentos_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Datos exportados correctamente')
  } catch (error) {
    console.error('Error exporting documentos:', error)
    toast.error('Error al exportar los datos')
  }
}

// Helpers
const getTipoClass = (tipo: string) => {
  const classes = {
    factura: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    garantia: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    manual: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    acta_entrega: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    acta_constatacion: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    foto: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    otro: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  }
  return classes[tipo as keyof typeof classes] || classes.otro
}

const getTipoLabel = (tipo: string) => {
  const labels = {
    factura: 'Factura',
    garantia: 'Garantía',
    manual: 'Manual',
    acta_entrega: 'Acta Entrega',
    acta_constatacion: 'Acta Constatación',
    foto: 'Fotografía',
    otro: 'Otro',
  }
  return labels[tipo as keyof typeof labels] || tipo
}

const getFileIcon = (nombreArchivo: string) => {
  const extension = nombreArchivo.split('.').pop()?.toLowerCase()
  const iconos = {
    pdf: 'bx bxs-file-pdf text-red-500',
    doc: 'bx bxs-file-doc text-blue-500',
    docx: 'bx bxs-file-doc text-blue-500',
    xls: 'bx bxs-spreadsheet text-green-500',
    xlsx: 'bx bxs-spreadsheet text-green-500',
    jpg: 'bx bxs-image text-purple-500',
    jpeg: 'bx bxs-image text-purple-500',
    png: 'bx bxs-image text-purple-500',
    gif: 'bx bxs-image text-purple-500',
  }
  return iconos[extension as keyof typeof iconos] || 'bx bxs-file text-gray-500'
}

const formatDate = (fecha: string) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    cargarBienes(),
    cargarDocumentos()
  ])
})
</script>
