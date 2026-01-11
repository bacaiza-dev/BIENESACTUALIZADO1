<template>
  <div class="qr-scanner-view">
    <!-- Header solo para móviles -->
    <div class="mobile-header">
      <button 
        @click="$router.back()"
        class="back-button"
      >
        <i class="bx bx-arrow-back text-xl"></i>
      </button>
      <h1 class="title">Scanner QR</h1>
      <div class="header-actions">
        <button 
          @click="toggleFlash"
          :class="['flash-button', { active: flashEnabled }]"
          :disabled="!flashAvailable"
        >
          <i class="bx bx-flash"></i>
        </button>
      </div>
    </div>

    <!-- Estado de dispositivo -->
    <div v-if="!isCompatibleDevice" class="compatibility-warning">
      <div class="warning-content">
        <i class="bx bx-error-circle text-4xl text-yellow-500 mb-4"></i>
        <h3 class="text-lg font-semibold mb-2">Dispositivo no compatible</h3>
        <p class="text-gray-600 dark:text-gray-400 text-center">
          El scanner QR solo funciona en dispositivos móviles Android e iOS
        </p>
        <button 
          @click="$router.push('/bienes')"
          class="btn-primary mt-4"
        >
          Volver a Bienes
        </button>
      </div>
    </div>

    <!-- Scanner principal -->
    <div v-else class="scanner-container">
      <!-- Área de la cámara -->
      <div class="camera-area" ref="cameraArea">
        <!-- Video para web -->
        <video 
          v-if="!isNative"
          ref="video"
          class="camera-video"
          :class="{ 'flash-on': flashEnabled }"
          autoplay
          playsinline
        ></video>

        <!-- Overlay del scanner -->
        <div class="scanner-overlay">
          <div class="scanner-frame">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
            
            <!-- Línea de escaneo animada -->
            <div class="scan-line" :class="{ active: isScanning }"></div>
          </div>
          
          <div class="scanner-instructions">
            <p>Coloca el código QR dentro del marco</p>
            <div v-if="isScanning" class="scanning-indicator">
              <div class="pulse"></div>
              <span>Escaneando...</span>
            </div>
          </div>
        </div>

        <!-- Estado cuando no está escaneando -->
        <div v-if="!isScanning && !lastResult" class="scanner-idle">
          <div class="idle-content">
            <i class="bx bx-qr-scan text-6xl text-gray-400 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400">
              Presiona el botón para iniciar el escaneo
            </p>
          </div>
        </div>
      </div>

      <!-- Controles principales -->
      <div class="scanner-controls">
        <button
          v-if="!isScanning"
          @click="startScanning"
          class="scan-button"
          :disabled="!cameraAvailable"
        >
          <i class="bx bx-qr-scan text-2xl"></i>
          <span>Iniciar Escaneo</span>
        </button>
        
        <button
          v-else
          @click="stopScanning"
          class="stop-button"
        >
          <i class="bx bx-stop text-2xl"></i>
          <span>Detener</span>
        </button>
      </div>

      <!-- Resultado del último escaneo -->
      <div v-if="lastResult" class="last-result">
        <div class="result-card">
          <div class="result-header">
            <i class="bx bx-check-circle text-green-500 text-xl"></i>
            <span class="result-title">Código Escaneado</span>
            <button @click="clearResult" class="clear-button">
              <i class="bx bx-x"></i>
            </button>
          </div>
          
          <div class="result-content">
            <div class="qr-code">{{ lastResult.code }}</div>
            
            <div v-if="lastResult.bien" class="bien-info">
              <h4 class="bien-name">{{ lastResult.bien.nombre || lastResult.bien.clase_de_bien }}</h4>
              <div class="bien-details">
                <div class="detail-item">
                  <span class="label">Código:</span>
                  <span class="value">{{ lastResult.bien.codigo_institucional }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Estado:</span>
                  <span class="value status" :class="lastResult.bien.estado?.toLowerCase()">
                    {{ lastResult.bien.estado }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Ubicación:</span>
                  <span class="value">{{ lastResult.bien.ubicacion || 'No asignada' }}</span>
                </div>
              </div>
            </div>
            
            <div v-else class="no-bien-found">
              <i class="bx bx-error text-yellow-500"></i>
              <span>Bien no encontrado en la base de datos</span>
            </div>
          </div>
          
          <div class="result-actions">
            <button 
              v-if="lastResult.bien"
              @click="viewBien(lastResult.bien)"
              class="btn-secondary"
            >
              <i class="bx bx-show"></i>
              Ver Detalles
            </button>
            <button 
              @click="startScanning"
              class="btn-primary"
            >
              <i class="bx bx-qr-scan"></i>
              Escanear Otro
            </button>
          </div>
        </div>
      </div>

      <!-- Estado de conectividad -->
      <div class="connectivity-status" :class="{ offline: !isOnline }">
        <i :class="isOnline ? 'bx bx-wifi' : 'bx bx-wifi-off'"></i>
        <span>{{ isOnline ? 'Conectado' : 'Sin conexión' }}</span>
        <div v-if="!lastResult?.synced" class="sync-indicator">
          <i class="bx bx-time"></i>
          <span>Pendiente de sincronizar</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDevice } from '@/composables/useDevice'
import { useToast } from 'vue-toastification'
import { Capacitor } from '@capacitor/core'

const router = useRouter()
const toast = useToast()
const { isMobile, isTablet, isAndroid, isIOS, isNative } = useDevice()

// Estado del scanner
const isScanning = ref(false)
const cameraAvailable = ref(false)
const flashAvailable = ref(false)
const flashEnabled = ref(false)
const isOnline = ref(navigator.onLine)
const lastResult = ref(null)

// Referencias
const video = ref<HTMLVideoElement>()
const cameraArea = ref<HTMLElement>()

// Stream de la cámara
let mediaStream: MediaStream | null = null
let scanInterval: number | null = null

// Computed
const isCompatibleDevice = computed(() => {
  return (isMobile.value || isTablet.value) && (isAndroid.value || isIOS.value)
})

// Métodos principales
const initializeScanner = async () => {
  try {
    if (!isCompatibleDevice.value) {
      toast.warning('Scanner QR solo disponible en dispositivos móviles Android/iOS')
      return
    }

    // Verificar disponibilidad de cámara
    if (isNative.value) {
      cameraAvailable.value = true
      flashAvailable.value = true
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      cameraAvailable.value = true
      flashAvailable.value = false
    }

    console.log('📱 Scanner QR inicializado:', {
      compatible: isCompatibleDevice.value,
      native: isNative.value,
      camera: cameraAvailable.value,
      flash: flashAvailable.value
    })
  } catch (error) {
    console.error('Error initializing scanner:', error)
    toast.error('Error inicializando el scanner')
  }
}

const startScanning = async () => {
  try {
    if (!isCompatibleDevice.value) {
      toast.error('Scanner no compatible con este dispositivo')
      return
    }

    if (isNative.value) {
      await startNativeScanning()
    } else {
      await startWebScanning()
    }

    isScanning.value = true
    toast.success('Escaneo iniciado')
  } catch (error) {
    console.error('Error starting scan:', error)
    toast.error('Error al iniciar el escaneo')
  }
}

const startNativeScanning = async () => {
  try {
    // BarcodeScanner plugin no instalado - usar implementación web
    console.log('BarcodeScanner nativo no disponible, usando implementación web')
    await startWebScanning()
    return
    
    // Código comentado - requiere plugin @capacitor-community/barcode-scanner
    /*
    if (status.granted) {
      BarcodeScanner.hideBackground()
      const result = await BarcodeScanner.startScan()
      BarcodeScanner.showBackground()
      
      if (result.hasContent) {
        await handleQRResult(result.content)
      }
    } else {
      toast.error('Se requieren permisos de cámara')
    }
    */
  } catch (error) {
    console.error('Error with native scanner:', error)
    // Fallback a web scanner
    await startWebScanning()
  }
}

const startWebScanning = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })

    if (video.value) {
      video.value.srcObject = mediaStream
      await video.value.play()
      
      // Iniciar detección de QR
      startQRDetection()
    }
  } catch (error) {
    console.error('Error accessing camera:', error)
    toast.error('No se pudo acceder a la cámara')
  }
}

