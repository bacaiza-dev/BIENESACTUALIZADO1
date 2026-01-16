
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
    const form = ref({
      id: null,
      codigo: '',
      nombre: '',
      clase_de_bien: '',
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
      anioFabricacion: '',
      valorAdquisicion: '',
      valorActual: '',
      fechaAdquisicion: '',
      proveedor: '',
      descripcion: '',
      observaciones: '',
      frecuenciaMantenimiento: '',
      ultimoMantenimiento: '',
    })

    const errors = ref({})

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

    const clasesBienOptions = ref([
      'EQUIPO DE COMPUTO',
      'MOBILIARIO',
      'EQUIPO AUDIOVISUAL',
      'EQUIPO DE LABORATORIO',
      'HERRAMIENTAS',
      'OTROS',
    ])

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
        form.value.clase_de_bien &&
        form.value.categoria &&
        form.value.estado &&
        form.value.ubicacion &&
        form.value.responsable &&
        form.value.valorAdquisicion &&
        form.value.vida_util &&
        form.value.fechaAdquisicion
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

      if (!form.value.clase_de_bien) {
        errors.value.clase_de_bien = 'La clase de bien es requerida'
      }

      if (!form.value.categoria) {
        errors.value.categoria = 'La categoría es requerida'
      }

      if (!form.value.estado) {
        errors.value.estado = 'El estado es requerido'
      }

      if (!form.value.ubicacion) {
        errors.value.ubicacion = 'La ubicación es requerida'
      }

      if (!form.value.responsable) {
        errors.value.responsable = 'El responsable es requerido'
      }

      if (!form.value.valorAdquisicion || form.value.valorAdquisicion <= 0) {
        errors.value.valorAdquisicion = 'El valor de adquisición debe ser mayor a 0'
      }

      if (!form.value.fechaAdquisicion) {
        errors.value.fechaAdquisicion = 'La fecha de adquisición es requerida'
      }

      if (!form.value.vida_util || form.value.vida_util <= 0) {
        errors.value.vida_util = 'La vida útil debe ser mayor a 0'
      }

      return Object.keys(errors.value).length === 0
    }

    // Acciones
    const goBack = () => {
      router.back()
    }

    const saveBien = async () => {
      // Validaciones básicas
      if (!form.value.codigo || !form.value.nombre || !form.value.clase_de_bien || !form.value.categoria || !form.value.estado) {
        toast.error('Por favor completa los campos obligatorios')
        return
      }

      try {
        const endpoint = isEditing.value ? `/bienes/${form.value.id}` : '/bienes'

        const payload = {
            codigo_institucional: form.value.codigo,
            nombre: form.value.nombre,
            clase_de_bien: form.value.clase_de_bien,
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
            ubicacion_id: parseInt(form.value.ubicacion),
            responsable_id: parseInt(form.value.responsable),
            periodo_id: form.value.periodo_id ? parseInt(form.value.periodo_id) : null,
            observaciones: form.value.observaciones,
            codigo_senescyt: form.value.codigo_senescyt,
            nro_acta_entrega_recepcion: form.value.nro_acta_entrega_recepcion,
            nro_acta_constatacion_fisica: form.value.nro_acta_constatacion_fisica,
            color: form.value.color,
            material: form.value.material,
            proveedor: form.value.proveedor || null,
            anio_fabricacion: form.value.anioFabricacion ? parseInt(form.value.anioFabricacion, 10) : null,
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
          const mensaje = isEditing.value
            ? 'Bien actualizado correctamente'
            : 'Bien guardado correctamente'
          toast.success(mensaje)
          if (isEditing.value) {
            router.push(`/bienes/${form.value.id}`)
          } else {
            router.push('/bienes')
          }
        } else {
          throw new Error(data.message || 'Error al guardar bien')
        }
      } catch (error) {
        console.error('Error saving bien:', error)
        toast.error('Error al guardar el bien')
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
            clase_de_bien: bien.clase_de_bien || '',
            categoria: bien.categoria_id?.toString() || '',
            estado: bien.estado?.toLowerCase() || 'activo',
            ubicacion: bien.ubicacion_id?.toString() || '',
            responsable: bien.responsable_id?.toString() || '',
            marca: bien.marca || '',
            modelo: bien.modelo || '',
            serie: bien.serie || '',
            anioFabricacion:
              bien.anio_fabricacion !== null && bien.anio_fabricacion !== undefined && bien.anio_fabricacion !== ''
                ? String(bien.anio_fabricacion)
                : bien.fecha_adquisicion
                  ? new Date(bien.fecha_adquisicion).getFullYear().toString()
                  : '',
            valorAdquisicion: bien.valor?.toString() || '',
            fechaAdquisicion: bien.fecha_adquisicion || '',
            proveedor: bien.proveedor || '',
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
      }
    }

    const openConfirmModal = () => {
      if (!validateForm()) {
        toast.error('Por favor corrige los errores del formulario')
        return
      }
      showConfirmModal.value = true
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
      errors,
      usuarios,
      periodos,
      categorias,
      ubicaciones,
      clasesBienOptions,
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
      selectedResponsable
    }
  },
}
