
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { useToast } from 'vue-toastification'
import networkService from '@/services/networkService'
import offlineStorage from '@/services/offlineStorage'
import apiClient from '@/services/api'

export default {
  name: 'QRScanner',
  props: {
    autoStart: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isScanning: false,
      cameraAvailable: false,
      flashAvailable: false,
      flashEnabled: false,
      isOnline: true,
      scanResults: [],
      selectedResult: null,
      notification: null,
      stream: null,
      scanInterval: null,
    }
  },
  async mounted() {
    await this.initializeScanner()
    this.setupNetworkListener()

    if (this.autoStart) {
      this.startScanning()
    }
  },
  beforeUnmount() {
    this.stopScanning()
    this.cleanup()
  },
  methods: {
    async initializeScanner() {
      try {
        // Verificar disponibilidad de cámara
        this.cameraAvailable =
          Capacitor.isNativePlatform() ||
          (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)

        // Verificar flash en dispositivos móviles
        if (Capacitor.isNativePlatform()) {
          this.flashAvailable = true
        }

        // Cargar resultados guardados
        await this.loadSavedResults()
      } catch (error) {
        this.showNotification('error', 'Error inicializando cámara')
      }
    },

    setupNetworkListener() {
      networkService.addListener(status => {
        this.isOnline = status.isOnline
      })
    },

    async startScanning() {
      try {
        if (Capacitor.isNativePlatform()) {
          await this.startNativeScanning()
        } else {
          await this.startWebScanning()
        }

        this.isScanning = true
        this.showNotification('success', 'Escaneo iniciado')
      } catch {
        this.showNotification('error', 'Error al iniciar el escaneo')
      }
    },

    async startNativeScanning() {
      // Implementación para dispositivos nativos usando Capacitor Camera
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      })

      // Procesar imagen para QR
      await this.processImageForQR(image.webPath)
    },

    async startWebScanning() {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })

        const video = this.$refs.video
        video.srcObject = this.stream
        video.play()

        // Iniciar detección de QR
        this.startQRDetection()
      } catch (error) {
        throw new Error('No se pudo acceder a la cámara')
      }
    },

    async startQRDetection() {
      const video = this.$refs.video
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      this.scanInterval = setInterval(async () => {
        if (video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = await this.detectQRCode(imageData)

          if (code) {
            await this.handleQRCode(code)
          }
        }
      }, 1000) // Escanear cada segundo
    },

    async detectQRCode(imageData) {
      // Implementar detección de QR usando jsqr
      try {
        const jsQR = await import('jsqr')
        const code = jsQR.default(imageData.data, imageData.width, imageData.height)
        return code ? code.data : null
      } catch (error) {
        console.error('Error al detectar código QR:', error)
        return null
      }
    },

    async processImageForQR(imagePath) {
      // Procesar imagen para detectar QR
      // Implementación simplificada
    },

    async handleQRCode(code) {
      try {
        const identifier = this.extractBienIdentifier(code)
        const displayCode = identifier.codigo || (identifier.id ? `BIEN-${identifier.id}` : code)

        const result = {
          code: displayCode,
          raw: code,
          timestamp: Date.now(),
          synced: this.isOnline,
        }

        // Buscar bien en base de datos
        if (this.isOnline) {
          result.bien = await this.searchBienOnline(code, identifier)
        } else {
          result.bien = await this.searchBienOffline(code, identifier)
        }

        // Guardar resultado
        this.scanResults.unshift(result)
        await this.saveResults()

        // Mostrar notificación
        this.showNotification('success', `Código escaneado: ${code}`)

        // Haptic feedback en móvil
        if (Capacitor.isNativePlatform()) {
          const { Haptics } = await import('@capacitor/haptics')
          Haptics.impact({ style: 'light' })
        }

        // Detener escaneo temporalmente
        this.stopScanning()
        setTimeout(() => {
          if (this.autoStart) {
            this.startScanning()
          }
        }, 2000)
      } catch (error) {
        this.showNotification('error', 'Error procesando código')
      }
    },

    extractBienIdentifier(code) {
      const text = String(code || '').trim()

      try {
        const url = new URL(text)
        const match = url.pathname.match(/\\/bienes\\/(\\d+)/)
        if (match) return { id: Number(match[1]) }
      } catch {
        // ignore
      }

      const urlMatch = text.match(/URL:\\s*(https?:\\/\\/\\S+)/i)
      if (urlMatch?.[1]) {
        try {
          const url = new URL(urlMatch[1])
          const match = url.pathname.match(/\\/bienes\\/(\\d+)/)
          if (match) return { id: Number(match[1]) }
        } catch {
          // ignore
        }
      }

      const codigoMatch = text.match(/C.DIGO:\\s*([^\\n\\r]+)/i)
      if (codigoMatch?.[1]) return { codigo: codigoMatch[1].trim() }

      const senescytMatch = text.match(/SENESCYT:\\s*([^\\n\\r]+)/i)
      if (senescytMatch?.[1]) {
        const sen = senescytMatch[1].trim()
        if (sen && sen.toUpperCase() !== 'N/A') return { codigo: sen }
      }

      const token = text.split(/\\s+/)[0]
      return { codigo: token || text }
    },

    async searchBienOnline(code, identifier) {
      try {
        if (identifier?.id) {
          const response = await apiClient.get(`/bienes/${identifier.id}`)
          return response.success ? response.data : null
        }

        const queryCode = identifier?.codigo || code
        const response = await apiClient.get(`/bienes/search?codigo=${encodeURIComponent(queryCode)}`)
        return response.success ? response.data?.[0] : null
      } catch (error) {
        return null
      }
    },

    async searchBienOffline(code, identifier) {
      try {
        const bienes = await offlineStorage.getBienes()
        const queryCode = identifier?.codigo || code
        return bienes.find(bien => bien.codigo_institucional === queryCode || bien.codigo_senescyt === queryCode)
      } catch (error) {
        return null
      }
    },

    async stopScanning() {
      try {
        this.isScanning = false

        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop())
          this.stream = null
        }

        if (this.scanInterval) {
          clearInterval(this.scanInterval)
          this.scanInterval = null
        }
      } catch {
        this.showNotification('error', 'Error al detener el escaneo')
      }
    },

    toggleFlash() {
      if (Capacitor.isNativePlatform()) {
        this.flashEnabled = !this.flashEnabled
        // Implementar control de flash
      }
    },

    async loadSavedResults() {
      try {
        const saved = localStorage.getItem('qr_scan_results')
        if (saved) {
          this.scanResults = JSON.parse(saved)
        }
      } catch {
        this.showNotification('error', 'Error al cargar resultados guardados')
      }
    },

    async saveResults() {
      try {
        // Mantener solo los últimos 50 resultados
        this.scanResults = this.scanResults.slice(0, 50)
        localStorage.setItem('qr_scan_results', JSON.stringify(this.scanResults))
      } catch {
        this.showNotification('error', 'Error al guardar resultados')
      }
    },

    viewResult(result) {
      this.selectedResult = result
    },

    removeResult(index) {
      this.scanResults.splice(index, 1)
      this.saveResults()
    },

    closeModal() {
      this.selectedResult = null
    },

    editBien(bien) {
      this.$router.push(`/bienes/edit/${bien.id_bien}`)
      this.closeModal()
    },

    showNotification(type, message) {
      const toast = useToast()
      const icons = {
        success: 'fas fa-check',
        error: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
      }

      this.notification = {
        type,
        message,
        icon: icons[type],
      }

      toast[type](message)

      setTimeout(() => {
        this.notification = null
      }, 3000)
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency: 'USD',
      }).format(value || 0)
    },

    cleanup() {
      this.stopScanning()
      networkService.destroy()
    },
  },
}
