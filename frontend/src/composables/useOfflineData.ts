import { ref, computed } from 'vue'
import { Network } from '@capacitor/network'
import { Preferences } from '@capacitor/preferences'
import apiClient from '@/api/client'

interface OfflineData {
  bienes: any[]
  usuarios: any[]
  categorias: any[]
  ubicaciones: any[]
  lastSync: string
}

export function useOfflineData() {
  const isOnline = ref(true)
  const lastSync = ref<string>('')
  const offlineData = ref<OfflineData>({
    bienes: [],
    usuarios: [],
    categorias: [],
    ubicaciones: [],
    lastSync: ''
  })

  // Monitorear estado de la red
  const initNetworkListener = async () => {
    const status = await Network.getStatus()
    isOnline.value = status.connected

    Network.addListener('networkStatusChange', (status) => {
      isOnline.value = status.connected
      if (status.connected) {
        syncOfflineData()
      }
    })
  }

  // Guardar datos en almacenamiento local
  const saveOfflineData = async (key: string, data: any) => {
    try {
      await Preferences.set({
        key: `offline_${key}`,
        value: JSON.stringify(data)
      })
      if (import.meta.env.DEV) console.log(`Datos guardados offline: ${key}`)
    } catch (error) {
      console.error(`❌ Error guardando datos offline ${key}:`, error)
    }
  }

  // Obtener datos del almacenamiento local
  const getOfflineData = async (key: string): Promise<any> => {
    try {
      const result = await Preferences.get({ key: `offline_${key}` })
      return result.value ? JSON.parse(result.value) : null
    } catch (error) {
      console.error(`❌ Error obteniendo datos offline ${key}:`, error)
      return null
    }
  }

  // Sincronizar datos cuando hay conexión
  const syncOfflineData = async () => {
    if (!isOnline.value) return

    try {
      if (import.meta.env.DEV) console.log('Sincronizando datos offline...')
      
      // Cargar datos guardados
      const storedData = await getOfflineData('main')
      if (storedData) {
        offlineData.value = storedData
        lastSync.value = storedData.lastSync
      }

      // Actualizar timestamp de sincronización
      offlineData.value.lastSync = new Date().toISOString()
      lastSync.value = offlineData.value.lastSync

      // Guardar datos actualizados
      await saveOfflineData('main', offlineData.value)
      
      if (import.meta.env.DEV) console.log('Sincronización completada')
    } catch (error) {
      console.error('❌ Error en sincronización:', error)
    }
  }

  // Obtener datos (online o offline)
  const getData = async (endpoint: string): Promise<any> => {
    const key = endpoint.split('/').pop() || 'data'

    if (isOnline.value) {
      try {
        // Intentar obtener datos online con apiClient
        const response = await apiClient.get<any>(endpoint)
        
        if (response.success) {
            const data = response.data
            // Guardar en cache offline
            await saveOfflineData(key, data)
            return data
        } else {
             console.warn('❌ Error API, usando offline:', response.message)
             return await getOfflineData(key)
        }

      } catch (error) {
        console.warn('❌ Error obteniendo datos online, usando offline:', error)
        return await getOfflineData(key)
      }
    } else {
      // Usar datos offline
      return await getOfflineData(key)
    }
  }

  // Limpiar datos offline
  const clearOfflineData = async () => {
    try {
      await Preferences.remove({ key: 'offline_main' })
      await Preferences.remove({ key: 'offline_bienes' })
      await Preferences.remove({ key: 'offline_usuarios' })
      await Preferences.remove({ key: 'offline_categorias' })
      await Preferences.remove({ key: 'offline_ubicaciones' })
      
      offlineData.value = {
        bienes: [],
        usuarios: [],
        categorias: [],
        ubicaciones: [],
        lastSync: ''
      }
      
      if (import.meta.env.DEV) console.log('Datos offline limpiados')
    } catch (error) {
      console.error('❌ Error limpiando datos offline:', error)
    }
  }

  // Computed para verificar si hay datos offline
  const hasOfflineData = computed(() => {
    return offlineData.value.bienes.length > 0 || 
           offlineData.value.usuarios.length > 0 || 
           offlineData.value.categorias.length > 0 || 
           offlineData.value.ubicaciones.length > 0
  })

  // Computed para tiempo desde última sincronización
  const timeSinceSync = computed(() => {
    if (!lastSync.value) return 'Nunca'
    
    const now = new Date()
    const syncTime = new Date(lastSync.value)
    const diff = now.getTime() - syncTime.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} día${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''}`
    return 'Ahora'
  })

  return {
    isOnline,
    lastSync,
    offlineData,
    hasOfflineData,
    timeSinceSync,
    initNetworkListener,
    saveOfflineData,
    getOfflineData,
    syncOfflineData,
    getData,
    clearOfflineData
  }
}
