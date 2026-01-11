<template>
  <div class="qr-scanner-container">
    <!-- Header del scanner -->
    <div class="scanner-header">
      <h3 class="scanner-title">
        <i class="fas fa-qrcode"></i>
        Escáner QR
      </h3>
      <div class="scanner-controls">
        <button
          v-if="!isScanning"
          @click="startScanning"
          class="btn-primary"
          :disabled="!cameraAvailable"
        >
          <i class="fas fa-play"></i>
          Iniciar Escaneo
        </button>
        <button v-else @click="stopScanning" class="btn-secondary">
          <i class="fas fa-stop"></i>
          Detener
        </button>
        <button
          @click="toggleFlash"
          class="btn-icon"
          :class="{ active: flashEnabled }"
          :disabled="!flashAvailable"
        >
          <i class="fas fa-bolt"></i>
        </button>
      </div>
    </div>

    <!-- Estado de conectividad -->
    <div class="connectivity-status" :class="{ offline: !isOnline }">
      <i :class="isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash'"></i>
      <span>{{ isOnline ? 'Modo Online' : 'Modo Offline' }}</span>
    </div>

    <!-- Área del scanner -->
    <div class="scanner-area" ref="scannerArea">
      <!-- Video del scanner -->
      <video
        v-show="isScanning"
        ref="video"
        class="scanner-video"
        :class="{ 'flash-on': flashEnabled }"
      ></video>

      <!-- Overlay del scanner -->
      <div v-show="isScanning" class="scanner-overlay">
        <div class="scanner-frame">
          <div class="corner top-left"></div>
          <div class="corner top-right"></div>
          <div class="corner bottom-left"></div>
          <div class="corner bottom-right"></div>
        </div>
        <div class="scanner-instructions">
          <p>Coloca el código QR dentro del marco</p>
        </div>
      </div>

      <!-- Placeholder cuando no está escaneando -->
      <div v-show="!isScanning" class="scanner-placeholder">
        <div class="placeholder-icon">
          <i class="fas fa-qrcode"></i>
        </div>
        <p class="placeholder-text">
          <template v-if="!isMobile && !isTablet">
            📱 Scanner QR solo disponible en dispositivos móviles
          </template>
          <template v-else-if="!isAndroid && !isIOS">
            🤖📱 Compatible solo con Android e iOS
          </template>
          <template v-else-if="cameraAvailable">
            Presiona "Iniciar Escaneo" para comenzar
          </template>
          <template v-else>
            Cámara no disponible
          </template>
        </p>
      </div>
    </div>

    <!-- Resultados del escaneo -->
    <div v-if="scanResults.length > 0" class="scan-results">
      <h4 class="results-title">
        <i class="fas fa-list"></i>
        Resultados Recientes
      </h4>
      <div class="results-list">
        <div
          v-for="(result, index) in scanResults"
          :key="index"
          class="result-item"
          :class="{ 'offline-result': !result.synced }"
        >
          <div class="result-content">
            <div class="result-code">{{ result.code }}</div>
            <div class="result-info">
              <span class="result-time">{{ formatTime(result.timestamp) }}</span>
              <span v-if="!result.synced" class="result-status offline">
                <i class="fas fa-clock"></i>
                Pendiente
              </span>
              <span v-else class="result-status online">
                <i class="fas fa-check"></i>
                Sincronizado
              </span>
            </div>
          </div>
          <div class="result-actions">
            <button @click="viewResult(result)" class="btn-icon">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="removeResult(index)" class="btn-icon danger">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de resultado -->
    <div v-if="selectedResult" class="result-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Información del Bien</h3>
          <button @click="closeModal" class="btn-icon">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="selectedResult.bien" class="bien-info">
            <div class="info-row">
              <span class="label">Código:</span>
              <span class="value">{{ selectedResult.bien.codigo_institucional }}</span>
            </div>
            <div class="info-row">
              <span class="label">Bien:</span>
              <span class="value">{{ selectedResult.bien.clase_de_bien }}</span>
            </div>
            <div class="info-row">
              <span class="label">Marca:</span>
              <span class="value">{{ selectedResult.bien.marca }}</span>
            </div>
            <div class="info-row">
              <span class="label">Modelo:</span>
              <span class="value">{{ selectedResult.bien.modelo }}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="value status-badge" :class="selectedResult.bien.estado.toLowerCase()">
                {{ selectedResult.bien.estado }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Valor:</span>
              <span class="value">{{ formatCurrency(selectedResult.bien.valor) }}</span>
            </div>
          </div>
          <div v-else class="no-bien-info">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Bien no encontrado en la base de datos</p>
            <p class="code-display">{{ selectedResult.code }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cerrar</button>
          <button
            v-if="selectedResult.bien"
            @click="editBien(selectedResult.bien)"
            class="btn-primary"
          >
            <i class="fas fa-edit"></i>
            Editar
          </button>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="notification" class="notification" :class="notification.type">
      <i :class="notification.icon"></i>
      <span>{{ notification.message }}</span>
    </div>
  </div>
</template>

<script>
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
        const result = {
          code,
          timestamp: Date.now(),
          synced: this.isOnline,
        }

        // Buscar bien en base de datos
        if (this.isOnline) {
          result.bien = await this.searchBienOnline(code)
        } else {
          result.bien = await this.searchBienOffline(code)
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

    async searchBienOnline(code) {
      try {
        const response = await apiClient.get(`/bienes/search?codigo=${code}`)
        return response.data.success ? response.data.data[0] : null
      } catch (error) {
        return null
      }
    },

    async searchBienOffline(code) {
      try {
        const bienes = await offlineStorage.getBienes()
        return bienes.find(bien => bien.codigo_institucional === code)
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
</script>

<style scoped>
.qr-scanner-container {
  @apply bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full max-w-2xl mx-auto transition-all duration-300;
}

.scanner-header {
  @apply flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4;
}

.scanner-title {
  @apply text-lg sm:text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2;
}

.scanner-controls {
  @apply flex flex-col sm:flex-row gap-2 w-full sm:w-auto;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 min-h-[44px] text-base sm:text-sm;
}

.btn-secondary {
  @apply bg-gray-600 text-white px-4 py-3 sm:py-2 rounded-xl hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 min-h-[44px] text-base sm:text-sm;
}

.btn-icon {
  @apply p-3 sm:p-2 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 min-h-[44px] min-w-[44px] flex items-center justify-center;
}

.btn-icon.active {
  @apply bg-yellow-100 border-yellow-400 text-yellow-700;
}

.btn-icon.danger {
  @apply text-red-600 hover:bg-red-50;
}

.connectivity-status {
  @apply flex items-center gap-2 text-sm mb-4 p-3 rounded-lg transition-all duration-300;
  @apply bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border border-green-200 dark:border-green-700;
}

.connectivity-status.offline {
  @apply bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700;
}

.scanner-area {
  @apply relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-6 shadow-inner border-2 border-gray-200 dark:border-gray-600;
  aspect-ratio: 1;
  max-height: 400px;
}

.scanner-video {
  @apply w-full h-full object-cover;
}

.scanner-video.flash-on {
  filter: brightness(1.2) contrast(1.1);
}

.scanner-overlay {
  @apply absolute inset-0 flex items-center justify-center;
}

.scanner-frame {
  @apply relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64;
}

.corner {
  @apply absolute w-8 h-8 border-4 border-blue-500;
}

.corner.top-left {
  @apply top-0 left-0 border-r-0 border-b-0;
}

.corner.top-right {
  @apply top-0 right-0 border-l-0 border-b-0;
}

.corner.bottom-left {
  @apply bottom-0 left-0 border-r-0 border-t-0;
}

.corner.bottom-right {
  @apply bottom-0 right-0 border-l-0 border-t-0;
}

.scanner-instructions {
  @apply absolute bottom-4 left-1/2 transform -translate-x-1/2;
  @apply text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded-lg text-sm sm:text-base;
}

.scanner-placeholder {
  @apply flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 px-4;
}

.placeholder-icon {
  @apply text-4xl sm:text-5xl md:text-6xl mb-4 opacity-50;
}

.placeholder-text {
  @apply text-center max-w-xs text-sm sm:text-base;
}

.scan-results {
  @apply mt-6;
}

.results-title {
  @apply text-lg font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white;
}

.results-list {
  @apply space-y-3 max-h-64 overflow-y-auto;
}

.result-item {
  @apply flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-105;
}

.result-item.offline-result {
  @apply border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900;
}

.result-content {
  @apply flex-1;
}

.result-code {
  @apply font-mono text-sm font-semibold text-gray-800 dark:text-gray-200;
}

.result-info {
  @apply flex items-center gap-4 mt-2;
}

.result-time {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.result-status {
  @apply text-xs flex items-center gap-1 px-2 py-1 rounded-full font-medium;
}

.result-status.offline {
  @apply text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900;
}

.result-status.online {
  @apply text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900;
}

.result-actions {
  @apply flex gap-1;
}

.result-modal {
  @apply fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 p-4;
}

.modal-content {
  @apply bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 scale-95 hover:scale-100;
}

.modal-header {
  @apply flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600;
}

.modal-header h3 {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}

.modal-body {
  @apply p-6;
}

.bien-info {
  @apply space-y-4;
}

.info-row {
  @apply flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg;
}

.label {
  @apply font-medium text-gray-600 dark:text-gray-300;
}

.value {
  @apply text-gray-800 dark:text-gray-200;
}

.status-badge {
  @apply px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide;
}

.status-badge.activo {
  @apply bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200;
}

.status-badge.inactivo {
  @apply bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200;
}

.status-badge.en-reparación {
  @apply bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200;
}

.no-bien-info {
  @apply text-center py-8 text-gray-500 dark:text-gray-400;
}

.code-display {
  @apply font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-lg mt-4 border border-gray-200 dark:border-gray-600;
}

.modal-footer {
  @apply flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-600;
}

.modal-footer button {
  @apply min-h-[44px] px-6 py-3 sm:py-2 text-base sm:text-sm;
}

.notification {
  @apply fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 max-w-xs sm:max-w-sm;
  @apply bg-white border-l-4;
}

.notification.success {
  @apply border-green-500 text-green-700;
}

.notification.error {
  @apply border-red-500 text-red-700;
}

.notification.warning {
  @apply border-yellow-500 text-yellow-700;
}

.notification.info {
  @apply border-blue-500 text-blue-700;
}

/* iOS Safe Area Support */
@supports (padding: max(0px)) {
  .qr-scanner-container {
    padding-top: max(env(safe-area-inset-top), 1rem);
    padding-bottom: max(env(safe-area-inset-bottom), 1rem);
  }
}

/* Touch optimization for mobile devices */
@media (max-width: 768px) {
  .scanner-header {
    @apply flex-col gap-4;
  }

  .scanner-controls {
    @apply w-full justify-center;
  }

  .scanner-frame {
    @apply w-48 h-48;
  }
  
  .result-item {
    @apply p-3;
  }
  
  .result-actions button {
    @apply min-h-[44px] min-w-[44px];
  }
  
  .notification {
    @apply top-2 right-2 left-2 max-w-none;
  }
}

/* Prevent iOS zoom on input focus */
@media (max-width: 768px) {
  input, textarea, select {
    font-size: 16px;
  }
}

/* Improve touch targets */
.btn-primary,
.btn-secondary,
.btn-icon {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Android Material Design improvements */
@media (prefers-color-scheme: dark) {
  .notification {
    @apply bg-gray-800 border-gray-700;
  }
}
</style>
