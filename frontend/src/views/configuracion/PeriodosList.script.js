
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'
import { useToast } from 'vue-toastification'

export default {
  name: 'PeriodosList',
  setup() {
    // Control de acceso por rol
    const authStore = useAuthStore()
    const toast = useToast()
    const isAdmin = computed(() => authStore.hasRole('Administrador'))

    // Data de períodos
    const periodos = ref([])
    const loading = ref(false)


    const filters = ref({
      search: '',
      estado: '',
      tipo: '',
    })

    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    const selectedPeriodo = ref(null)
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    const form = ref({
      id: null,
      nombre: '',
      anio: '',
      tipo: '',
      fechaInicio: '',
      fechaFin: '',
      estado: '',
      descripcion: '',
      observaciones: '',
    })

    // Filtros y búsqueda
    const filteredPeriodos = computed(() => {
      let result = periodos.value
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(
          p => p.nombre.toLowerCase().includes(search) || p.anio.toString().includes(search)
        )
      }
      if (filters.value.estado) {
        result = result.filter(p => p.estado === filters.value.estado)
      }
      if (filters.value.tipo) {
        result = result.filter(p => p.tipo === filters.value.tipo)
      }
      return result
    })

    // Paginación
    const totalPages = computed(() => Math.ceil(filteredPeriodos.value.length / itemsPerPage.value))
    const paginatedPeriodos = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      return filteredPeriodos.value.slice(start, start + itemsPerPage.value)
    })
    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      for (let i = start; i <= end; i++) pages.push(i)
      return pages
    })

    // Clases para badges
    const getTipoClass = tipo => {
      const map = {
        semestre: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        trimestre: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        cuatrimestre: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        anual: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      }
      return map[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }

    const getEstadoClass = estado => {
      const map = {
        activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        finalizado: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        planificado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      }
      return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }

    // Acciones
    const clearFilters = () => {
      filters.value = { search: '', estado: '', tipo: '' }
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

    const loadPeriodos = async () => {
      loading.value = true
      try {
        const response = await apiClient.get('/periodos-academicos')
        const data = response
        if (data.success) {
             const today = new Date()
             periodos.value = (data.data || []).map(p => {
               const fechaInicio = p.fechaInicio ?? p.fecha_inicio ?? ''
               const fechaFin = p.fechaFin ?? p.fecha_fin ?? ''

               const startDate = fechaInicio ? new Date(fechaInicio) : null
               const endDate = fechaFin ? new Date(fechaFin) : null

               const computedEstado = (() => {
                 if (startDate && !Number.isNaN(startDate.getTime()) && today < startDate) return 'planificado'
                 if (endDate && !Number.isNaN(endDate.getTime()) && today > endDate) return 'finalizado'
                 if (typeof p.activo === 'boolean') return p.activo ? 'activo' : 'inactivo'
                 if (p.estado) return p.estado
                 return 'inactivo'
               })()

               const computedDuracion = calculateDuration(fechaInicio, fechaFin)

               return {
                 ...p,
                 anio: p.anio ?? '',
                 tipo: p.tipo ?? '',
                 estado: computedEstado,
                 fechaInicio,
                 fechaFin,
                 duracion: p.duracion ?? computedDuracion,
                 bienesAsignados: p.bienesAsignados ?? 0,
                 descripcion: p.descripcion ?? '',
                 observaciones: p.observaciones ?? '',
               }
             })
         }
      } catch (error) {
        console.error('Error cargando periodos:', error)
        toast.error('Error al cargar períodos')
      } finally {
        loading.value = false
      }
    }

    const viewPeriodo = periodo => {
      selectedPeriodo.value = periodo
      showViewModal.value = true
    }

    const editPeriodo = periodo => {
      form.value = { ...periodo }
      showEditModal.value = true
    }

    const togglePeriodoStatus = async (periodo) => {
      const newStatus = periodo.estado === 'activo' ? 'inactivo' : 'activo'
      try {
        const response = await apiClient.put(`/periodos-academicos/${periodo.id}`, {
            ...periodo,
            estado: newStatus
        })
        const data = response
        if (data.success) {
            const index = periodos.value.findIndex(p => p.id === periodo.id)
            if (index !== -1) {
                periodos.value[index].estado = newStatus
                periodos.value[index].activo = newStatus === 'activo'
            }
            toast.success('Estado actualizado correctamente')
        }
      } catch (error) {
         toast.error('Error al cambiar estado')
      }
    }

    const deletePeriodo = async (id) => {
      if (confirm('¿Estás seguro de que quieres eliminar este período?')) {
        try {
            const response = await apiClient.delete(`/periodos-academicos/${id}`)
            if (response.success) {
                periodos.value = periodos.value.filter(p => p.id !== id)
                toast.success('Período eliminado')
            }
        } catch (error) {
            toast.error('Error al eliminar período')
        }
      }
    }

    const savePeriodo = async () => {
      try {
          let response;
          const payload = {
              ...form.value,
              duracion: calculateDuration(form.value.fechaInicio, form.value.fechaFin)
          }

          if (showEditModal.value) {
            response = await apiClient.put(`/periodos-academicos/${form.value.id}`, payload)
            if (response.success) {
                 toast.success('Período actualizado')
                 await loadPeriodos()
                 closeModal()
            }
          } else {
            response = await apiClient.post('/periodos-academicos', payload)
            if (response.success) {
                 toast.success('Período creado')
                 await loadPeriodos()
                 closeModal()
            }
          }
      } catch (error) {
         toast.error('Error al guardar período')
      }
    }

    const calculateDuration = (startDate, endDate) => {
      if (!startDate || !endDate) return 0
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const closeModal = () => {
      showCreateModal.value = false
      showEditModal.value = false
      form.value = {
        id: null,
        nombre: '',
        anio: '',
        tipo: '',
        fechaInicio: '',
        fechaFin: '',
        estado: '',
        descripcion: '',
        observaciones: '',
      }
    }

    const closeViewModal = () => {
      showViewModal.value = false
      selectedPeriodo.value = null
    }

    const formatDate = dateString => {
      return new Date(dateString).toLocaleDateString('es-ES')
    }

    // Control de acceso por rol al cargar
    onMounted(() => {
    /*
      if (!isAdmin.value) {
        toast.error('Acceso denegado')
        return
      }
    */
      loadPeriodos()
    })

    return {
      isAdmin,
      periodos,
      filters,
      filteredPeriodos,
      paginatedPeriodos,
      currentPage,
      itemsPerPage,
      totalPages,
      visiblePages,
      showCreateModal,
      showEditModal,
      showViewModal,
      selectedPeriodo,
      form,
      getTipoClass,
      getEstadoClass,
      clearFilters,
      previousPage,
      nextPage,
      goToPage,
      viewPeriodo,
      editPeriodo,
      togglePeriodoStatus,
      deletePeriodo,
      savePeriodo,
      closeModal,
      closeViewModal,
      formatDate,
    }
  },
}