const startQRDetection = () => {
  if (!video.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  scanInterval = window.setInterval(async () => {
    if (video.value && video.value.videoWidth && video.value.videoHeight) {
      canvas.width = video.value.videoWidth
      canvas.height = video.value.videoHeight
      
      ctx?.drawImage(video.value, 0, 0)
      
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      
      if (imageData) {
        const qrCode = await detectQRCode(imageData)
        if (qrCode) {
          await handleQRResult(qrCode)
        }
      }
    }
  }, 500) // Escanear cada 500ms
}

const detectQRCode = async (imageData: ImageData) => {
  try {
    const jsQR = await import('jsqr')
    const code = jsQR.default(imageData.data, imageData.width, imageData.height)
    return code ? code.data : null
  } catch (error) {
    console.error('Error detecting QR:', error)
    return null
  }
}

const handleQRResult = async (qrCode: string) => {
  try {
    stopScanning()
    
    // Vibrar en dispositivos nativos
    if (isNative.value) {
      try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
        await Haptics.impact({ style: ImpactStyle.Medium })
      } catch (error) {
        console.log('Haptics not available')
      }
    }

    // Buscar bien en la base de datos
    const bien = await searchBien(qrCode)
    
    const result = {
      code: qrCode,
      bien,
      timestamp: Date.now(),
      synced: isOnline.value
    }

    lastResult.value = result
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('last_qr_scan', JSON.stringify(result))
    
    toast.success(`QR escaneado: ${qrCode.substring(0, 20)}...`)
  } catch (error) {
    console.error('Error handling QR result:', error)
    toast.error('Error procesando el código QR')
  }
}

