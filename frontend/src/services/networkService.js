import { Network } from '@capacitor/network'
import { Preferences } from '@capacitor/preferences'
import offlineStorage from './offlineStorage'
import apiClient from './api'

class NetworkService {
  constructor() {
    this.isOnline = true
    this.connectionType = 'unknown'
    this.listeners = []
    this.syncInterval = null
  }

  async init() {
    try {
      // Verificar estado inicial de la red
      const status = await Network.getStatus()
      this.isOnline = status.connected
      this.connectionType = status.connectionType

      // Escuchar cambios de conectividad
      Network.addListener('networkStatusChange', status => {
        this.isOnline = status.connected
        this.connectionType = status.connectionType
        this.notifyListeners()

        if (status.connected) {
          this.onConnectionRestored()
        } else {
          this.onConnectionLost()
        }
      })

      // Inicializar sincronización automática
      this.startAutoSync()

      return true
    } catch (error) {
      console.error('Error al inicializar servicio de red:', error)
      return false
    }
  }

  // Verificar conectividad
  async checkConnectivity() {
    try {
      const status = await Network.getStatus()
      this.isOnline = status.connected
      this.connectionType = status.connectionType
      return status.connected
    } catch (error) {
      console.error('Error al verificar conectividad:', error)
      return false
    }
  }

  // Verificar conectividad con el servidor
  async checkServerConnectivity() {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000,
      })
      return response.ok
    } catch (error) {
      console.error('Error al verificar conectividad del servidor:', error)
      return false
    }
  }

  // Obtener estado actual
  getStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: this.connectionType,
      timestamp: Date.now(),
    }
  }

  // Suscribirse a cambios de conectividad
  addListener(callback) {
    this.listeners.push(callback)
  }

  // Notificar a todos los listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.getStatus())
      } catch (error) {
        console.error('Error al ejecutar callback de estado de red:', error)
      }
    })
  }

  // Cuando se restaura la conexión
  async onConnectionRestored() {
    // Verificar si el servidor está disponible
    const serverAvailable = await this.checkServerConnectivity()

    if (serverAvailable) {
      // Sincronizar datos pendientes
      await this.syncPendingData()

      // Descargar datos actualizados
      await this.downloadLatestData()
    }
  }

  // Cuando se pierde la conexión
  onConnectionLost() {
    // Cambiar a modo offline
    this.enableOfflineMode()
  }

  // Habilitar modo offline
  enableOfflineMode() {
    // Aquí puedes implementar lógica específica para el modo offline
  }

  // Sincronizar datos pendientes
  async syncPendingData() {
    try {
      await offlineStorage.syncWithServer()
    } catch (error) {
      console.error('Error al sincronizar datos pendientes:', error)
    }
  }

  // Descargar datos más recientes
  async downloadLatestData() {
    try {
      // Descargar bienes
      const bienesResponse = await apiClient.get('/bienes?limit=1000')
      if (bienesResponse.data.success) {
        await offlineStorage.saveBienes(bienesResponse.data.data)
      }

      // Descargar usuarios
      const usuariosResponse = await apiClient.get('/users?limit=1000')
      if (usuariosResponse.data.success) {
        await offlineStorage.saveUsuarios(usuariosResponse.data.data)
      }
    } catch (error) {
      console.error('Error al descargar datos más recientes:', error)
    }
  }

  // Iniciar sincronización automática
  startAutoSync() {
    // Sincronizar cada 5 minutos si hay conexión
    this.syncInterval = setInterval(
      async () => {
        if (this.isOnline) {
          await this.syncPendingData()
        }
      },
      5 * 60 * 1000
    ) // 5 minutos
  }

  // Detener sincronización automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Guardar preferencias de red
  async saveNetworkPreferences(preferences) {
    try {
      await Preferences.set({
        key: 'network_preferences',
        value: JSON.stringify(preferences),
      })
    } catch (error) {
      console.error('Error al guardar preferencias de red:', error)
    }
  }

  // Cargar preferencias de red
  async loadNetworkPreferences() {
    try {
      const { value } = await Preferences.get({ key: 'network_preferences' })
      return value ? JSON.parse(value) : {}
    } catch (error) {
      console.error('Error al cargar preferencias de red:', error)
      return {}
    }
  }

  // Obtener información de la red
  async getNetworkInfo() {
    try {
      const status = await Network.getStatus()
      return {
        connected: status.connected,
        connectionType: status.connectionType,
        isOnline: status.connected,
        timestamp: Date.now(),
      }
    } catch (_error) {
      return {
        connected: false,
        connectionType: 'unknown',
        isOnline: false,
        timestamp: Date.now(),
      }
    }
  }

  // Verificar si es una conexión lenta
  isSlowConnection() {
    return this.connectionType === 'cellular' || this.connectionType === 'none'
  }

  // Optimizar para conexiones lentas
  async optimizeForSlowConnection() {
    if (this.isSlowConnection()) {
      // Implementar optimizaciones para conexiones lentas
      // Por ejemplo, reducir el tamaño de las imágenes, usar cache más agresivo, etc.
    }
  }

  // Limpiar recursos
  destroy() {
    this.stopAutoSync()
    this.listeners = []
  }
}

export default new NetworkService()
