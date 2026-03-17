
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'
import VueMultiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

export default {
  name: 'BienForm',
  components: { VueMultiselect },
  setup() {
    // Stores
    const authStore = useAuthStore()
    const toast = useToast()
    const router = useRouter()
    const route = useRoute()

    // Control de acceso por rol
    const isAdmin = computed(() => authStore.hasRole('Administrador'))

    // Estado del formulario
    const isEditing = ref(false)
    const showConfirmModal = ref(false)
    const showDeleteConfirmModal = ref(false)
    const documentToDelete = ref(null)
    const form = ref({
      id: null,
      codigo: '',
      nombre: '',
      categoria: '',
      estado: '',
      ubicacion: '',
      responsable: '',
      marca: '',
      codigo_senescyt: '',
      vida_util: 5,
      valor_residual: 0,
      nro_acta_entrega_recepcion: '',
      nro_acta_constatacion_fisica: '',
      color: '',
      material: '',
      periodo_id: '',
      modelo: '',
      serie: '',
      valorAdquisicion: '',
      valorActual: '',
      fechaAdquisicion: '',
      descripcion: '',
      observaciones: '',
      frecuenciaMantenimiento: '',
      ultimoMantenimiento: '',
    })

    const errors = ref({})

    // Estado de evidencias
    const evidenciasPendientes = ref([])
    const evidenciasExistentes = ref([]) // Para edición
    const imagenesPreview = ref([])
    const isDragging = ref(false)

    // Reactive objects for Multiselect
    const selectedCategoria = ref(null)
    const selectedUbicacion = ref(null)
    const selectedPeriodo = ref(null)
    const selectedResponsable = ref(null)

    // Períodos académicos dinámicos
    const periodos = ref([])

    // Datos reales de usuarios
    const usuarios = ref([])

    // Datos reales de categorías y ubicaciones
    const categorias = ref([])
    const ubicaciones = ref([])

    // clasesBienOptions removed

    // Watchers to sync Multiselect objects with form IDs
    watch(selectedCategoria, (newVal) => {
      form.value.categoria = newVal ? newVal.id : ''
    })
    watch(selectedUbicacion, (newVal) => {
      form.value.ubicacion = newVal ? newVal.id : ''
    })
    watch(selectedPeriodo, (newVal) => {
      form.value.periodo_id = newVal ? newVal.id : ''
    })
    watch(selectedResponsable, (newVal) => {
      form.value.responsable = newVal ? newVal.id : ''
    })

    // Cálculo de depreciación
    const depreciacionCalculada = computed(() => {
      if (!form.value.valorAdquisicion || !form.value.vida_util || !form.value.fechaAdquisicion) {
        return 0
      }

      const valorAdquisicion = parseFloat(form.value.valorAdquisicion)
      const vidaUtil = parseInt(form.value.vida_util)
      const valorResidual = parseFloat(form.value.valor_residual) || 0
      const fechaAdquisicion = new Date(form.value.fechaAdquisicion)
      const fechaActual = new Date()

      // Calcular años transcurridos
      const tiempoTranscurrido = (fechaActual - fechaAdquisicion) / (1000 * 60 * 60 * 24 * 365.25)
      const añosTranscurridos = Math.max(0, tiempoTranscurrido)

      // Depreciación lineal
      const depreciacionAnual = (valorAdquisicion - valorResidual) / vidaUtil
      const depreciacionAcumulada = Math.min(
        depreciacionAnual * añosTranscurridos,
        valorAdquisicion - valorResidual
      )

      return depreciacionAcumulada.toFixed(2)
    })

    const porcentajeDepreciacion = computed(() => {
      if (!form.value.valorAdquisicion || form.value.valorAdquisicion == 0) {
        return 0
      }
      const porcentaje = (depreciacionCalculada.value / form.value.valorAdquisicion) * 100
      return Math.min(100, porcentaje).toFixed(1)
    })

    // Validación del formulario
    const isFormValid = computed(() => {
      return (
        form.value.codigo &&
        form.value.nombre &&
        form.value.categoria &&
        form.value.estado &&
        // form.value.responsable && // Opcional
        form.value.marca &&
        form.value.modelo &&
        form.value.serie &&
        form.value.valorAdquisicion &&
        form.value.vida_util &&
        form.value.fechaAdquisicion &&
        form.value.nro_acta_entrega_recepcion &&
        form.value.nro_acta_constatacion_fisica &&
        form.value.color &&
        form.value.material &&
        form.value.periodo_id
      )
    })




    // Validaciones específicas
    const validateForm = () => {
      errors.value = {}

      if (!form.value.codigo) {
        errors.value.codigo = 'El código es requerido'
      }

      if (!form.value.nombre) {
        errors.value.nombre = 'El nombre es requerido'
      }

      if (!form.value.categoria) {
        errors.value.categoria = 'La categoría es requerida'
      }

      if (!form.value.estado) {
        errors.value.estado = 'El estado es requerido'
      }

      /* Responsable es opcional */

      if (!form.value.valorAdquisicion || form.value.valorAdquisicion <= 0) {
        errors.value.valorAdquisicion = 'El valor de adquisición debe ser mayor a 0'
      }

      if (!form.value.fechaAdquisicion) {
        errors.value.fechaAdquisicion = 'La fecha de adquisición es requerida'
      }

      if (!form.value.vida_util || form.value.vida_util <= 0) {
        errors.value.vida_util = 'La vida útil debe ser mayor a 0'
      }

      if (!form.value.marca) errors.value.marca = 'La marca es requerida';
      if (!form.value.modelo) errors.value.modelo = 'El modelo es requerido';
      if (!form.value.serie) errors.value.serie = 'La serie es requerida';
      // Allow 'N/A' (no aplica) to be used by multiple bienes
      // `codigo_senescyt` es opcional: validar solo si se proporcionó
      if (form.value.codigo_senescyt) {
        const sn = String(form.value.codigo_senescyt).trim()
        if (sn.length === 0) {
          errors.value.codigo_senescyt = 'El código SENESCYT es requerido'
        }
        // 'N/A' será tratado como no aplicable durante el envío (mapeo en saveBien)
      }
      if (!form.value.color) errors.value.color = 'El color es requerido';
      if (!form.value.material) errors.value.material = 'El material es requerido';
      if (!form.value.nro_acta_entrega_recepcion) errors.value.nro_acta_entrega_recepcion = 'El Nro. Acta Entrega es requerido';
      if (!form.value.nro_acta_constatacion_fisica) errors.value.nro_acta_constatacion_fisica = 'El Nro. Acta Constatación es requerido';
      if (!form.value.periodo_id) errors.value.periodo_id = 'El período académico es requerido';


      return Object.keys(errors.value).length === 0
    }

    // Acciones
    const goBack = () => {
      router.back()
    }

    const saveBien = async () => {
      // Validaciones básicas
      if (!isFormValid.value) {
        toast.error('Por favor completa TODOS los campos obligatorios')
        return
      }

      try {
        const endpoint = isEditing.value ? `/bienes/${form.value.id}` : '/bienes'

        const payload = {
            codigo_institucional: form.value.codigo,
            nombre: form.value.nombre,
            descripcion: form.value.descripcion,
            marca: form.value.marca,
            modelo: form.value.modelo,
            serie: form.value.serie,
            estado: form.value.estado.toUpperCase(),
            valor: parseFloat(form.value.valorAdquisicion || 0),
            fecha_adquisicion: form.value.fechaAdquisicion,
            vida_util: parseInt(form.value.vida_util),
            valor_residual: parseFloat(form.value.valor_residual) || 0,
            categoria_id: parseInt(form.value.categoria),
            ubicacion_id: form.value.ubicacion ? parseInt(form.value.ubicacion) : null,
            responsable_id: form.value.responsable ? parseInt(form.value.responsable) : null,
            periodo_id: form.value.periodo_id ? parseInt(form.value.periodo_id) : null,
            observaciones: form.value.observaciones,
            // Treat 'N/A' (case-insensitive) as not-applicable -> send null to DB
            codigo_senescyt: (function(v){ const s = String(v || '').trim(); return (/^n\/?a$/i.test(s) || s === '') ? null : s })(form.value.codigo_senescyt),
            nro_acta_entrega_recepcion: form.value.nro_acta_entrega_recepcion,
            nro_acta_constatacion_fisica: form.value.nro_acta_constatacion_fisica,
            color: form.value.color,
            material: form.value.material,
            depreciacion_acumulada:
              depreciacionCalculada.value !== null && depreciacionCalculada.value !== undefined
                ? Number(depreciacionCalculada.value)
                : null,
        }

        let response;
        if (isEditing.value) {
            response = await apiClient.put(endpoint, payload)
        } else {
            response = await apiClient.post(endpoint, payload)
        }

        const data = response
        if (data.success) {
          // Clear previous server validation errors
          errors.value = {}

          const mensaje = isEditing.value
            ? 'Bien actualizado correctamente'
            : 'Bien guardado correctamente'
          toast.success(mensaje)

          // Subir evidencias si hay archivos pendientes
          if (evidenciasPendientes.value.length > 0) {
            const bienId = data.data?.id || data.data?.id_bien || form.value.id
            const count = evidenciasPendientes.value.length; // Capture count
            if (bienId) {
              await uploadEvidencias(bienId)
              toast.info(`${count} evidencias subidas`)
            }
          }

          if (isEditing.value) {
            router.push(`/bienes/${form.value.id}`)
          } else {
            router.push('/bienes')
          }

          return
        }

        // --- Manejo de error informado por el backend (sin lanzar excepción) ---
        const serverMsg = data?.message || 'Error al guardar el bien'
        // Si el backend envía errores de validación, mapearlos al objeto `errors` usado por el formulario
        const serverErrors = (data && (data.errors || data.data?.errors)) || null
        if (serverErrors && typeof serverErrors === 'object') {
          // Mapeo conocido de campos del backend -> campos del formulario
          const fieldMap = {
            codigo_institucional: 'codigo',
            codigo_senescyt: 'codigo_senescyt',
            categoria_id: 'categoria',
            ubicacion_id: 'ubicacion',
            responsable_id: 'responsable',
            vida_util: 'vida_util',
            valor: 'valorAdquisicion',
            periodo_id: 'periodo_id',
            nro_acta_entrega_recepcion: 'nro_acta_entrega_recepcion',
            nro_acta_constatacion_fisica: 'nro_acta_constatacion_fisica',
            modelo: 'modelo',
            serie: 'serie',
            marca: 'marca',
            nombre: 'nombre',
            codigo_senescyt_unico: 'codigo_senescyt'
          }
          Object.entries(serverErrors).forEach(([k, v]) => {
            const target = fieldMap[k] || k
            // v puede ser array o string
            errors.value[target] = Array.isArray(v) ? v.join(', ') : String(v)
          })
        }

        // Mostrar mensaje específico del backend cuando exista
        if (serverMsg) {
          toast.error(serverMsg)
          console.warn('Backend validation / error:', serverErrors || serverMsg)
          return
        }

      } catch (error) {
        // Capturar errores lanzados (axios, network, etc.) y mostrar mensaje concreto si está disponible
        console.error('Error saving bien:', error)
        const resp = error?.response?.data
        // Priorizar message del backend
        const msg = resp?.message || error?.message || 'Error al guardar el bien'

        // Mapear errores de validación si vienen en response.data.errors
        const validation = resp?.errors || resp?.data?.errors || null
        if (validation && typeof validation === 'object') {
          const fieldMap = {
            codigo_institucional: 'codigo',
            codigo_senescyt: 'codigo_senescyt',
            categoria_id: 'categoria',
            ubicacion_id: 'ubicacion',
            responsable_id: 'responsable',
            vida_util: 'vida_util',
            valor: 'valorAdquisicion',
            periodo_id: 'periodo_id',
            nro_acta_entrega_recepcion: 'nro_acta_entrega_recepcion',
            nro_acta_constatacion_fisica: 'nro_acta_constatacion_fisica',
          }
          Object.entries(validation).forEach(([k, v]) => {
            const target = fieldMap[k] || k
            errors.value[target] = Array.isArray(v) ? v.join(', ') : String(v)
          })
        }

        toast.error(msg)
      }
    }

    // Control de acceso por rol al cargar
    onMounted(async () => {
      // Verificar permisos de administrador
      if (!authStore.hasRole('Administrador')) {
        toast.error('Acceso denegado: solo administradores pueden crear/editar bienes')
        router.push('/bienes')
        return
      }

      // Cargar datos iniciales
      try {
        await Promise.all([loadUsuarios(), loadPeriodos(), loadCategorias(), loadUbicaciones()])
      } catch (error) {
        console.error('Error loading catalog data:', error)
      }

      // Verificar si estamos editando
      const bienId = route.params.id
      if (bienId) {
        isEditing.value = true
        await loadBienData(String(bienId))
      }
    })

    const loadBienData = async (id) => {
      try {
        const response = await apiClient.get(`/bienes/${id}`)

        const data = response
        if (data.success) {
          const bien = data.data
          form.value = {
            id: bien.id ?? bien.id_bien,
            codigo: bien.codigo_institucional || bien.codigo || '',
            nombre: bien.nombre,
            categoria: bien.categoria_id?.toString() || '',
            estado: bien.estado?.toLowerCase() || 'bueno',
            ubicacion: bien.ubicacion_id?.toString() || '',
            responsable: bien.responsable_id?.toString() || '',
            marca: bien.marca || '',
            modelo: bien.modelo || '',
            serie: bien.serie || '',
            valorAdquisicion: bien.valor?.toString() || '',
            fechaAdquisicion: bien.fecha_adquisicion || '',
            descripcion: bien.descripcion || '',
            observaciones: bien.observaciones || '',
            codigo_senescyt: bien.codigo_senescyt || '',
            vida_util: bien.vida_util || 5,
            valor_residual: bien.valor_residual || 0,
            nro_acta_entrega_recepcion: bien.nro_acta_entrega_recepcion || '',
            nro_acta_constatacion_fisica: bien.nro_acta_constatacion_fisica || '',
            color: bien.color || '',
            material: bien.material || '',
            periodo_id: bien.periodo_id?.toString() || '',
          }

          // Pre-fill Multiselect objects
          if (bien.categoria_id) {
            selectedCategoria.value = categorias.value.find(c => c.id == bien.categoria_id)
          }
          if (bien.ubicacion_id) {
            selectedUbicacion.value = ubicaciones.value.find(u => u.id == bien.ubicacion_id)
          }
          if (bien.periodo_id) {
            selectedPeriodo.value = periodos.value.find(p => p.id == bien.periodo_id)
          }
          if (bien.responsable_id) {
            selectedResponsable.value = usuarios.value.find(u => u.id == bien.responsable_id)
          }

          // Cargar evidencias existentes
          if (bien.documentos && Array.isArray(bien.documentos)) {
            evidenciasExistentes.value = bien.documentos
          }
        } else {
          throw new Error(data.message || 'Error al cargar bien')
        }
      } catch (error) {
        console.error('Error loading bien:', error)
        toast.error('Error al cargar los datos del bien')
      }
    }

    const loadUsuarios = async () => {
      try {
        const response = await apiClient.get('/usuarios')

        const data = response
        if (data.success) {
          usuarios.value = (data.data || []).map((u) => ({
            ...u,
            id: u.id ?? u.id_usuario,
            nombre: u.nombre ?? u.nombres,
            apellido: u.apellido ?? u.apellidos,
          }))
        } else {
          throw new Error(data.message || 'Error al cargar usuarios')
        }
      } catch (error) {
        console.error('Error loading usuarios:', error)
        usuarios.value = []
        toast.error('Error al cargar usuarios')
      }
    }

    const loadPeriodos = async () => {
      try {
        const response = await apiClient.get('/periodos-academicos')

        const data = response
        if (data.success) {
          periodos.value = (data.data || []).map((p) => ({
            ...p,
            id: p.id ?? p.id_periodo,
            nombre: p.nombre ?? p.nombre_periodo,
          }))
        } else {
          throw new Error(data.message || 'Error al cargar períodos')
        }
      } catch (error) {
        console.error('Error loading periodos:', error)
        periodos.value = []
        // No mostrar error si no hay periodos, es opcional
      }
    }

    const loadCategorias = async () => {
      try {
        const response = await apiClient.get('/categorias')

        const data = response
        if (data.success) {
          categorias.value = (data.data || []).map((c) => ({
            ...c,
            id: c.id ?? c.id_categoria,
            nombre: c.nombre ?? c.nombre_categoria,
          }))
        } else {
          categorias.value = []
        }
      } catch (error) {
        console.error('Error loading categorias:', error)
        categorias.value = []
      }
    }

    const loadUbicaciones = async () => {
      try {
        const response = await apiClient.get('/ubicaciones')

        const data = response
        if (data.success) {
          ubicaciones.value = (data.data || []).map((u) => ({
            ...u,
            id: u.id ?? u.id_ubicacion,
            nombre: u.nombre ?? u.area,
          }))
        } else {
          ubicaciones.value = []
        }
      } catch (error) {
        console.error('Error loading ubicaciones:', error)
        ubicaciones.value = []
        ubicaciones.value = []
      }
    }

    const openConfirmModal = () => {
      if (!validateForm()) {
        toast.error('Por favor corrige los errores del formulario')
        return
      }
      showConfirmModal.value = true
    }

    // ========== FUNCIONES DE EVIDENCIAS ==========
    
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      addFiles(files)
    }

    const handleFileDrop = (event) => {
      isDragging.value = false
      const files = Array.from(event.dataTransfer.files)
      addFiles(files)
    }

    const addFiles = (files) => {
      const validTypes = ['image/', 'application/pdf', 'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      
      for (const file of files) {
        const isValid = validTypes.some(type => file.type.startsWith(type))
        if (!isValid) {
          toast.warning(`Archivo ${file.name} no es un tipo válido`)
          continue
        }
        if (file.size > 20 * 1024 * 1024) {
          toast.warning(`Archivo ${file.name} excede 20MB`)
          continue
        }
        
        // Agregar tipoEvidencia al archivo
        file.tipoEvidencia = file.type.startsWith('image/') ? 'foto' : 'otro'
        evidenciasPendientes.value.push(file)
        
        // Generar preview si es imagen
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            imagenesPreview.value.push({ url: e.target.result, name: file.name })
          }
          reader.readAsDataURL(file)
        }
      }
    }

    const removeFile = (index) => {
      const file = evidenciasPendientes.value[index]
      evidenciasPendientes.value.splice(index, 1)
      
      // Remover preview si es imagen
      if (file.type.startsWith('image/')) {
        const previewIndex = imagenesPreview.value.findIndex(p => p.name === file.name)
        if (previewIndex > -1) {
          imagenesPreview.value.splice(previewIndex, 1)
        }
      }
    }

    const requestDeleteDocument = (id, index) => {
        documentToDelete.value = { id, index }
        showDeleteConfirmModal.value = true
    }

    const cancelDeleteDocument = () => {
        showDeleteConfirmModal.value = false
        documentToDelete.value = null
    }

    const confirmDeleteDocument = async () => {
        if (!documentToDelete.value) return
        
        const { id, index } = documentToDelete.value
        
        try {
            const response = await apiClient.delete(`/documentos/${id}`)
            // Siempre eliminar de la vista, ya sea éxito o error (optimista/limpieza)
            evidenciasExistentes.value.splice(index, 1);
            toast.success('Documento eliminado');
        } catch (e) {
            console.error(e)
            // Si falla, igual lo quitamos de la vista porque probablemente ya no existe o hay error de permisos
            evidenciasExistentes.value.splice(index, 1);
            toast.warning('Documento eliminado de la vista');
        } finally {
            showDeleteConfirmModal.value = false
            documentToDelete.value = null
        }
    }

    const getFileIcon = (mimeType) => {
      if (!mimeType) return 'bx bx-file text-gray-500'
      if (mimeType.startsWith('image/')) return 'bx bx-image text-blue-500'
      if (mimeType.includes('pdf')) return 'bx bxs-file-pdf text-red-500'
      if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'bx bxs-file-export text-green-500'
      if (mimeType.includes('word') || mimeType.includes('document')) return 'bx bxs-file-doc text-blue-600'
      return 'bx bx-file text-gray-500'
    }

    const formatFileSize = (bytes) => {
      if (!bytes) return '0 B'
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }

    const uploadEvidencias = async (bienId) => {
      if (evidenciasPendientes.value.length === 0) return
      
      for (const file of evidenciasPendientes.value) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('id_bien', bienId)
          formData.append('tipo_documento', file.tipoEvidencia || 'foto')
          formData.append('descripcion', `Evidencia de entrega - ${file.name}`)
          
          await fetch('/api/documentos', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData
          })
        } catch (error) {
          console.error('Error subiendo evidencia:', error)
        }
      }
      
      // Limpiar después de subir
      evidenciasPendientes.value = []
      imagenesPreview.value = []
    }

    const downloadDocument = async (doc) => {
      try {
        toast.info('Iniciando descarga...')
        const response = await apiClient.get(doc.url, { 
          responseType: 'blob', 
          baseURL: '' 
        })
        
        const blob = response
        if (!(blob instanceof Blob)) {
           throw new Error('El archivo no es válido')
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
        toast.error('Error al descargar documento')
      }
    }

    const confirmSave = async () => {
      showConfirmModal.value = false
      await saveBien()
    }

    return {
      isAdmin,
      isEditing,
      showConfirmModal,
      form,
      downloadDocument,
      // Delete modal exports
      showDeleteConfirmModal,
      requestDeleteDocument,
      cancelDeleteDocument,
      confirmDeleteDocument,
      errors,
      usuarios,
      periodos,
      categorias,
      ubicaciones,

      depreciacionCalculada,
      porcentajeDepreciacion,
      isFormValid,
      validateForm,
      goBack,
      saveBien,
      openConfirmModal,
      confirmSave,
      selectedCategoria,
      selectedUbicacion,
      selectedPeriodo,
      selectedResponsable,
      // Evidencias
      evidenciasPendientes,
      evidenciasExistentes,
      imagenesPreview,
      isDragging,
      handleFileSelect,
      handleFileDrop,
      removeFile,
      getFileIcon,
      formatFileSize
    }
  }
}