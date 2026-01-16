
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AulasAsignadasList',
  setup() {
    const toast = useToast()
    const authStore = useAuthStore()

    const isAdmin = computed(() => authStore.isAdmin)

    const loading = ref(false)
    const saving = ref(false)

    const asignaciones = ref([])
    const periodos = ref([])
    const usuarios = ref([])
    const aulas = ref([])

    const filters = reactive({
      periodo_id: '',
      usuario_id: '',
      search: '',
    })

    const showModal = ref(false)
    const isEditing = ref(false)
    const form = reactive({
      id: null,
      ubicacion_id: '',
      usuario_id: '',
      periodo_id: '',
      observaciones: '',
    })

    const filteredAsignaciones = computed(() => {
      const term = filters.search.trim().toLowerCase()
      if (!term) return asignaciones.value

      return asignaciones.value.filter((row) => {
        const aula = row.ubicacion?.nombre || ''
        const edificio = row.ubicacion?.edificio || ''
        const aulaNumero = row.ubicacion?.aula || ''
        const custodio = `${row.custodio?.nombre || ''} ${row.custodio?.apellido || ''}`.trim()
        const periodo = row.periodo?.nombre || ''

        return [aula, edificio, aulaNumero, custodio, periodo]
          .join(' ')
          .toLowerCase()
          .includes(term)
      })
    })

    const loadPeriodos = async () => {
      const response = await apiClient.get('/periodos-academicos')
      if (response.success) {
        periodos.value = response.data || []
      }
    }

    const loadUsuarios = async () => {
      if (!isAdmin.value) return
      const response = await apiClient.get('/usuarios')
      if (response.success) {
        usuarios.value = response.data || []
      }
    }

    const loadAulas = async () => {
      if (!isAdmin.value) return
      const response = await apiClient.get('/ubicaciones')
      if (response.success) {
        const all = response.data || []
        aulas.value = all.filter((u) => String(u.tipo || '').toLowerCase() === 'aula')
      }
    }

    const loadAsignaciones = async () => {
      loading.value = true
      try {
        const params = {}
        if (filters.periodo_id) params.periodo_id = filters.periodo_id
        if (filters.periodo_id) params.periodo_id = filters.periodo_id
        
        if (isAdmin.value) {
          if (filters.usuario_id) params.usuario_id = filters.usuario_id
        } else {
          // Si no es admin, forzar filtro por su propio usuario
          params.usuario_id = authStore.user?.id
        }

        const response = await apiClient.get('/aulas-asignadas', { params })
        if (response.success) {
          asignaciones.value = response.data || []
        } else {
          asignaciones.value = []
        }
      } catch (error) {
        asignaciones.value = []
        toast.error('Error cargando aulas asignadas')
      } finally {
        loading.value = false
      }
    }

    const clearFilters = async () => {
      filters.periodo_id = ''
      filters.usuario_id = ''
      filters.search = ''
      await loadAsignaciones()
    }

    const openCreateModal = async () => {
      if (!isAdmin.value) return

      isEditing.value = false
      form.id = null
      form.ubicacion_id = ''
      form.usuario_id = ''
      form.periodo_id = filters.periodo_id || ''
      form.observaciones = ''
      showModal.value = true

      await Promise.all([loadUsuarios(), loadAulas(), loadPeriodos()])
    }

    const openEditModal = async (row) => {
      if (!isAdmin.value) return

      isEditing.value = true
      form.id = row.id
      form.ubicacion_id = String(row.ubicacion_id || row.ubicacion?.id || '')
      form.usuario_id = String(row.usuario_id || row.custodio?.id || '')
      form.periodo_id = String(row.periodo_id || row.periodo?.id || '')
      form.observaciones = row.observaciones || ''
      showModal.value = true

      await Promise.all([loadUsuarios(), loadAulas(), loadPeriodos()])
    }

    const closeModal = () => {
      showModal.value = false
    }

    const saveAsignacion = async () => {
      if (!isAdmin.value) return

      if (!form.ubicacion_id || !form.usuario_id || !form.periodo_id) {
        toast.error('Completa aula, custodio y periodo')
        return
      }

      saving.value = true
      try {
        const payload = {
          ubicacion_id: Number(form.ubicacion_id),
          usuario_id: Number(form.usuario_id),
          periodo_id: Number(form.periodo_id),
          observaciones: form.observaciones || null,
        }

        const response = isEditing.value
          ? await apiClient.put(`/aulas-asignadas/${form.id}`, payload)
          : await apiClient.post('/aulas-asignadas', payload)

        if (!response.success) {
          throw new Error(response.message || 'Error guardando asignación')
        }

        toast.success(isEditing.value ? 'Asignación actualizada' : 'Asignación creada')
        closeModal()
        await loadAsignaciones()
      } catch (error) {
        toast.error(error?.message || 'Error guardando asignación')
      } finally {
        saving.value = false
      }
    }

    const deleteAsignacion = async (row) => {
      if (!isAdmin.value) return

      if (!confirm('¿Eliminar esta asignación?')) return

      try {
        const response = await apiClient.delete(`/aulas-asignadas/${row.id}`)
        if (!response.success) {
          throw new Error(response.message || 'Error eliminando asignación')
        }
        toast.success('Asignación eliminada')
        await loadAsignaciones()
      } catch (error) {
        toast.error(error?.message || 'Error eliminando asignación')
      }
    }

    const downloadBlob = (blob, filename) => {
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }

    const exportar = async (format) => {
      try {
        loading.value = true
        const params = {}
        if (filters.periodo_id) params.periodo_id = filters.periodo_id
        if (isAdmin.value && filters.usuario_id) params.usuario_id = filters.usuario_id

        const blob = await apiClient.get(`/aulas-asignadas/export?format=${format}`, {
          params,
          responseType: 'blob',
        })

        const ext = format === 'pdf' ? 'pdf' : 'xlsx'
        downloadBlob(blob, `aulas_asignadas_${Date.now()}.${ext}`)
      } catch (error) {
        toast.error('Error exportando')
      } finally {
        loading.value = false
      }
    }

    watch(
      () => [filters.periodo_id, filters.usuario_id],
      async () => {
        await loadAsignaciones()
      }
    )

    onMounted(async () => {
      await Promise.all([loadPeriodos(), loadUsuarios(), loadAsignaciones()])
    })

    return {
      isAdmin,
      loading,
      saving,
      asignaciones,
      periodos,
      usuarios,
      aulas,
      filters,
      filteredAsignaciones,
      showModal,
      isEditing,
      form,
      clearFilters,
      openCreateModal,
      openEditModal,
      closeModal,
      saveAsignacion,
      deleteAsignacion,
      exportar,
    }
  },
}

