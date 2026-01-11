import { openDB } from 'idb'

class OfflineStorage {
  constructor() {
    this.dbName = 'intbienes-offline'
    this.version = 1
    this.db = null
  }

  async init() {
    try {
      this.db = await openDB(this.dbName, this.version, {
        upgrade: db => {
          // Store para bienes
          if (!db.objectStoreNames.contains('bienes')) {
            const bienesStore = db.createObjectStore('bienes', { keyPath: 'id_bien' })
            bienesStore.createIndex('codigo', 'codigo_institucional', { unique: true })
            bienesStore.createIndex('estado', 'estado', { unique: false })
          }

          // Store para usuarios
          if (!db.objectStoreNames.contains('usuarios')) {
            const usuariosStore = db.createObjectStore('usuarios', { keyPath: 'id_usuario' })
            usuariosStore.createIndex('email', 'correo_institucional', { unique: true })
            usuariosStore.createIndex('cedula', 'cedula', { unique: true })
          }

          // Store para categorias
          if (!db.objectStoreNames.contains('categorias')) {
            db.createObjectStore('categorias', { keyPath: 'id_categoria' })
          }

          // Store para ubicaciones
          if (!db.objectStoreNames.contains('ubicaciones')) {
            db.createObjectStore('ubicaciones', { keyPath: 'id_ubicacion' })
          }

          // Store para cambios pendientes
          if (!db.objectStoreNames.contains('pendingChanges')) {
            const pendingStore = db.createObjectStore('pendingChanges', {
              keyPath: 'id',
              autoIncrement: true,
            })
            pendingStore.createIndex('type', 'type', { unique: false })
            pendingStore.createIndex('timestamp', 'timestamp', { unique: false })
          }

          // Store para configuración
          if (!db.objectStoreNames.contains('config')) {
            db.createObjectStore('config', { keyPath: 'key' })
          }
        },
      })
      return true
    } catch (error) {
      console.error('Error al inicializar base de datos offline:', error)
      return false
    }
  }

  // Métodos para bienes
  async saveBienes(bienes) {
    if (!this.db) await this.init()
    const tx = this.db.transaction('bienes', 'readwrite')
    const store = tx.objectStore('bienes')

    for (const bien of bienes) {
      await store.put(bien)
    }

    await tx.done
  }

  async getBienes() {
    if (!this.db) await this.init()
    const tx = this.db.transaction('bienes', 'readonly')
    const store = tx.objectStore('bienes')
    const bienes = await store.getAll()
    await tx.done
    return bienes
  }

  async getBienById(id) {
    if (!this.db) await this.init()
    const tx = this.db.transaction('bienes', 'readonly')
    const store = tx.objectStore('bienes')
    const bien = await store.get(id)
    await tx.done
    return bien
  }

  async searchBienes(query) {
    if (!this.db) await this.init()
    const bienes = await this.getBienes()
    return bienes.filter(
      bien =>
        bien.codigo_institucional?.toLowerCase().includes(query.toLowerCase()) ||
        bien.clase_de_bien?.toLowerCase().includes(query.toLowerCase()) ||
        bien.marca?.toLowerCase().includes(query.toLowerCase()) ||
        bien.modelo?.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Métodos para usuarios
  async saveUsuarios(usuarios) {
    if (!this.db) await this.init()
    const tx = this.db.transaction('usuarios', 'readwrite')
    const store = tx.objectStore('usuarios')

    for (const usuario of usuarios) {
      await store.put(usuario)
    }

    await tx.done
  }

  async getUsuarios() {
    if (!this.db) await this.init()
    const tx = this.db.transaction('usuarios', 'readonly')
    const store = tx.objectStore('usuarios')
    const usuarios = await store.getAll()
    await tx.done
    return usuarios
  }

  // Métodos para cambios pendientes
  async addPendingChange(change) {
    if (!this.db) await this.init()
    const tx = this.db.transaction('pendingChanges', 'readwrite')
    const store = tx.objectStore('pendingChanges')

    const pendingChange = {
      ...change,
      timestamp: Date.now(),
      status: 'pending',
    }

    await store.add(pendingChange)
    await tx.done
  }

  async getPendingChanges() {
    if (!this.db) await this.init()
    const tx = this.db.transaction('pendingChanges', 'readonly')
    const store = tx.objectStore('pendingChanges')
    const changes = await store.getAll()
    await tx.done
    return changes
  }

  async removePendingChange(id) {
    if (!this.db) await this.init()
    const tx = this.db.transaction('pendingChanges', 'readwrite')
    const store = tx.objectStore('pendingChanges')
    await store.delete(id)
    await tx.done
  }

  // Métodos para configuración
  async saveConfig(key, value) {
    if (!this.db) await this.init()
    const tx = this.db.transaction('config', 'readwrite')
    const store = tx.objectStore('config')
    await store.put({ key, value })
    await tx.done
  }

  async getConfig(key) {
    if (!this.db) await this.init()
    const tx = this.db.transaction('config', 'readonly')
    const store = tx.objectStore('config')
    const config = await store.get(key)
    await tx.done
    return config?.value
  }

  // Sincronización
  async syncWithServer() {
    try {
      const pendingChanges = await this.getPendingChanges()

      for (const change of pendingChanges) {
        try {
          // Aquí implementarías la lógica para enviar cada cambio al servidor

          // Si la sincronización es exitosa, eliminar el cambio pendiente
          await this.removePendingChange(change.id)
        } catch (error) {
          console.error('Error al sincronizar cambio pendiente:', error)
        }
      }
    } catch (error) {
      console.error('Error al sincronizar con servidor:', error)
    }
  }

  // Limpiar datos
  async clearAll() {
    if (!this.db) await this.init()
    const stores = ['bienes', 'usuarios', 'categorias', 'ubicaciones', 'pendingChanges', 'config']

    for (const storeName of stores) {
      const tx = this.db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      await store.clear()
      await tx.done
    }
  }

  // Obtener estadísticas
  async getStats() {
    if (!this.db) await this.init()

    const stats = {}
    const stores = ['bienes', 'usuarios', 'categorias', 'ubicaciones', 'pendingChanges']

    for (const storeName of stores) {
      const tx = this.db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const count = await store.count()
      stats[storeName] = count
      await tx.done
    }

    return stats
  }
}

export default new OfflineStorage()
