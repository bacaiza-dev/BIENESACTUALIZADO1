
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
      tipo: '',
    })

    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showViewModal = ref(false)
    const showDeleteConfirm = ref(false)
    const showInactiveModal = ref(false)
    const inactiveSearch = ref('')
    const inactivePeriodos = ref([])
    const inactiveCount = ref(0)
    const selectedPeriodo = ref(null)
    const deleteErrorMessage = ref('')
    const periodoToDelete = ref(null)
    const permanentDeleteMode = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const showBienesModal = ref(false)
    const selectedBienesPeriodo = ref(null)
    const bienesList = ref([])

    const loadInactiveCount = async () => {
      try {
        const res = await apiClient.get('/periodos-academicos?inactive=1')
        if (res.success) {
          inactiveCount.value = (res.data || []).length
        }
      } catch (err) {
        inactiveCount.value = 0
      }
    }

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
    const suggestedDates = ref(false)

    // Filtros y búsqueda
    const filteredPeriodos = computed(() => {
      // Por seguridad, trabajar solo con periodos activos
      let result = periodos.value.filter(p => p.activo !== false && p.estado !== 'inactivo')
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(
          p => (p.nombre || '').toString().toLowerCase().includes(search) || (p.anio || '').toString().includes(search)
        )
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
               // Obtener fechas - pueden venir como fecha_inicio o fechaInicio
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
                 id: p.id,
                 nombre: p.nombre,
                 anio: p.anio ?? '',
                 tipo: p.tipo ?? '',
                 estado: computedEstado,
                 fechaInicio: fechaInicio ? new Date(fechaInicio).toISOString().split('T')[0] : '',
                 fechaFin: fechaFin ? new Date(fechaFin).toISOString().split('T')[0] : '',
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

    const updatePeriodoType = () => {
      // Solo cambiar el tipo, no las fechas automáticamente
      // El usuario verá el botón de sugerencia de fechas
      suggestedDates.value = false
    }

    const autoSuggestDates = () => {
      // Ahora la lógica asume que el usuario decide la fecha de inicio y se calcula la fecha de fin
      if (!form.value.tipo || !form.value.fechaInicio) {
        toast.error('Por favor selecciona el tipo de período y la fecha de inicio')
        return
      }

      const start = new Date(form.value.fechaInicio)
      if (Number.isNaN(start.getTime())) {
        toast.error('Fecha de inicio inválida')
        return
      }

      const monthsToAddMap = {
        semestre: 6,
        trimestre: 3,
        cuatrimestre: 4,
        anual: 12,
      }

      const monthsToAdd = monthsToAddMap[form.value.tipo] || 0
      const end = new Date(start)
      end.setMonth(end.getMonth() + monthsToAdd)
      // Restar un día para que el período termine el día anterior al próximo periodo
      end.setDate(end.getDate() - 1)

      form.value.fechaFin = end.toISOString().split('T')[0]

      suggestedDates.value = true
      toast.success('Fecha de fin calculada automáticamente')
    }

    const togglePeriodoStatus = async (periodo) => {
      const newStatus = periodo.estado === 'activo' ? 'inactivo' : 'activo'
      try {
        const response = await apiClient.put(`/periodos-academicos/${periodo.id}`, {
            ...periodo,
            estado: newStatus,
            activo: newStatus === 'activo'
        })
        const data = response
        if (data.success) {
            toast.success('Estado actualizado correctamente')
            await loadPeriodos()
            await loadInactiveCount()
        }
      } catch (error) {
         toast.error('Error al cambiar estado')
      }
    }

    const deletePeriodo = (id) => {
      periodoToDelete.value = id
      deleteErrorMessage.value = ''
      showDeleteConfirm.value = true
    }

    const filteredInactivePeriodos = computed(() => {
      const list = inactivePeriodos.value || []
      if (!inactiveSearch.value) return list
      const s = inactiveSearch.value.trim().toLowerCase()
      return list.filter(p => {
        const nombre = (p.nombre || '').toString().toLowerCase()
        const anio = (p.anio || '').toString().toLowerCase()
        return nombre.includes(s) || anio.includes(s)
      })
    })

    const openInactiveModal = async () => {
      inactiveSearch.value = ''
      showInactiveModal.value = true
      try {
        const res = await apiClient.get('/periodos-academicos?inactive=1')
        if (res.success) {
          inactivePeriodos.value = res.data || []
        }
      } catch (err) {
        inactivePeriodos.value = []
        toast.error('Error al cargar períodos inactivos')
      }
    }

    const openPermanentDeleteConfirm = (id) => {
      periodoToDelete.value = id
      deleteErrorMessage.value = ''
      permanentDeleteMode.value = true
      showDeleteConfirm.value = true
    }

    const reactivatePeriodo = async (id) => {
      try {
        const response = await apiClient.post(`/periodos-academicos/${id}/reactivate`)
        if (response.success) {
          await loadPeriodos()
          await loadInactiveCount()
          // si el modal está abierto, recargar su lista
          if (showInactiveModal.value) {
            const res = await apiClient.get('/periodos-academicos?inactive=1')
            if (res.success) inactivePeriodos.value = res.data || []
          }
          toast.success('Período reactivado correctamente')
        } else {
          toast.error(response.message || 'Error al reactivar periodo')
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Error al reactivar periodo'
        toast.error(errorMsg)
      }
    }

    const confirmDelete = async () => {
      if (!periodoToDelete.value) return
      
      try {
        if (permanentDeleteMode.value) {
          const response = await apiClient.delete(`/periodos-academicos/${periodoToDelete.value}?permanent=1`)
          if (response.success) {
            // recargar lista principal y contador de inactivos
            await loadPeriodos()
            await loadInactiveCount()
            toast.success(permanentDeleteMode.value ? 'Período eliminado definitivamente' : 'Período desactivado correctamente')
            closeDeleteConfirm()
          } else {
            toast.error(response.message || 'Error al eliminar el período')
            closeDeleteConfirm()
          }
        } else {
          // soft delete -> desactivar
          const response = await apiClient.delete(`/periodos-academicos/${periodoToDelete.value}`)
          if (response.success) {
            const idx = periodos.value.findIndex(p => p.id === periodoToDelete.value)
            if (idx !== -1) {
              periodos.value[idx].activo = false
              periodos.value[idx].estado = 'inactivo'
            }
            toast.success('Período desactivado correctamente')
            closeDeleteConfirm()
          } else {
            toast.error(response.message || 'Error al desactivar el período')
            closeDeleteConfirm()
          }
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Error al eliminar el período'
        toast.error(errorMsg)
        closeDeleteConfirm()
      }
    }

    const closeDeleteConfirm = () => {
      showDeleteConfirm.value = false
      deleteErrorMessage.value = ''
      periodoToDelete.value = null
      permanentDeleteMode.value = false
    }

    const savePeriodo = async () => {
      try {
          // Validación cliente: nombre único (case-insensitive)
          const nombreTrim = (form.value.nombre || '').toString().trim().toLowerCase()
          if (!nombreTrim) {
            toast.error('El nombre es obligatorio')
            return
          }

          const duplicate = periodos.value.some(p => {
            const pNombre = (p.nombre || '').toString().trim().toLowerCase()
            if (showEditModal.value) {
              return pNombre === nombreTrim && p.id !== form.value.id
            }
            return pNombre === nombreTrim
          })

          if (duplicate) {
            toast.error('ya existe ese nombre')
            return
          }

          let response;
          const payload = {
              nombre: form.value.nombre,
              tipo: form.value.tipo,
              anio: form.value.anio,
              fecha_inicio: form.value.fechaInicio || null,
              fecha_fin: form.value.fechaFin || null,
              descripcion: form.value.descripcion,
              estado: form.value.estado,
              activo: form.value.estado === 'activo'
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
         const errorMsg = error.response?.data?.message || 'Error al guardar período'
         toast.error(errorMsg)
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
      suggestedDates.value = false
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

    const viewBienesPeriodo = async (periodo) => {
      selectedBienesPeriodo.value = periodo
      bienesList.value = []
      showBienesModal.value = true
      
      try {
        // Usar el ID del período para filtrar bienes
        const periodoId = periodo.id_periodo || periodo.id
        console.log('Filtrando bienes por periodo_id:', periodoId)
        
        const response = await apiClient.get(`/bienes?periodo_id=${periodoId}`)
        if (response.success) {
          bienesList.value = response.data || []
          console.log('Bienes encontrados:', bienesList.value.length)
        }
      } catch (error) {
        console.error('Error cargando bienes:', error)
        toast.error('Error al cargar bienes del período')
      }
    }

    const closeBienesModal = () => {
      showBienesModal.value = false
      selectedBienesPeriodo.value = null
      bienesList.value = []
    }

    const getEstadoBienClass = (estado) => {
      const map = {
        'ACTIVO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'INACTIVO': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'BAJA': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        'MANTENIMIENTO': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      }
      return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }

    const formatDate = dateString => {
      if (!dateString) return 'Sin especificar'
      const date = new Date(dateString)
      if (Number.isNaN(date.getTime())) return 'Fecha inválida'
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
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
      loadInactiveCount()
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
      showDeleteConfirm,
      selectedPeriodo,
      deleteErrorMessage,
      periodoToDelete,
      form,
      suggestedDates,
      showBienesModal,
      selectedBienesPeriodo,
      bienesList,
      getTipoClass,
      getEstadoClass,
      getEstadoBienClass,
      // Inactivos
      showInactiveModal,
      inactiveSearch,
      inactivePeriodos,
      filteredInactivePeriodos,
      openInactiveModal,
      reactivatePeriodo,
      openPermanentDeleteConfirm,
      inactiveCount,
      loadInactiveCount,
      // Acciones y utilidades
      clearFilters,
      previousPage,
      nextPage,
      goToPage,
      viewPeriodo,
      editPeriodo,
      viewBienesPeriodo,
      togglePeriodoStatus,
      deletePeriodo,
      confirmDelete,
      closeDeleteConfirm,
      updatePeriodoType,
      autoSuggestDates,
      savePeriodo,
      closeModal,
      closeViewModal,
      closeBienesModal,
      formatDate,
    }
  },
}
