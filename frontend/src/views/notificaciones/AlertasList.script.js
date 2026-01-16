
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'

export default {
  name: 'AlertasList',
  setup() {
    const authStore = useAuthStore()
    const toast = useToast()
    const isAdmin = computed(() => authStore.isAdmin)
    const loading = ref(false)

    // Estado de modales
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showDetailModal = ref(false)
    const selectedAlerta = ref(null)

    // Datos desde API
    const alertas = ref([])
    const bienes = ref([])

    // Cargar alertas desde API
    const loadAlertas = async () => {
      loading.value = true
      try {
        const response = await apiClient.get('/alertas')
        const data = response
        if (data.success) {
          alertas.value = (data.data || []).map(alerta => ({
            id: alerta.id_alerta,
            id_bien: alerta.id_bien,
            bien: {
              id: alerta.id_bien,
              codigo: alerta.codigo_institucional || `BIEN-${alerta.id_bien}`,
              nombre: alerta.bien_nombre || 'Sin nombre',
            },
            tipo_alerta: alerta.tipo_alerta || 'mantenimiento',
            descripcion: alerta.descripcion || '',
            estado: (alerta.estado || 'pendiente').toLowerCase(),
            prioridad: (alerta.prioridad || 'media').toLowerCase(),
            fecha_alerta: alerta.fecha_alerta,
            fecha_resolucion: alerta.fecha_resolucion,
          }))
        }
      } catch (error) {
        console.error('Error al cargar alertas:', error)
        toast.error('Error al cargar las alertas')
      } finally {
        loading.value = false
      }
    }

    // Cargar bienes para el selector
    const loadBienes = async () => {
      try {
        const response = await apiClient.get('/bienes')
        const data = response
        if (data.success) {
          bienes.value = (data.data || []).map(bien => ({
            id: bien.id ?? bien.id_bien,
            codigo: bien.codigo || bien.codigo_institucional || `BIEN-${bien.id ?? bien.id_bien}`,
            nombre: bien.nombre,
          }))
        }
      } catch (error) {
        console.error('Error al cargar bienes:', error)
      }
    }

    // Filtros
    const filters = ref({
      search: '',
      tipo: '',
      estado: '',
      fechaDesde: '',
    })

    // Formulario
    const form = ref({
      id: null,
      id_bien: '',
      tipo_alerta: '',
      descripcion: '',
      estado: 'pendiente',
      prioridad: 'media',
      fecha_alerta: new Date().toISOString().split('T')[0],
      fecha_resolucion: '',
    })

    // Paginación
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    // Computed properties
    const filteredAlertas = computed(() => {
      let result = alertas.value
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(
          a =>
            a.descripcion.toLowerCase().includes(search) ||
            a.bien.codigo.toLowerCase().includes(search) ||
            a.bien.nombre.toLowerCase().includes(search) ||
            a.tipo_alerta.toLowerCase().includes(search)
        )
      }
      if (filters.value.tipo) {
        result = result.filter(a => a.tipo_alerta === filters.value.tipo)
      }
      if (filters.value.estado) {
        result = result.filter(a => a.estado === filters.value.estado)
      }
      if (filters.value.fechaDesde) {
        result = result.filter(a => a.fecha_alerta >= filters.value.fechaDesde)
      }
      return result
    })

    const totalPages = computed(() => Math.ceil(filteredAlertas.value.length / itemsPerPage.value))
    const paginatedAlertas = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      return filteredAlertas.value.slice(start, start + itemsPerPage.value)
    })

    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    })

    // Métricas
    const alertasPendientes = computed(
      () => alertas.value.filter(a => a.estado === 'pendiente').length
    )
    const alertasMantenimiento = computed(
      () => alertas.value.filter(a => a.tipo_alerta === 'mantenimiento').length
    )
    const alertasDepreciacion = computed(
      () => alertas.value.filter(a => a.tipo_alerta === 'depreciacion').length
    )
    const alertasResueltasHoy = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      return alertas.value.filter(a => a.fecha_resolucion === today).length
    })

    // Métodos
    const clearFilters = () => {
      filters.value = { search: '', tipo: '', estado: '', fechaDesde: '' }
      currentPage.value = 1
    }

    const previousPage = () => {
      if (currentPage.value > 1) currentPage.value--
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++
    }

    const goToPage = page => {
      currentPage.value = page
    }

    const viewAlerta = alerta => {
      selectedAlerta.value = alerta
      showDetailModal.value = true
    }

    const editAlerta = alerta => {
      form.value = { ...alerta }
      showEditModal.value = true
    }

    const resolverAlerta = async alerta => {
      if (confirm('¿Marcar esta alerta como resuelta?')) {
        try {
          await apiClient.put(`/alertas/${alerta.id}`, { estado: 'resuelto' }) // Simplify resolver payload if needed, or send full object
          toast.success('Alerta marcada como resuelta')
          await loadAlertas()
        } catch (error) {
          toast.error('Error al resolver la alerta')
        }
      }
    }

    const deleteAlerta = async id => {
      if (confirm('¿Eliminar esta alerta?')) {
        try {
          await apiClient.delete(`/alertas/${id}`)
          toast.success('Alerta eliminada')
          await loadAlertas()
        } catch (error) {
          toast.error('Error al eliminar la alerta')
        }
      }
    }

    const saveAlerta = async () => {
      try {
        if (showEditModal.value) {
          await apiClient.put(`/alertas/${form.value.id}`, form.value)
          toast.success('Alerta actualizada exitosamente')
        } else {
          await apiClient.post('/alertas', form.value)
          toast.success('Alerta creada exitosamente')
        }
        closeModal()
        await loadAlertas()
      } catch (error) {
        toast.error('Error al guardar la alerta')
      }
    }

    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      form.value = {
        id: null,
        id_bien: '',
        tipo_alerta: '',
        descripcion: '',
        estado: 'pendiente',
        prioridad: 'media',
        fecha_alerta: new Date().toISOString().split('T')[0],
        fecha_resolucion: '',
      }
    }

    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedAlerta.value = null
    }

    // Helper functions para estilos
    const getTipoClass = (tipo) => {
      const classes = {
        mantenimiento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        depreciacion: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        garantia: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        transferencia: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        baja: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      }
      return classes[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }

    const getEstadoClass = (estado) => {
      const classes = {
        pendiente: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        en_proceso: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        resuelto: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        cancelado: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      }
      return classes[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }

    const getPrioridadClass = (prioridad) => {
      const classes = {
        baja: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        critica: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      }
      return classes[prioridad] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }

    const formatDate = (date) => {
      if (!date) return '—'
      try {
        return new Date(date).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' })
      } catch {
        return date
      }
    }

    // Lifecycle - cargar datos al montar
    onMounted(() => {
      loadAlertas()
      loadBienes()
    })

    return {
      authStore,
      isAdmin,
      loading,
      showCreateModal,
      showEditModal,
      showDetailModal,
      selectedAlerta,
      alertas,
      bienes,
      filters,
      form,
      currentPage,
      itemsPerPage,
      filteredAlertas,
      totalPages,
      paginatedAlertas,
      visiblePages,
      alertasPendientes,
      alertasMantenimiento,
      alertasDepreciacion,
      alertasResueltasHoy,
      clearFilters,
      previousPage,
      nextPage,
      goToPage,
      viewAlerta,
      editAlerta,
      resolverAlerta,
      deleteAlerta,
      saveAlerta,
      closeModal,
      closeDetailModal,
      getTipoClass,
      getEstadoClass,
      getPrioridadClass,
      formatDate,
      loadAlertas,
    }
  },
}
