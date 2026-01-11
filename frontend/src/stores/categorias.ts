import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

interface Categoria {
  id_categoria: number
  nombre_categoria: string
  descripcion?: string
  activo: boolean
  created_at?: string
  updated_at?: string
}

interface CategoriaFilters {
  search: string
  activo: boolean | null
}

interface CategoriasPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface CategoriaForSelect {
  value: number
  label: string
  descripcion?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export const useCategoriasStore = defineStore('categorias', () => {
  const categorias = ref<Categoria[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentCategoria = ref<Categoria | null>(null)
  
  const filters = ref<CategoriaFilters>({
    search: '',
    activo: null,
  })
  
  const pagination = ref<CategoriasPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  // Getters
  const categoriasFiltradas = computed(() => {
    let filtered = [...categorias.value]

    if (filters.value.search) {
      const term = filters.value.search.toLowerCase()
      filtered = filtered.filter(
        categoria =>
          categoria.nombre_categoria?.toLowerCase().includes(term) ||
          categoria.descripcion?.toLowerCase().includes(term)
      )
    }

    if (filters.value.activo !== null) {
      filtered = filtered.filter(categoria => categoria.activo === filters.value.activo)
    }

    return filtered
  })

  const categoriasActivas = computed(() => {
    return categorias.value.filter(categoria => categoria.activo)
  })

  const totalCategorias = computed(() => categorias.value.length)

  const categoriasParaSelect = computed((): CategoriaForSelect[] => {
    return categorias.value
      .filter(categoria => categoria.activo)
      .map(categoria => ({
        value: categoria.id_categoria,
        label: categoria.nombre_categoria,
        descripcion: categoria.descripcion,
      }))
  })

  // Actions
  const fetchCategorias = async ({ page = 1, limit = 10, ...filterParams } = {}) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filterParams).filter(([_key, value]) => value !== '' && value !== null)
        ),
      })

      const response = await axios.get(`${API_BASE_URL}/categorias?${params}`)

      if (response.data.success) {
        categorias.value = response.data.data
        pagination.value = {
          page: response.data.meta.page,
          limit: response.data.meta.limit,
          total: response.data.meta.total,
          totalPages: response.data.meta.totalPages,
        }
      } else {
        throw new Error(response.data.message || 'Error al cargar categorías')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al cargar categorías'
      categorias.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchCategoriaById = async (id: number): Promise<Categoria> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_BASE_URL}/categorias/${id}`)

      if (response.data.success) {
        currentCategoria.value = response.data.data
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error al cargar categoría')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al cargar categoría'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCategoria = async (categoriaData: Partial<Categoria>): Promise<Categoria> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.post(`${API_BASE_URL}/categorias`, categoriaData)

      if (response.data.success) {
        categorias.value.unshift(response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error al crear categoría')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al crear categoría'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCategoria = async (id: number, updates: Partial<Categoria>): Promise<Categoria> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.put(`${API_BASE_URL}/categorias/${id}`, updates)

      if (response.data.success) {
        const index = categorias.value.findIndex(categoria => categoria.id_categoria === id)
        if (index !== -1) {
          categorias.value[index] = { ...categorias.value[index], ...response.data.data }
        }

        if (currentCategoria.value?.id_categoria === id) {
          currentCategoria.value = { ...currentCategoria.value, ...response.data.data }
        }

        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error al actualizar categoría')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al actualizar categoría'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCategoria = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.delete(`${API_BASE_URL}/categorias/${id}`)

      if (response.data.success) {
        categorias.value = categorias.value.filter(categoria => categoria.id_categoria !== id)

        if (currentCategoria.value?.id_categoria === id) {
          currentCategoria.value = null
        }

        return true
      } else {
        throw new Error(response.data.message || 'Error al eliminar categoría')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al eliminar categoría'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleActivoCategoria = async (id: number) => {
    const categoria = categorias.value.find(c => c.id_categoria === id)
    if (!categoria) return

    return updateCategoria(id, { activo: !categoria.activo })
  }

  const fetchBienesByCategoria = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_BASE_URL}/categorias/${id}/bienes`)

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error al cargar bienes de la categoría')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al cargar bienes de la categoría'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Filtros
  const setFilters = (newFilters: Partial<CategoriaFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      activo: null,
    }
  }

  // Paginación
  const setPagination = ({ page, limit }: { page?: number; limit?: number }) => {
    if (page) pagination.value.page = page
    if (limit) pagination.value.limit = limit
  }

  // Estado
  const clearError = () => {
    error.value = null
  }

  const clearCurrentCategoria = () => {
    currentCategoria.value = null
  }

  // Validaciones
  const validateCategoriaData = (data: Partial<Categoria>): ValidationResult => {
    const errors: string[] = []

    if (!data.nombre_categoria?.trim()) {
      errors.push('El nombre de la categoría es requerido')
    }

    if (data.nombre_categoria && data.nombre_categoria.length > 100) {
      errors.push('El nombre de la categoría no puede exceder 100 caracteres')
    }

    if (data.descripcion && data.descripcion.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Operaciones en lote
  const toggleMultipleCategorias = async (ids: number[], activo: boolean) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.put(`${API_BASE_URL}/categorias/batch/toggle`, {
        ids,
        activo,
      })

      if (response.data.success) {
        ids.forEach(id => {
          const index = categorias.value.findIndex(categoria => categoria.id_categoria === id)
          if (index !== -1) {
            categorias.value[index].activo = activo
          }
        })

        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error al actualizar categorías')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al actualizar categorías'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMultipleCategorias = async (ids: number[]) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.delete(`${API_BASE_URL}/categorias/batch`, {
        data: { ids },
      })

      if (response.data.success) {
        categorias.value = categorias.value.filter(
          categoria => !ids.includes(categoria.id_categoria)
        )

        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error al eliminar categorías')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Error al eliminar categorías'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utilidades
  const checkCategoriaEnUso = async (id: number): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categorias/${id}/en-uso`)

      if (response.data.success) {
        return response.data.data
      }
      return false
    } catch (_error) {
      return false
    }
  }

  return {
    // State
    categorias,
    loading,
    error,
    currentCategoria,
    filters,
    pagination,

    // Getters
    categoriasFiltradas,
    categoriasActivas,
    totalCategorias,
    categoriasParaSelect,

    // Actions
    fetchCategorias,
    fetchCategoriaById,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleActivoCategoria,
    fetchBienesByCategoria,
    setFilters,
    clearFilters,
    setPagination,
    clearError,
    clearCurrentCategoria,
    validateCategoriaData,
    toggleMultipleCategorias,
    deleteMultipleCategorias,
    checkCategoriaEnUso,
  }
})