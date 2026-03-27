
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'
import QRCode from 'qrcode'

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
      responsable_id: null,
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

    const loading = ref(true)
    
    // Control de acceso por rol
    const isAdmin = computed(() => authStore.hasRole('Administrador'))
    const currentUserId = computed(() => authStore.user?.id || null)

    const canViewQR = computed(() => {
      return isAdmin.value || (!!bien.value.responsable_id && bien.value.responsable_id === currentUserId.value)
    })

    const goToEdit = () => {
      if (!bien.value.id) return
      router.push(`/bienes/${bien.value.id}/edit`)
    }

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
        
        const response = await apiClient.get(`/bienes/${bienId}`)

        const data = response
        if (data.success) {
          const rawBien = data.data
          // Mapear datos del backend al formato esperado por el componente
          bien.value = {
            id: rawBien.id ?? rawBien.id_bien,
            codigo: rawBien.codigo_institucional,
            codigo_institucional: rawBien.codigo_institucional, // Para QR
            codigo_senescyt: rawBien.codigo_senescyt,
            nombre: rawBien.nombre,
            categoria: rawBien.categoria?.nombre || '',
            estado: rawBien.estado || 'activo',
            ubicacion: rawBien.ubicacion?.nombre || 'No asignada',
            responsable: rawBien.responsable
              ? `${rawBien.responsable.nombre || ''} ${rawBien.responsable.apellido || ''}`.trim() || 'No asignado'
              : 'No asignado',
            responsable_id: rawBien.responsable?.id || rawBien.responsable_id || null,
            marca: rawBien.marca || 'N/A',
            modelo: rawBien.modelo || 'N/A',
            serie: rawBien.serie || 'N/A',
            anioFabricacion: rawBien.anio_fabricacion || (rawBien.fecha_adquisicion ? new Date(rawBien.fecha_adquisicion).getFullYear() : 'N/A'),
            valorAdquisicion: Number(rawBien.valor_adquisicion || rawBien.valor || 0),
            valorActual: Number(rawBien.valor_adquisicion || rawBien.valor || 0), // Por ahora igual al valor de adquisición
            fecha_adquisicion: rawBien.fecha_adquisicion,
            created_at: rawBien.created_at,
            updated_at: rawBien.updated_at,
            descripcion: rawBien.descripcion || '',
            observaciones: rawBien.observaciones || '',
            condicion: 'Bueno', // Placeholder
            ultimoMantenimiento: 'No registrado', // Placeholder
            proximoMantenimiento: 'No programado', // Placeholder
            historial: [], // Se cargaría de endpoint historial-custodia/ubicacion
            documentos: [],
            alertas: [],
            qrInstitucional: `/api/generateQRCode/${rawBien.id ?? rawBien.id_bien}/simple`, // Generar URLs para QR
            qrSenescyt: `/api/generateQRCode/${rawBien.id ?? rawBien.id_bien}/compact`
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

    // Cargar documentos asociados al bien
    const cargarDocumentosDelBien = async () => {
      try {
        const bienId = route.params.id
        const response = await apiClient.get('/documentos', { params: { bien_id: bienId } })
        const data = response
        if (data && data.success) {
          const docs = (data.data || []).map((d) => ({
              id: d.id,
              nombre: d.nombre_archivo || d.nombre || d.nombre_archivo,
              nombre_archivo: d.nombre_archivo || d.nombre,
              url: `/api/documentos/${d.id}/download`,
              tamano: d.tamano,
              mime_type: d.mime_type,
              descripcion: d.descripcion
            }))
          bien.value.documentos = docs
        } else {
          bien.value.documentos = []
        }
      } catch (error) {
        console.error('Error cargando documentos del bien:', error)
        bien.value.documentos = []
      }
    }

    // Cargar historial de responsables
    const cargarHistorialResponsables = async () => {
      try {
        const bienId = route.params.id
        const response = await apiClient.get(`/bienes/${bienId}/historial-responsables`)
        if (response.success && response.data) {
          bien.value.historial = response.data.map((evento) => ({
            id: evento.id,
            accion: evento.responsable_anterior && evento.responsable_nuevo 
              ? `Transferencia: ${evento.responsable_anterior} → ${evento.responsable_nuevo}`
              : evento.responsable_nuevo
              ? `Asignado a: ${evento.responsable_nuevo}`
              : `Removido de: ${evento.responsable_anterior}`,
            fecha: evento.fecha_cambio ? new Date(evento.fecha_cambio).toLocaleString() : '',
            usuario: evento.usuario_que_cambio || 'Sistema',
            responsable_anterior: evento.responsable_anterior,
            responsable_nuevo: evento.responsable_nuevo
          }))
        } else {
          bien.value.historial = []
        }
      } catch (error) {
        console.error('Error cargando historial de responsables:', error)
        bien.value.historial = []
      }
    }

    // Acciones
    const closeQRModal = () => {
      showQRModal.value = false
    }

    const goBack = () => {
      router.push('/bienes')
    }

    const deleteBien = async () => {
      if (confirm('¿Estás seguro de que quieres eliminar este bien?')) {
        try {
          const response = await apiClient.delete(`/bienes/${bien.value.id}`)

          const data = response
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

    const downloadDocument = async (doc) => {
      try {
        toast.info('Iniciando descarga...')
        // Usar baseURL vacío porque la URL del documento ya es absoluta (empieza con /api)
        const response = await apiClient.get(doc.url, { 
          responseType: 'blob',
          baseURL: '' 
        })
        
        const blob = response
        if (!(blob instanceof Blob)) {
           throw new Error('El archivo descargado no es válido')
        }

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', doc.nombre_archivo || doc.nombre || 'documento')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error descargando documento:', error)
        toast.error('Error al descargar: ' + (error.message || 'Error desconocido'))
      }
    }

    const viewDocument = async (doc) => {
      try {
        toast.info('Abriendo vista previa...')
        // Usar fetch directamente para evitar transformaciones del cliente axios
        const token = localStorage.getItem('authToken')
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
        
        const response = await fetch(`/api/documentos/${doc.id}/view`, {
          headers
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        window.open(url, '_blank')
        // No revocar inmediatamente para evitar pestaña vacía; el navegador controla la liberación
      } catch (error) {
        console.error('Error mostrando documento:', error)
        toast.error('Error al mostrar vista previa: ' + (error.message || 'Error desconocido'))
      }
    }

    // Generar QR visual cuando se abre el modal
    const generateQRCode = async () => {
      await nextTick()
      const container = document.getElementById('qr-container')
      if (!container) return
      
      container.innerHTML = ''
      
      // Crear texto simplificado para el QR
      const textoQR = `=== INT BIENES ===
Código: ${bien.value.codigo_institucional || 'N/A'}
SENESCYT: ${bien.value.codigo_senescyt || 'N/A'}
Nombre: ${bien.value.nombre || 'N/A'}
Categoría: ${bien.value.categoria || 'N/A'}
Ubicación: ${bien.value.ubicacion || 'N/A'}
Responsable: ${bien.value.responsable || 'N/A'}
==================
${window.location.origin}/bienes/${bien.value.id}`
      
      try {
        const canvas = document.createElement('canvas')
        await QRCode.toCanvas(canvas, textoQR, {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
          errorCorrectionLevel: 'M'
        })
        container.appendChild(canvas)
      } catch (error) {
        console.error('Error generando QR:', error)
        container.innerHTML = '<p class="text-red-500">Error al generar QR</p>'
      }
    }

    // Watcher para generar QR cuando se abre el modal
    watch(showQRModal, (isOpen) => {
      if (isOpen) {
        generateQRCode()
      }
    })

    // Control de acceso por rol al cargar
    onMounted(async () => {
      await cargarBien()
      await cargarDocumentosDelBien()
      await cargarHistorialResponsables()
      // Verificar acceso después de cargar los datos
      if (!isAdmin.value && bien.value.responsable_id !== currentUserId.value) {
        toast.error('Acceso denegado: solo puedes ver tus propios bienes')
        router.push('/bienes')
      }
    })

    return {
      bien,
      loading,
      showQRModal,
      isAdmin,
      canViewQR,
      getCategoriaClass,
      getEstadoClass,
      cargarBien,
      closeQRModal,
      goToEdit,
      deleteBien,
      goBack,
      downloadDocument,
      viewDocument,
    }
  },
}
