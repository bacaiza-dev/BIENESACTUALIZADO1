import { defineStore } from 'pinia'
import offlineStorage from '@/services/offlineStorage'
import networkService from '@/services/networkService'

export const useOfflineStore = defineStore('offline', {
  state: () => ({
    isOnline: true,
    connectionType: 'unknown',
    pendingChanges: [],
    syncInProgress: false,
    lastSyncTime: null,
    offlineStats: {
      bienes: 0,
      usuarios: 0,
      categorias: 0,
      ubicaciones: 0,
      pendingChanges: 0,
    },
    syncErrors: [],
  }),

  getters: {
    hasPendingChanges: state => state.pendingChanges.length > 0,
    pendingChangesCount: state => state.pendingChanges.length,
    isSyncInProgress: state => state.syncInProgress,
    lastSyncFormatted: state => {
      if (!state.lastSyncTime) return 'Nunca'
      return new Date(state.lastSyncTime).toLocaleString('es-EC')
    },
    connectionStatus: state => {
      if (state.isOnline) {
        return {
          status: 'online',
          text: 'Conectado',
          icon: 'fas fa-wifi',
          color: 'text-green-600',
        }
      } else {
        return {
          status: 'offline',
          text: 'Sin conexión',
          icon: 'fas fa-wifi-slash',
          color: 'text-yellow-600',
        }
      }
    },
  },

  actions: {
    async initialize() {
      try {
        // Inicializar servicios
        await offlineStorage.init()
        await networkService.init()

        // Configurar listeners
        networkService.addListener(this.handleNetworkChange)

        // Cargar estado inicial
        await this.loadOfflineStats()
        await this.loadPendingChanges()
      } catch (error) {
        console.error('Error al inicializar offline:', error)
      }
    },

    async handleNetworkChange(status) {
      this.isOnline = status.isOnline
      this.connectionType = status.connectionType

      if (status.isOnline && this.hasPendingChanges) {
        // Intentar sincronizar automáticamente cuando se restaura la conexión
        this.syncPendingChanges()
      }
    },

    async loadOfflineStats() {
      try {
        this.offlineStats = await offlineStorage.getStats()
      } catch (error) {
        console.error('Error al cargar estadísticas offline:', error)
      }
    },

    async loadPendingChanges() {
      try {
        this.pendingChanges = await offlineStorage.getPendingChanges()
      } catch (error) {
        console.error('Error al cargar cambios pendientes:', error)
      }
    },

    async addPendingChange(change) {
      await offlineStorage.addPendingChange(change)
      this.pendingChanges.push(change)
      this.offlineStats.pendingChanges = this.pendingChanges.length
    },

    async removePendingChange(id) {
      try {
        await offlineStorage.removePendingChange(id)
        this.pendingChanges = this.pendingChanges.filter(change => change.id !== id)
        this.offlineStats.pendingChanges = this.pendingChanges.length
      } catch (error) {
        console.error('Error al remover cambio pendiente:', error)
      }
    },

    async syncPendingChanges() {
      if (this.syncInProgress || !this.isOnline) {
        return false
      }

      this.syncInProgress = true

      try {
        const changesToSync = [...this.pendingChanges]

        for (const change of changesToSync) {
          try {
            await this.syncChange(change)
            await this.removePendingChange(change.id)
          } catch (error) {
            this.syncErrors.push({
              change,
              error: error.message,
              timestamp: Date.now(),
            })
          }
        }

        this.lastSyncTime = Date.now()

        return true
      } catch (error) {
        return false
      } finally {
        this.syncInProgress = false
      }
    },

    async syncChange(change) {
      // Implementar lógica específica para cada tipo de cambio
      switch (change.type) {
        case 'create_bien':
          await this.syncCreateBien(change.data)
          break
        case 'update_bien':
          await this.syncUpdateBien(change.data)
          break
        case 'delete_bien':
          await this.syncDeleteBien(change.data)
          break
        case 'create_usuario':
          await this.syncCreateUsuario(change.data)
          break
        case 'update_usuario':
          await this.syncUpdateUsuario(change.data)
          break
        case 'delete_usuario':
          await this.syncDeleteUsuario(change.data)
          break
        default:
          throw new Error(`Tipo de cambio no soportado: ${change.type}`)
      }
    },

    async syncCreateBien(data) {
      const response = await fetch('/api/bienes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error creando bien en servidor')
      }
    },

    async syncUpdateBien(data) {
      const response = await fetch(`/api/bienes/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error actualizando bien en servidor')
      }
    },

    async syncDeleteBien(data) {
      const response = await fetch(`/api/bienes/${data.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error eliminando bien en servidor')
      }
    },

    async syncCreateUsuario(data) {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error creando usuario en servidor')
      }
    },

    async syncUpdateUsuario(data) {
      const response = await fetch(`/api/users/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error actualizando usuario en servidor')
      }
    },

    async syncDeleteUsuario(data) {
      const response = await fetch(`/api/users/${data.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error eliminando usuario en servidor')
      }
    },

    async downloadData() {
      if (!this.isOnline) {
        throw new Error('No hay conexión a internet')
      }

      try {
        // Descargar bienes
        const bienesResponse = await fetch('/api/bienes?limit=1000', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        })

        if (bienesResponse.ok) {
          const bienesData = await bienesResponse.json()
          await offlineStorage.saveBienes(bienesData.data || [])
        }

        // Descargar usuarios
        const usuariosResponse = await fetch('/api/users?limit=1000', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        })

        if (usuariosResponse.ok) {
          const usuariosData = await usuariosResponse.json()
          await offlineStorage.saveUsuarios(usuariosData.data || [])
        }

        // Actualizar estadísticas
        await this.loadOfflineStats()
      } catch (error) {
        throw error
      }
    },

    async clearOfflineData() {
      try {
        await offlineStorage.clearAll()
        this.pendingChanges = []
        this.offlineStats = {
          bienes: 0,
          usuarios: 0,
          categorias: 0,
          ubicaciones: 0,
          pendingChanges: 0,
        }
        this.syncErrors = []
      } catch (error) {
        throw error
      }
    },

    clearSyncErrors() {
      this.syncErrors = []
    },

    getSyncErrors() {
      return this.syncErrors
    },

    async forceSync() {
      return await this.syncPendingChanges()
    },
  },
})