const searchBien = async (qrCode: string) => {
  try {
    if (!isOnline.value) {
      // Búsqueda offline
      const bienesCache = localStorage.getItem('bienes_cache')
      if (bienesCache) {
        const bienes = JSON.parse(bienesCache)
        return bienes.find((bien: any) => 
          bien.codigo_institucional === qrCode ||
          bien.codigo_senescyt === qrCode ||
          qrCode.includes(bien.codigo_institucional)
        )
      }
      return null
    }

    // Búsqueda online
    const response = await fetch(`/api/bienes/search?codigo=${encodeURIComponent(qrCode)}`)
    const data = await response.json()
    
    return data.success && data.data.length > 0 ? data.data[0] : null
  } catch (error) {
    console.error('Error searching bien:', error)
    return null
  }
}

const stopScanning = () => {
  isScanning.value = false
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
  
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
}

const toggleFlash = async () => {
  if (!flashAvailable.value) return
  
  try {
    if (isNative.value && mediaStream) {
      const track = mediaStream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      
      if (capabilities.torch) {
        flashEnabled.value = !flashEnabled.value
        await track.applyConstraints({
          advanced: [{ torch: flashEnabled.value }]
        })
      }
    }
  } catch (error) {
    console.error('Error toggling flash:', error)
  }
}

const clearResult = () => {
  lastResult.value = null
  localStorage.removeItem('last_qr_scan')
}

const viewBien = (bien: any) => {
  router.push(`/bienes/${bien.id_bien || bien.id}`)
}

// Lifecycle
onMounted(async () => {
  await initializeScanner()
  
  // Restaurar último resultado si existe
  const savedResult = localStorage.getItem('last_qr_scan')
  if (savedResult) {
    try {
      lastResult.value = JSON.parse(savedResult)
    } catch (error) {
      console.error('Error loading saved result:', error)
    }
  }
  
  // Listener para cambios de conectividad
  window.addEventListener('online', () => { isOnline.value = true })
  window.addEventListener('offline', () => { isOnline.value = false })
})

