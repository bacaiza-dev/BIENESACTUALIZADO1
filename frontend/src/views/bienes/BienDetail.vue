<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando información del bien...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Detalle del Bien</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Información completa del bien institucional
            </p>
          </div>
          <div class="flex space-x-3">
            <!-- Botones según rol -->
            <button
              v-if="isAdmin"
              @click="showQRModal = true"
              class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                />
              </svg>
              Ver QR
            </button>
            <button
              v-if="isAdmin"
              @click="downloadPDF"
              class="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Descargar PDF
            </button>
            <button
              v-if="isAdmin"
              @click="showEditModal = true"
              class="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </button>
            <button
              v-if="isAdmin"
              @click="deleteBien"
              class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Eliminar
            </button>
            <!-- Para usuario estándar -->
            <button
              v-if="!isAdmin && canViewQR"
              @click="showQRModal = true"
              class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z"
                />
              </svg>
              Ver QR
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Información principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Tarjeta de información básica -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Información Básica
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Código</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.codigo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Nombre</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.nombre }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Categoría</label
                >
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                  :class="getCategoriaClass(bien.categoria)"
                >
                  {{ bien.categoria }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Estado</label
                >
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                  :class="getEstadoClass(bien.estado)"
                >
                  {{ bien.estado }}
                </span>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Ubicación</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.ubicacion }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Responsable</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.responsable }}</p>
              </div>
            </div>
          </div>

          <!-- Tarjeta de especificaciones técnicas -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Especificaciones Técnicas
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Marca</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.marca }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Modelo</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.modelo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Serie</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.serie }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Año de Fabricación</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.anioFabricacion }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Valor Adquisición</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">
                  ${{ bien.valorAdquisicion.toLocaleString() }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Valor Actual</label
                >
                <p class="mt-1 text-sm text-gray-900 dark:text-white">
                  ${{ bien.valorActual.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>

          <!-- Tarjeta de historial -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Historial</h2>
            <div class="space-y-3">
              <div
                v-for="evento in bien.historial"
                :key="evento.id"
                class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div class="flex-shrink-0">
                  <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ evento.accion }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ evento.fecha }} - {{ evento.usuario }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Tarjeta de estado -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado Actual</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Condición</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  bien.condicion
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Último Mantenimiento</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  bien.ultimoMantenimiento
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Próximo Mantenimiento</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                  bien.proximoMantenimiento
                }}</span>
              </div>
            </div>
          </div>

          <!-- Tarjeta de documentos -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documentos</h3>
            <div class="space-y-2">
              <div
                v-for="doc in bien.documentos"
                :key="doc.id"
                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <span class="text-sm text-gray-900 dark:text-white">{{ doc.nombre }}</span>
                <button
                  class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Tarjeta de alertas -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alertas</h3>
            <div class="space-y-2">
              <div
                v-for="alerta in bien.alertas"
                :key="alerta.id"
                class="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded"
              >
                <svg
                  class="w-4 h-4 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span class="text-sm text-red-700 dark:text-red-400">{{ alerta.mensaje }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de QR -->
    <div
      v-if="showQRModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeQRModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Códigos QR del Bien</h2>
        <div class="flex flex-col items-center space-y-4">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">Código Institucional</p>
            <img :src="bien.qrInstitucional" alt="QR Institucional" class="w-32 h-32 mx-auto" />
          </div>
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">Código SENESCYT</p>
            <img :src="bien.qrSenescyt" alt="QR SENESCYT" class="w-32 h-32 mx-auto" />
          </div>
        </div>
        <div class="flex justify-end mt-6">
          <button
            @click="closeQRModal"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeEditModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Bien</h2>
        <form @submit.prevent="saveBien" class="space-y-4">
          <input
            v-model="editForm.codigo"
            type="text"
            placeholder="Código"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            v-model="editForm.nombre"
            type="text"
            placeholder="Nombre"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <select
            v-model="editForm.categoria"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">Categoría</option>
            <option value="tecnologia">Tecnología</option>
            <option value="mobiliario">Mobiliario</option>
            <option value="vehiculo">Vehículo</option>
            <option value="otros">Otros</option>
          </select>
          <input
            v-model="editForm.ubicacion"
            type="text"
            placeholder="Ubicación"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <select
            v-model="editForm.estado"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            <option value="">Estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="baja">De baja</option>
          </select>
          <input
            v-model="editForm.responsable"
            type="text"
            placeholder="Responsable"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <div class="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              @click="closeEditModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'BienDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    // Data del bien
    const bien = ref({
      id: null,
      codigo: '',
      codigo_institucional: '',
      codigo_senescyt: '',
      nombre: '',
      categoria: '',
      estado: '',
      ubicacion: '',
      responsable: '',
      marca: '',
      modelo: '',
      serie: '',
      anioFabricacion: '',
      valorAdquisicion: 0,
      valorActual: 0,
      fecha_adquisicion: '',
      descripcion: '',
      observaciones: '',
      condicion: '',
      ultimoMantenimiento: '',
      proximoMantenimiento: '',
      historial: [],
      documentos: [],
      alertas: [],
      qrInstitucional: '',
      qrSenescyt: '' 
    })

    const showQRModal = ref(false)
    const showEditModal = ref(false)
    const editForm = ref()

    const loading = ref(true)
    
    // Control de acceso por rol
    const isAdmin = computed(() => authStore.hasRole('Administrador'))
    const currentUser = computed(() => authStore.user?.nombre || '')

    const canViewQR = computed(() => {
      return bien.value.responsable === currentUser.value
    })

    // Clases para badges
    const getCategoriaClass = cat => {
      const map = {
        tecnologia: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        mobiliario: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        vehiculo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        otros: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      }
      return map[cat] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }

    const getEstadoClass = estado => {
      const map = {
        activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        baja: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      }
      return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }

    // Funciones de carga de datos
    const cargarBien = async () => {
      try {
        loading.value = true
        const bienId = route.params.id
        
        const response = await fetch(`/api/bienes/${bienId}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) throw new Error('Error al cargar bien')

        const data = await response.json()
        if (data.success) {
          const rawBien = data.data
          // Mapear datos del backend al formato esperado por el componente
          bien.value = {
            id: rawBien.id_bien,
            codigo: rawBien.codigo_institucional,
            codigo_institucional: rawBien.codigo_institucional, // Para QR
            codigo_senescyt: rawBien.codigo_senescyt,
            nombre: rawBien.nombre,
            categoria: rawBien.categoria_nombre || '',
            estado: rawBien.estado ? rawBien.estado.toLowerCase() : 'activo',
            ubicacion: rawBien.ubicacion_nombre || 'No asignada',
            responsable: rawBien.responsable_id ? `${rawBien.usuario_nombre} ${rawBien.usuario_apellidos}` : 'No asignado',
            marca: rawBien.marca || 'N/A',
            modelo: rawBien.modelo || 'N/A',
            serie: rawBien.serie || 'N/A',
            anioFabricacion: rawBien.fecha_adquisicion ? new Date(rawBien.fecha_adquisicion).getFullYear() : 'N/A',
            valorAdquisicion: rawBien.valor || 0,
            valorActual: rawBien.valor || 0, // Por ahora igual al valor de adquisición
            fecha_adquisicion: rawBien.fecha_adquisicion,
            descripcion: rawBien.descripcion || '',
            observaciones: rawBien.observaciones || '',
            condicion: 'Bueno', // Placeholder
            ultimoMantenimiento: 'No registrado', // Placeholder
            proximoMantenimiento: 'No programado', // Placeholder
            historial: [], // Se cargaría de endpoint historial-custodia/ubicacion
            documentos: [],
            alertas: [],
            qrInstitucional: `/api/generateQRCode/${rawBien.id_bien}/simple`, // Generar URLs para QR
            qrSenescyt: `/api/generateQRCode/${rawBien.id_bien}/compact`
          }
        } else {
          throw new Error(data.message || 'Error al cargar bien')
        }
      } catch (error) {
        console.error('Error cargando bien:', error)
        toast.error('Error al cargar los datos del bien')
        router.push('/bienes')
      } finally {
        loading.value = false
      }
    }

    // Acciones
    const closeQRModal = () => {
      showQRModal.value = false
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editForm.value = {}
    }

    const downloadPDF = () => {
      toast.info('Funcionalidad de descarga PDF próximamente')
    }

    const deleteBien = async () => {
      if (confirm('¿Estás seguro de que quieres eliminar este bien?')) {
        try {
          const response = await fetch(`/api/bienes/${bien.value.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${authStore.token}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) throw new Error('Error al eliminar bien')

          const data = await response.json()
          if (data.success) {
            toast.success('Bien eliminado correctamente')
            router.push('/bienes')
          } else {
            throw new Error(data.message || 'Error al eliminar bien')
          }
        } catch (error) {
          console.error('Error eliminando bien:', error)
          toast.error('Error al eliminar el bien')
        }
      }
    }

    const saveBien = async () => {
      try {
        const response = await fetch(`/api/bienes/${bien.value.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm.value)
        })

        if (!response.ok) throw new Error('Error al actualizar bien')

        const data = await response.json()
        if (data.success) {
          Object.assign(bien.value, editForm.value)
          closeEditModal()
          toast.success('Bien actualizado correctamente')
        } else {
          throw new Error(data.message || 'Error al actualizar bien')
        }
      } catch (error) {
        console.error('Error actualizando bien:', error)
        toast.error('Error al actualizar el bien')
      }
    }

    // Control de acceso por rol al cargar
    onMounted(async () => {
      await cargarBien()
      // Verificar acceso después de cargar los datos
      if (!isAdmin.value && bien.value.responsable !== currentUser.value) {
        toast.error('Acceso denegado: solo puedes ver tus propios bienes')
        router.push('/bienes')
      }
    })

    return {
      bien,
      loading,
      showQRModal,
      showEditModal,
      editForm,
      isAdmin,
      canViewQR,
      getCategoriaClass,
      getEstadoClass,
      cargarBien,
      closeQRModal,
      closeEditModal,
      downloadPDF,
      deleteBien,
      saveBien,
    }
  },
}
</script>
