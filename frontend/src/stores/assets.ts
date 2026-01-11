import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Asset, AssetFilters, PaginatedResponse, ApiResponse } from '@/types'
import { assetsApi } from '@/api/assets'

export const useAssetsStore = defineStore('assets', () => {
  const assets = ref<Asset[]>([])
  const currentAsset = ref<Asset | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })

  const totalAssets = computed(() => pagination.value.total)
  const hasAssets = computed(() => assets.value.length > 0)
  const activeAssets = computed(() => assets.value.filter((asset: Asset) => asset.estado === 'activo'))
  const inactiveAssets = computed(() => assets.value.filter((asset: Asset) => asset.estado === 'inactivo'))
  const maintenanceAssets = computed(() =>
    assets.value.filter((asset: Asset) => asset.estado === 'mantenimiento')
  )

  const loadAssets = async (filters: AssetFilters = {}, page = 1, limit = 10) => {
    loading.value = true
    error.value = null

    try {
      const params = {
        page,
        limit,
        ...filters,
      }

      const response: ApiResponse<PaginatedResponse<Asset>> = await assetsApi.getAll(params)

      if (response.success) {
        assets.value = response.data.data
        pagination.value = response.data.meta
      }
    } catch (err: any) {
      error.value = err.message || 'Error al cargar bienes'
    } finally {
      loading.value = false
    }
  }

  const loadAsset = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<Asset> = await assetsApi.getById(id)

      if (response.success) {
        currentAsset.value = response.data
      }
    } catch (err: any) {
      error.value = err.message || 'Error al cargar bien'
    } finally {
      loading.value = false
    }
  }

  const createAsset = async (assetData: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<Asset> = await assetsApi.create(assetData)

      if (response.success) {
        assets.value.push(response.data)
        pagination.value.total++
        return response.data
      }
    } catch (err: any) {
      error.value = err.message || 'Error al crear bien'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAsset = async (id: number, assetData: Partial<Asset>) => {
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<Asset> = await assetsApi.update(id, assetData)

      if (response.success) {
        const index = assets.value.findIndex((asset: Asset) => asset.id === id)
        if (index > -1) {
          assets.value[index] = response.data
        }
        if (currentAsset.value?.id === id) {
          currentAsset.value = response.data
        }
        return response.data
      }
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar bien'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAsset = async (id: number) => {
    loading.value = true
    error.value = null

    try {
      const response: ApiResponse<void> = await assetsApi.delete(id)

      if (response.success) {
        const index = assets.value.findIndex((asset: Asset) => asset.id === id)
        if (index > -1) {
          assets.value.splice(index, 1)
          pagination.value.total--
        }
        if (currentAsset.value?.id === id) {
          currentAsset.value = null
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar bien'
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchAssets = async (query: string, page = 1, limit = 10) => {
    return await loadAssets({ search: query }, page, limit)
  }

  const getAssetsByCategory = async (categoryId: number, page = 1, limit = 10) => {
    return await loadAssets({ categoria_id: categoryId }, page, limit)
  }

  const getAssetsByLocation = async (locationId: number, page = 1, limit = 10) => {
    return await loadAssets({ ubicacion_id: locationId }, page, limit)
  }

  const getAssetsByResponsible = async (responsibleId: number, page = 1, limit = 10) => {
    return await loadAssets({ responsable_id: responsibleId }, page, limit)
  }

  const getAssetsByState = async (state: string, page = 1, limit = 10) => {
    return await loadAssets({ estado: state }, page, limit)
  }

  const generateQRCode = async (assetId: number) => {
    try {
      const response = await assetsApi.generateQR(assetId)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al generar código QR'
      throw err
    }
  }

  const exportAssets = async (format: 'pdf' | 'excel', filters: AssetFilters = {}) => {
    try {
      const response = await assetsApi.export(format, filters)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Error al exportar bienes'
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentAsset = () => {
    currentAsset.value = null
  }

  return {
    // State
    assets,
    currentAsset,
    loading,
    error,
    pagination,

    // Getters
    totalAssets,
    hasAssets,
    activeAssets,
    inactiveAssets,
    maintenanceAssets,

    // Actions
    loadAssets,
    loadAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    searchAssets,
    getAssetsByCategory,
    getAssetsByLocation,
    getAssetsByResponsible,
    getAssetsByState,
    generateQRCode,
    exportAssets,
    clearError,
    clearCurrentAsset,
  }
})