onUnmounted(() => {
  stopScanning()
  window.removeEventListener('online', () => { isOnline.value = true })
  window.removeEventListener('offline', () => { isOnline.value = false })
})
</script>

<style scoped>
.qr-scanner-view {
  @apply min-h-screen bg-gray-50 dark:bg-gray-900;
}

.mobile-header {
  @apply flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10;
}

.back-button {
  @apply p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors;
}

.title {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.header-actions {
  @apply flex items-center space-x-2;
}

.flash-button {
  @apply p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50;
}

.flash-button.active {
  @apply bg-yellow-100 text-yellow-600 border border-yellow-300;
}

.compatibility-warning {
  @apply flex items-center justify-center min-h-[50vh] p-8;
}

.warning-content {
  @apply text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700;
}

.scanner-container {
  @apply flex flex-col h-screen;
}

.camera-area {
  @apply relative flex-1 bg-black overflow-hidden;
}

.camera-video {
  @apply w-full h-full object-cover;
}

.camera-video.flash-on {
  filter: brightness(1.2) contrast(1.1);
}

.scanner-overlay {
  @apply absolute inset-0 flex flex-col items-center justify-center;
}

.scanner-frame {
  @apply relative w-64 h-64 mb-8;
}

.corner {
  @apply absolute w-6 h-6 border-4 border-white;
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

.scan-line {
  @apply absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 transition-all duration-1000;
}

.scan-line.active {
  @apply opacity-100;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% { transform: translateY(0); }
  100% { transform: translateY(256px); }
}

.scanner-instructions {
  @apply text-center text-white;
}

.scanning-indicator {
  @apply flex items-center justify-center mt-4 space-x-2;
}

.pulse {
  @apply w-3 h-3 bg-green-400 rounded-full animate-pulse;
}

.scanner-idle {
  @apply absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75;
}

.idle-content {
  @apply text-center text-white;
}

.scanner-controls {
  @apply p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700;
}

.scan-button, .stop-button {
  @apply w-full flex items-center justify-center space-x-3 py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50;
}

.scan-button {
  @apply bg-blue-600 text-white hover:bg-blue-700 active:scale-95;
}

.stop-button {
  @apply bg-red-600 text-white hover:bg-red-700 active:scale-95;
}

.last-result {
  @apply p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700;
}

.result-card {
  @apply bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-4;
}

.result-header {
  @apply flex items-center justify-between;
}

.result-title {
  @apply font-semibold text-gray-900 dark:text-white;
}

.clear-button {
  @apply p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded;
}

.qr-code {
  @apply font-mono text-sm bg-gray-100 dark:bg-gray-600 p-3 rounded-lg border text-gray-900 dark:text-white;
}

.bien-info {
  @apply space-y-3;
}

.bien-name {
  @apply font-semibold text-gray-900 dark:text-white;
}

.bien-details {
  @apply space-y-2;
}

.detail-item {
  @apply flex justify-between items-center;
}

.label {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.value {
  @apply text-sm font-medium text-gray-900 dark:text-white;
}

.status {
  @apply px-2 py-1 rounded-full text-xs font-semibold uppercase;
}

.status.activo {
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.status.inactivo {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}

.no-bien-found {
  @apply flex items-center space-x-2 text-yellow-600 dark:text-yellow-400;
}

.result-actions {
  @apply flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600;
}

.btn-primary, .btn-secondary {
  @apply flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-all duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500;
}

.connectivity-status {
  @apply flex items-center justify-center space-x-2 py-2 px-4 text-sm;
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.connectivity-status.offline {
  @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
}

.sync-indicator {
  @apply flex items-center space-x-1 ml-4 text-xs opacity-75;
}

/* Safe area support para iOS */
@supports (padding: max(0px)) {
  .mobile-header {
    padding-top: max(env(safe-area-inset-top), 1rem);
  }
  
  .scanner-controls {
    padding-bottom: max(env(safe-area-inset-bottom), 1.5rem);
  }
}
</style>