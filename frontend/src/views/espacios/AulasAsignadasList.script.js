
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import VueMultiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.css'

export default {
  name: 'AulasAsignadasList',
  components: { VueMultiselect },
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
      activo: 'true' // Default to active, but user can change to 'todos' or 'false'
    })

    // ... (rest of setup)

    const toggleStatus = async (row) => {
      if (!isAdmin.value) return
      
      const newStatus = !row.activo
      try {
         // Optimistic update
         row.activo = newStatus
         
         const payload = {
            ubicacion_id: row.ubicacion_id,
            usuario_id: row.usuario_id,
            periodo_id: row.periodo_id,
            observaciones: row.observaciones,
            activo: newStatus
         }
         
         const response = await apiClient.put(`/aulas-asignadas/${row.id}`, payload)
         if (response.success) {
            toast.success(`Asignación ${newStatus ? 'activada' : 'desactivada'}`)
            // If filter is strict ('true' or 'false'), the item should disappear/move
            // But we reload to be safe or just leave it if displaying 'todos'
            if (filters.activo !== 'todos') {
               await loadAsignaciones() 
            }
         } else {
            throw new Error(response.message)
         }
      } catch (error) {
         row.activo = !newStatus // Revert
         toast.error('Error cambiando estado')
         await loadAsignaciones()
      }
    }

    const loadAsignaciones = async () => {
      loading.value = true
      try {
        const params = {}
        if (filters.periodo_id) params.periodo_id = filters.periodo_id
        if (filters.activo) params.activo = filters.activo // Pass active filter
        
        if (isAdmin.value) {
          if (filters.usuario_id) params.usuario_id = filters.usuario_id
        } else {
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
      filters.activo = 'true'
      await loadAsignaciones()
    }

    // ...

    watch(
      () => [filters.periodo_id, filters.usuario_id, filters.activo],
      async () => {
        currentPage.value = 1 // Reset pagination
        await loadAsignaciones()
      }
    )

    // Reset pagination on search
    watch(
      () => filters.search,
      () => {
        currentPage.value = 1
      }
    )


    // ... logic continues ...


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

    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    const totalPages = computed(() => Math.ceil(filteredAsignaciones.value.length / itemsPerPage.value))

    const paginatedAsignaciones = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredAsignaciones.value.slice(start, end)
    })

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++
    }

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--
    }

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

    // Asset Assignment Logic
    const showAssignAssetModal = ref(false)
    const assigningAsset = ref(false)
    const assetSearch = ref('')
    const allBienes = ref([])
    const selectedUbicacionForAssignment = ref(null)
    const currentAssignmentCustodioId = ref(null)
    const activeAssignTab = ref('search') // 'search' | 'create'
    const categorias = ref([])
    const estadosOpciones = ref([]) // For creatable select

    const batchForm = reactive({
      cantidad: 1,
      nombre: '',
      // Institutional Code
      codigo_prefix: '',
      codigo_start: 1,
      // Senescyt Code
      codigo_senescyt_prefix: '',
      codigo_senescyt_start: 1,
      
      categoria_id: '',
      marca: '',
      modelo: '',
      color: '',
      material: '',
      clase_de_bien: '', // Manual input
      descripcion: '',
      observaciones: '',
      periodo_id: '',
      fecha_adquisicion: new Date().toISOString().split('T')[0], // Default to today
      estado: 'ACTIVO',
      
      // UI Control
      auto_generate_codes: true, // Default on, user can toggle off to edit prefixes
      generate_senescyt: false   // Default off
    })
    
    const loadEstados = async () => {
       try {
         const res = await apiClient.get('/bienes/estados/list')
         if (res.success) {
            estadosOpciones.value = res.data
         }
       } catch (e) {
         console.error("Error loading states", e)
         // Fallback
         estadosOpciones.value = ['ACTIVO', 'INACTIVO', 'DAÑADO', 'EN MANTENIMIENTO', 'BAJA']
       }
    }
    
    // Add new tag handler for Multiselect
    const addEstadoTag = (newTag) => {
      const tag = newTag.toUpperCase() 
      estadosOpciones.value.push(tag)
      batchForm.estado = tag
    }

    const availableBienes = computed(() => {
      // Filter out assets that are already assigned to a location OR a user
      // Assuming 'unassigned' means ubicacion_id is null AND responsable_id is null
      return allBienes.value.filter((b) => {
        // If searching, we might want to be less strict? No, user said only use unassigned.
        const isUnassigned = !b.ubicacion_id && !b.responsable_id
        if (!isUnassigned) return false

        if (assetSearch.value) {
          const q = assetSearch.value.toLowerCase()
          return (
            (b.nombre || '').toLowerCase().includes(q) ||
            (b.codigo_institucional || '').toLowerCase().includes(q) ||
            (b.marca || '').toLowerCase().includes(q)
          )
        }
        return true
      }).slice(0, 20)
    })

    const loadCategorias = async () => {
      if (categorias.value.length > 0) return
      const res = await apiClient.get('/categorias')
      if (res.success) {
        // Filter only active categories if needed, or map
        categorias.value = res.data || []
      }
    }

    const openAssignAssetModal = async (row) => {
      if (!row.ubicacion) return
      selectedUbicacionForAssignment.value = row.ubicacion
      currentAssignmentCustodioId.value = row.usuario_id // Store custodian ID
      activeAssignTab.value = 'search' // Reset tab
      
      // Reset batch form
      batchForm.cantidad = 1
      batchForm.nombre = ''
      
      // Defaults
      batchForm.auto_generate_codes = true
      batchForm.generate_senescyt = false
      batchForm.codigo_prefix = 'ASSET'
      batchForm.codigo_start = 1
      batchForm.codigo_senescyt_prefix = 'SENESCYT'
      batchForm.codigo_senescyt_start = 1
      
      batchForm.categoria_id = ''
      batchForm.marca = ''
      batchForm.modelo = ''
      batchForm.color = ''
      batchForm.material = ''
      batchForm.clase_de_bien = ''
      batchForm.descripcion = ''
      batchForm.observaciones = ''
      batchForm.periodo_id = row.periodo_id || '' // Default to current assignment period
      batchForm.fecha_adquisicion = new Date().toISOString().split('T')[0]
      batchForm.estado = 'ACTIVO'
      
      try {
        const [resBienes, resCats] = await Promise.all([
          apiClient.get('/bienes'),
          loadCategorias(),
          loadEstados()
        ])
        
        if (resBienes.success) {
          allBienes.value = resBienes.data
          allBienes.value = resBienes.data
          showAssignAssetModal.value = true
        }
      } catch (e) {
        toast.error('Error cargando datos')
      }
    }

    const showConfirmAssignModal = ref(false)
    const confirmAssignData = reactive({
      observaciones: '',
      file: null
    })
    const pendingAssignAsset = ref(null)

    const assignAsset = (bien) => {
      if (!selectedUbicacionForAssignment.value) return
      
      pendingAssignAsset.value = bien
      confirmAssignData.observaciones = ''
      confirmAssignData.file = null
      showConfirmAssignModal.value = true
    }

    const confirmAssignment = async () => {
      if (!pendingAssignAsset.value || !selectedUbicacionForAssignment.value) return

      assigningAsset.value = true
      try {
        const formData = new FormData()
        // Campos básicos
        formData.append('ubicacion_id', selectedUbicacionForAssignment.value.id)
        if (confirmAssignData.observaciones) {
           formData.append('observaciones', confirmAssignData.observaciones)
        }
        
        // Agregar archivo si existe
        if (confirmAssignData.file) {
           formData.append('file', confirmAssignData.file)
        }
        
        // Mantener otros campos del bien que no cambian (opcional, pero PUT requiere lo que se actualiza)
        // El endpoint PUT backend actualizado maneja los campos que le enviemos.
        
        // Llamada API
        // Nota: apiClient wrapper podría necesitar ayuda con headers multipart si no lo detecta autom.
        // Usamos axios debajo, suele detectar FormData.
        const res = await apiClient.put(`/bienes/${pendingAssignAsset.value.id}`, formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
        })

        if (res.success) {
          toast.success(`Bien asignado a ${selectedUbicacionForAssignment.value.nombre}`)
          // Update local list
          allBienes.value = allBienes.value.filter(b => b.id !== pendingAssignAsset.value.id)
          await loadAsignaciones()
          showConfirmAssignModal.value = false
        } else {
           throw new Error(res.message || 'Error al asignar')
        }
      } catch (e) {
        toast.error(e.message || 'Error asignando bien')
      } finally {
        assigningAsset.value = false
        pendingAssignAsset.value = null
      }
    }

    const createBatchAssets = async () => {
       if (!batchForm.cantidad || batchForm.cantidad < 1) return toast.error('Cantidad inválida')
       if (!batchForm.nombre || !batchForm.categoria_id) return toast.error('Nombre y Categoría son requeridos')
       
       // Validate codes if manually entered
       if (!batchForm.auto_generate_codes) {
          if (!batchForm.codigo_prefix) return toast.error('Prefijo Institucional requerido')
       }
       
       if (batchForm.generate_senescyt && !batchForm.codigo_senescyt_prefix) {
          return toast.error('Prefijo Senescyt requerido')
       }
       
       assigningAsset.value = true
       try {
         const payload = {
            ...batchForm,
            ubicacion_id: selectedUbicacionForAssignment.value.id,
            responsable_id: currentAssignmentCustodioId.value
         }
         
         const res = await apiClient.post('/bienes/batch-create', payload)
         
         if (res.success) {
           toast.success(res.message)
           showAssignAssetModal.value = false
           await loadAsignaciones()
         } else {
            throw new Error(res.message)
         }
       } catch (e) {
          toast.error(e.message || 'Error creando bienes')
       } finally {
          assigningAsset.value = false
       }
    }

    // View Details Logic
    const showViewModal = ref(false)
    const selectedAssignment = ref(null)
    const viewModalAssets = ref([])
    const loadingIds = ref(false)

    const openViewModal = async (row) => {
      selectedAssignment.value = row
      showViewModal.value = true
      viewModalAssets.value = []
      loadingIds.value = true
      
      try {
        // Fetch ALL assets and filter by this location
        // Optimally we would have an endpoint /ubicaciones/:id/bienes but filtering client side for now is consistent with other parts
        // Or re-use loadAsignaciones logic? No, we need list of assets.
        // Let's use /bienes endpoint filtering by ubicacion_id if supported or filter client side.
        // Actually, looking at 'openAssignAssetModal', it fetches ALL bienes.
        // We can do the same or filter if API supports it.
        // Assuming API supports ?ubicacion_id=X
        const res = await apiClient.get('/bienes') 
        if (res.success) {
           viewModalAssets.value = res.data.filter(b => b.ubicacion_id === row.ubicacion_id)
        }
      } catch (e) {
        toast.error('Error cargando bienes del aula')
      } finally {
        loadingIds.value = false
      }
    }

    const closeViewModal = () => {
      showViewModal.value = false
      selectedAssignment.value = null
    }

    const removeAssetFromRoom = async (bien) => {
       if (!confirm(`¿Quitar el bien ${bien.codigo_institucional} de esta ubicación?`)) return
       
       try {
          // Unlink location: set ubicacion_id = null
          // Keep responsible? Probably clear it too if it matches the room's custodian?
          // For safety, let's just clear location.
          const payload = {
             ...bien,
             ubicacion_id: null
             // Intentionally not clearing responsible_id unless requested, but usually unlinking from room implies unlinking from room's context.
             // Let's just clear location.
          }
          
          const res = await apiClient.put(`/bienes/${bien.id}`, payload)
          if (res.success) {
             toast.success('Bien quitado del aula')
             // Remove from local list
             viewModalAssets.value = viewModalAssets.value.filter(b => b.id !== bien.id)
             // Update main list count
             await loadAsignaciones()
          } else {
             throw new Error(res.message)
          }
       } catch (e) {
          toast.error(e.message || 'Error al quitar bien')
       }
    }

    const editAssetRedirect = (bien) => {
       // Since we don't have an asset edit modal here, redirect to /bienes with search
       // Assuming router is available (not injected yet? use useRouter?)
       // We only have route? No.
       // Let's log for now or try window.location
       // Ideally we should open a modal.
       // Let's try to emit or just use a simple prompt for now? No.
       // Redirecting to bienes list with filter:
       window.location.href = `/bienes?search=${bien.codigo_institucional}`
    }

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
      paginatedAsignaciones,
      currentPage,
      totalPages,
      nextPage,
      prevPage,
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
      // Asset Assignment
      showAssignAssetModal,
      assigningAsset,
      assetSearch,
      availableBienes,
      openAssignAssetModal,
      assignAsset,
      selectedUbicacionForAssignment,
      // Batch
      activeAssignTab,
      batchForm,
      categorias,
      estadosOpciones,
      addEstadoTag,
      createBatchAssets,
      // View Details
      showViewModal,
      selectedAssignment,
      viewModalAssets,
      loadingIds,
      openViewModal,
      closeViewModal,
      removeAssetFromRoom,
      editAssetRedirect,
      // Confirm Assignment Modal
      showConfirmAssignModal,
      confirmAssignData,
      confirmAssignment,
      pendingAssignAsset
    }
  }
}

