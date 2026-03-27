<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Auditoría</h1>
      <p class="text-sm text-gray-500 dark:text-gray-300 mb-2">Consulta y gestiona la auditoría de bienes institucionales</p>
      <!-- Puedes agregar botones aquí si lo necesitas -->
      <div class="flex bg-gray-100 dark:bg-gray-800 rounded-t-xl border-b border-gray-200 dark:border-gray-700 mt-4">
        <button
          :class="['px-6 py-2 font-semibold text-base transition-all duration-200',
            'rounded-t-xl',
            activeTab === 'constatacion'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-blue-500 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b-2 border-transparent']"
          style="margin-right: -1px;"
          @click="activeTab = 'constatacion'"
        >Constatación</button>
        <button
          :class="['px-6 py-2 font-semibold text-base transition-all duration-200',
            'rounded-t-xl',
            activeTab === 'auditoria'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-blue-500 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b-2 border-transparent']"
          style="margin-right: -1px;"
          @click="activeTab = 'auditoria'"
        >Bienes en Auditoría</button>
        <button
          :class="['px-6 py-2 font-semibold text-base transition-all duration-200',
            'rounded-t-xl',
            activeTab === 'segunda'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-blue-500 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b-2 border-transparent']"
          style="margin-right: -1px;"
          @click="activeTab = 'segunda'"
        >Segunda</button>
        <button
          :class="['px-6 py-2 font-semibold text-base transition-all duration-200',
            'rounded-t-xl',
            activeTab === 'historial'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b-2 border-blue-500 shadow-sm'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b-2 border-transparent']"
          @click="activeTab = 'historial'"
        >Historial</button>
      </div>
    </div>
    <div class="bg-white dark:bg-gray-900 rounded-b-xl border border-gray-200 dark:border-gray-700 min-h-[200px] p-6 transition-all duration-200 mt-2">
      <div v-if="activeTab === 'constatacion'">
        <!-- Contenido de la pestaña Constatación -->
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Constatación Física</h2>
        <div v-if="loadingUsuarios" class="text-center py-8 text-gray-400">Cargando usuarios...</div>
        <div v-else>
          <div class="w-full">
            <div class="flex font-semibold text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-800 rounded-t-lg">
              <div class="w-2/3 px-4 py-2">Usuario</div>
              <div class="w-1/3 px-4 py-2 text-center">Acción</div>
            </div>
            <div v-if="usuarios.length === 0" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-b-lg">No hay usuarios registrados</div>
            <div v-for="user in usuarios" :key="user.id" class="flex items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div class="w-2/3 flex items-center px-4 py-3">
                <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                  <span class="text-xs font-bold text-blue-700 dark:text-blue-300">{{ user.nombre?.charAt(0).toUpperCase() }}{{ user.apellido?.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.nombre }} {{ user.apellido }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                </div>
              </div>
              <div class="w-1/3 flex justify-center px-4 py-3">
                <button class="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors relative"
                  @click="verBienesAuditoria(user.id)">
                  Ver Bienes
                  <span class="ml-2 bg-blue-900 text-white text-xs font-bold rounded-full px-2 py-0.5 flex items-center">{{ contadoresBienes[user.id.toString()] || 0 }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 'auditoria'">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Bienes Constatados</h2>
        <!-- Input file oculto para carga de documentos -->
        <input ref="fileInput" type="file" class="hidden" accept="application/pdf,image/*,.doc,.docx" @change="handleDocumentFileChange" />
        <div v-if="selectedUserAuditoria && usuarioSeleccionado">
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center mr-3">
                  <span class="text-sm font-bold text-white">{{ usuarioSeleccionado.nombre?.charAt(0).toUpperCase() }}{{ usuarioSeleccionado.apellido?.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ usuarioSeleccionado.nombre }} {{ usuarioSeleccionado.apellido }}</p>
                  <p class="text-xs text-gray-600 dark:text-gray-400">{{ usuarioSeleccionado.email }}</p>
                </div>
              </div>
              <button @click="activeTab = 'constatacion'" class="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors">Cambiar Usuario</button>
            </div>
          </div>
          <div class="space-y-2">
            <div v-if="bienesAuditoriaUsuario.length > 0" class="text-sm text-gray-600 dark:text-gray-400 mb-3">Total de bienes: <span class="font-bold text-gray-900 dark:text-white">{{ bienesAuditoriaUsuario.length }}</span></div>
            <div v-else class="px-4 py-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">No hay bienes constatados para este usuario.</div>
            <ul v-if="bienesAuditoriaUsuario.length > 0" class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              <li v-for="bien in bienesAuditoriaUsuario" :key="bien.id_bien" class="px-4 py-3 text-gray-900 dark:text-white">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <div class="font-semibold text-lg">{{ bien.nombre_bien || 'Nombre de bien no disponible' }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {{ bien.id_bien }} {{ bien.codigo ? `| Código: ${bien.codigo}` : '' }}</div>
                    <div v-if="bien.descripcion" class="text-xs text-gray-400 mt-1">{{ bien.descripcion }}</div>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-3">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    Constatado
                  </span>
                  <div class="flex items-center gap-2">
                    <button @click.stop="triggerDocumentUpload(bien.id_bien)" class="inline-flex items-center gap-1 px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                      <i class="bx bxs-cloud-upload"></i> Subir
                    </button>
                    <button
                      v-if="(bienDocuments[bien.id_bien] || []).length > 0"
                      @click.stop="toggleDocumentosList(bien.id_bien)"
                      class="inline-flex items-center gap-1 px-3 py-1 text-xs text-gray-700 dark:text-gray-100 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <i class="bx bx-show"></i>
                      Ver {{ (bienDocuments[bien.id_bien] || []).length }}
                    </button>
                    <button @click.stop="deseleccionarBien(bien.id_bien)" class="text-xs px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">Quitar</button>
                  </div>
                </div>
                <!-- Lista expandible de documentos -->
                <div v-if="expandedDocumentosBien === bien.id_bien && (bienDocuments[bien.id_bien] || []).length > 0" class="mt-3 pl-4 border-l-2 border-blue-300 dark:border-blue-600">
                  <div class="space-y-2">
                    <div v-for="doc in bienDocuments[bien.id_bien]" :key="doc.id" class="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                      <div class="flex items-center gap-2 flex-1">
                        <i class="bx bx-file text-gray-500"></i>
                        <div class="flex-1 truncate">
                          <span class="text-gray-700 dark:text-gray-300">{{ doc.nombre_archivo }}</span>
                          <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">({{ formatFileSize(doc.tamano) }})</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <button @click.stop="viewDocument(doc)" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 text-xs">
                          Ver
                        </button>
                        <button @click.stop="deleteDocument(doc.id, bien.id_bien, doc.nombre_archivo)" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-2 py-1 text-xs">
                          ❌
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p class="mb-4">Selecciona un usuario desde la pestaña Constatación.</p>
          <button @click="activeTab = 'constatacion'" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Ir a Constatación</button>
        </div>
      </div>
      <div v-else-if="activeTab === 'segunda'">
        <!-- Contenido de la segunda pestaña -->
        <h2 class="text-xl font-bold text-white mb-4">Segunda pestaña</h2>
        <!-- Contenido de la segunda pestaña aquí -->
      </div>
      <div v-else-if="activeTab === 'historial'">
        <!-- Contenido de la pestaña Historial -->
        <h2 class="text-xl font-bold text-white mb-4">Historial</h2>
        <!-- Contenido de Historial aquí -->
      </div>
    </div>

    <!-- Modal de confirmación para eliminar documento -->
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ¿Eliminar documento?
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Estás a punto de eliminar el documento <strong>{{ documentoAEliminar?.nombre }}</strong>. Esta acción no se puede deshacer.
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="cancelarEliminarDocumento" 
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Cancelar
            </button>
            <button @click="confirmarEliminarDocumento" 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAuditoriaStore } from '@/stores/auditoria'
import apiClient from '@/api/client'
import { useToast } from 'vue-toastification'

type BienAuditoria = {
  id_bien: number
  nombre_bien?: string
  codigo?: string
  descripcion?: string
}

// Estado de pestañas
const activeTab = ref('constatacion')

// Estado para documentos de bienes constatados
const fileInput = ref<HTMLInputElement | null>(null)
const bienDocuments = ref<Record<number, any[]>>({})
const currentDocumentBienId = ref<number | null>(null)
const expandedDocumentosBien = ref<number | null>(null)

// Estado para modal de confirmación
const showDeleteConfirmModal = ref(false)
const documentoAEliminar = ref<{ id: number; bienId: number; nombre: string } | null>(null)

// Estado de usuarios
const usuarios = ref<any[]>([])
const loadingUsuarios = ref(false)
const errorUsuarios = ref('')

const selectedUserAuditoria = ref<number|null>(null)

// Computed para obtener el usuario seleccionado completo
const usuarioSeleccionado = computed(() => {
  if (!selectedUserAuditoria.value) return null
  return usuarios.value.find((u: any) => u.id === selectedUserAuditoria.value)
})

const verBienesAuditoria = async (userId: number) => {
  selectedUserAuditoria.value = userId
  activeTab.value = 'auditoria'
  await cargarBienesAuditoriaUsuario(userId)
}

// Store de auditoría para sincronizar selecciones de bienes
const auditoriaStore = useAuditoriaStore()
const authStore = useAuthStore()
const toast = useToast()

// Estado para contadores de bienes por usuario
const contadoresBienes = ref<{ [userId: string]: number }>({})

// Estado para bienes en auditoría del usuario seleccionado
const bienesAuditoriaUsuario = ref<BienAuditoria[]>([])

// Función para cargar contadores de bienes para todos los usuarios
const cargarContadoresBienes = async () => {
  for (const user of usuarios.value) {
    try {
      const response = await apiClient.get(`/auditoria/selecciones/${user.id}`)
      contadoresBienes.value[user.id.toString()] = response.success ? (response.data?.length || 0) : 0
    } catch (error) {
      console.error(`Error loading contador for user ${user.id}:`, error)
      contadoresBienes.value[user.id.toString()] = 0
    }
  }
}

// Función para cargar bienes en auditoría de un usuario
const cargarBienesAuditoriaUsuario = async (userId: number) => {
  try {
    const response = await apiClient.get(`/auditoria/selecciones/${userId}`)
    bienesAuditoriaUsuario.value = response.success ? (response.data || []) : []
    
    // Cargar documentos de los bienes
    if (bienesAuditoriaUsuario.value.length > 0) {
      const bienIds = bienesAuditoriaUsuario.value.map((b: BienAuditoria) => b.id_bien)
      await cargarDocumentosUsuario(bienIds)
    }
  } catch (error) {
    console.error('Error loading bienes auditoria usuario:', error)
    bienesAuditoriaUsuario.value = []
  }
}

const deseleccionarBien = async (bienId: number) => {
  if (!selectedUserAuditoria.value) return

  try {
    const response = await apiClient.delete('/auditoria/deseleccionar', {
      data: {
        id_usuario: selectedUserAuditoria.value,
        id_bien: bienId,
      },
    })

    if (response.success) {
      bienesAuditoriaUsuario.value = bienesAuditoriaUsuario.value.filter((b: BienAuditoria) => b.id_bien !== bienId)
      // Limpiar documentos del bien
      delete bienDocuments.value[bienId]
      // Cerrar la lista de documentos si estaba expandida
      if (expandedDocumentosBien.value === bienId) {
        expandedDocumentosBien.value = null
      }
      await cargarContadoresBienes()
      toast.success('Bien desmarcado de constatación correctamente')
    } else {
      toast.error(response.message || 'No se pudo desmarcar el bien')
    }
  } catch (error) {
    console.error('Error al deseleccionar bien:', error)
    toast.error('Error al desmarcar el bien')
  }
}

const loadUsuarios = async () => {
  loadingUsuarios.value = true
  errorUsuarios.value = ''
  try {
    const response = await apiClient.get('/usuarios?activo=true')
    console.log('Respuesta /usuarios:', response)
    if (response.success && Array.isArray(response.data)) {
      usuarios.value = response.data
      // Cargar contadores de bienes para todos los usuarios
      await cargarContadoresBienes()
    } else {
      usuarios.value = []
      errorUsuarios.value = 'La respuesta de usuarios no es válida.'
    }
  } catch (e) {
    usuarios.value = []
    errorUsuarios.value = 'Error al cargar usuarios: ' + (typeof e === 'object' && e && 'message' in e ? (e as any).message : String(e))
    console.error('Error al cargar usuarios:', e)
  } finally {
    loadingUsuarios.value = false
  }
}

onMounted(() => {
  if (activeTab.value === 'constatacion') loadUsuarios()
})

watch(activeTab, (val: string) => {
  if (val === 'constatacion') loadUsuarios()
})

// --- Auditoría ---
const auditoria = ref<any[]>([])
const tipoAuditoria = ref('')
const searchQuery = ref('')
const loading = ref(false)

const loadAuditoria = async () => {
  loading.value = true
  try {
    // Attempt to fetch real logs
    const response = await apiClient.get('/logs')
    const data = response

    if (data.success && Array.isArray(data.data)) {
      auditoria.value = data.data
    } else {
      // Fallback or empty if structure differs
      auditoria.value = []
    }
  } catch (error) {
    console.warn('Error loading logs (optional feature):', error)
    toast.info('No se pudieron cargar los registros de auditoría (Backend pendiente)')
    auditoria.value = []
  } finally {
    loading.value = false
  }
}

const filteredAuditoria = computed(() => {
  let filtered = auditoria.value
  if (tipoAuditoria.value) {
    filtered = filtered.filter((r: any) => r.tipo === tipoAuditoria.value)
  }
  if (searchQuery.value) {
    filtered = filtered.filter(
      (r: any) =>
        (r.accion && r.accion.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (r.usuario && r.usuario.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (r.detalles && r.detalles.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  return filtered
})

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('es-EC', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Función para formatear tamaño de archivo
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Cargar documentos de un bien específico
const loadBienDocuments = async (bienId: number) => {
  try {
    const response = await apiClient.get(`/documentos?bien_id=${bienId}`)
    if (response.success) {
      bienDocuments.value[bienId] = response.data || []
    } else {
      bienDocuments.value[bienId] = []
    }
  } catch (error) {
    console.error(`Error loading documents for bien ${bienId}:`, error)
    bienDocuments.value[bienId] = []
  }
}

// Trigger para abrir el selector de archivos
const triggerDocumentUpload = (bienId: number) => {
  currentDocumentBienId.value = bienId
  fileInput.value?.click()
}

// Manejar el cambio de archivo seleccionado
const handleDocumentFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0 || !currentDocumentBienId.value) {
    return
  }

  const file = input.files[0]
  const bienId = currentDocumentBienId.value
  const formData = new FormData()
  formData.append('file', file)
  formData.append('id_bien', String(bienId))
  formData.append('tipo_documento', 'constatacion_fisica')
  formData.append('descripcion', 'Informe de constatación física')

  try {
    const response = await apiClient.post('/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.success) {
      toast.success('Documento de constatación subido correctamente')
      // Recargar documentos del bien
      await loadBienDocuments(bienId)
    } else {
      toast.error(response.message || 'Error subiendo documento')
    }
  } catch (error) {
    console.error('Error subiendo documento de constatación:', error)
    toast.error('Error subiendo documento')
  } finally {
    if (input) input.value = ''
    currentDocumentBienId.value = null
  }
}

// Ver un documento
const viewDocument = (document: any) => {
  if (!document || !document.id) {
    console.error('Documento inválido:', document)
    toast.error('Documento inválido')
    return
  }
  // Usar siempre la ruta de la API (/view serve el archivo con headers correctos)
  const url = `/api/documentos/${document.id}/view`
  console.log('Abriendo documento:', url)
  window.open(url, '_blank')
}

// Eliminar un documento
const deleteDocument = (docId: number, bienId: number, fileName: string) => {
  documentoAEliminar.value = { id: docId, bienId, nombre: fileName }
  showDeleteConfirmModal.value = true
}

// Confirmar eliminación
const confirmarEliminarDocumento = async () => {
  if (!documentoAEliminar.value) return

  const { id: docId, bienId } = documentoAEliminar.value

  try {
    const response = await apiClient.delete(`/documentos/${docId}`)

    if (response.success) {
      toast.success('Documento eliminado correctamente')
      // Recargar documentos del bien
      await loadBienDocuments(bienId)
    } else {
      toast.error(response.message || 'Error eliminando documento')
    }
  } catch (error) {
    console.error('Error eliminando documento:', error)
    toast.error('Error al eliminar documento')
  } finally {
    showDeleteConfirmModal.value = false
    documentoAEliminar.value = null
  }
}

// Cancelar eliminación
const cancelarEliminarDocumento = () => {
  showDeleteConfirmModal.value = false
  documentoAEliminar.value = null
}

// Alternar expansión de lista de documentos
const toggleDocumentosList = (bienId: number) => {
  if (expandedDocumentosBien.value === bienId) {
    expandedDocumentosBien.value = null
  } else {
    expandedDocumentosBien.value = bienId
  }
}

// Cargar documentos cuando se cambia de usuario en auditoría
const cargarDocumentosUsuario = async (bienesIds: number[]) => {
  for (const bienId of bienesIds) {
    if (bienId) {
      await loadBienDocuments(bienId)
    }
  }
}

onMounted(() => {
  if (activeTab.value === 'constatacion') loadUsuarios()
  loadAuditoria()
})
</script>
