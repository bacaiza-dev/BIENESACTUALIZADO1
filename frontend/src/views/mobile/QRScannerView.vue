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
                  <span class="label">Categoría:</span>
                  <span class="value">
                    {{ lastResult.bien.categoria?.nombre || lastResult.bien.categoria || 'Sin categoría' }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Ubicación:</span>
                  <span class="value">
                    {{ lastResult.bien.ubicacion?.nombre || lastResult.bien.ubicacion || 'No asignada' }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">Responsable:</span>
                  <span class="value">
                    {{
                      lastResult.bien.responsable
                        ? `${lastResult.bien.responsable.nombre || ''} ${lastResult.bien.responsable.apellido || ''}`.trim()
                        : lastResult.bien.responsable_completo || 'Sin asignar'
                    }}
                  </span>
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
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'
import apiClient from '@/api/client'

const router = useRouter()
const toast = useToast()
const { isMobile, isTablet, isAndroid, isIOS, isNative } = useDevice()

// State
const video = ref<HTMLVideoElement | null>(null)
const cameraArea = ref<HTMLDivElement | null>(null)
const isScanning = ref(false)
const isOnline = ref(navigator.onLine)
const lastResult = ref<any>(null)
const flashEnabled = ref(false)
const flashAvailable = ref(false)
const cameraAvailable = ref(true)

// Media stream reference
let mediaStream: MediaStream | null = null
let scanInterval: number | null = null

// Computed
const isCompatibleDevice = computed(() => {
  return isMobile.value || isTablet.value || !Capacitor.isNativePlatform()
})

// Initialize scanner
const initializeScanner = async () => {
  try {
    // Check camera availability
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    cameraAvailable.value = videoDevices.length > 0

    // Check flash availability (only on native)
    if (isNative.value) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        const track = stream.getVideoTracks()[0]
        const capabilities = track.getCapabilities() as any
        flashAvailable.value = !!capabilities.torch
        track.stop()
      } catch (e) {
        flashAvailable.value = false
      }
    }
  } catch (error) {
    console.error('Error initializing scanner:', error)
    cameraAvailable.value = false
  }
}

// Start scanning based on platform
const startScanning = async () => {
  isScanning.value = true
  
  if (isNative.value) {
    await startNativeScanning()
  } else {
    await startWebScanning()
  }
}


const startNativeScanning = async () => {
  try {
    const status = await BarcodeScanner.checkPermission({ force: true });
    
    if (status.granted) {
      await BarcodeScanner.hideBackground()
      document.body.classList.add('qr-scanner-active')
      
      const result = await BarcodeScanner.startScan()
      
      document.body.classList.remove('qr-scanner-active')
      await BarcodeScanner.showBackground()
      
      if (result.hasContent) {
        await handleQRResult(result.content)
      }
    } else {
      toast.error('Se requieren permisos de cámara')
    }
  } catch (error) {
    console.error('Error with native scanner:', error)
    document.body.classList.remove('qr-scanner-active')
    // Fallback a web scanner if native fails
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
        if (import.meta.env.DEV) console.log('Haptics not available')
      }
    }

    // Buscar bien en la base de datos
    const identifier = extractBienIdentifier(qrCode)
    const bien = await searchBien(qrCode, identifier)
    
    const result = {
      code: identifier.codigo || (identifier.id ? `BIEN-${identifier.id}` : qrCode),
      raw: qrCode,
      bien,
      timestamp: Date.now(),
      synced: isOnline.value
    }

    lastResult.value = result
    
    // Guardar en localStorage para persistencia
    localStorage.setItem('last_qr_scan', JSON.stringify(result))
    
    toast.success(`QR escaneado: ${(result.code || '').substring(0, 30)}...`)
  } catch (error) {
    console.error('Error handling QR result:', error)
    toast.error('Error procesando el codigo QR')
  }
}

const extractBienIdentifier = (qrText: string): { id?: number; codigo?: string } => {
  const text = (qrText || '').trim()

  // URL directo
  try {
    const url = new URL(text)
    const match = url.pathname.match(/\/bienes\/(\d+)/)
    if (match) return { id: Number(match[1]) }
  } catch {
    // ignore
  }

  // URL embebida
  const urlMatch = text.match(/URL:\s*(https?:\/\/\S+)/i)
  if (urlMatch?.[1]) {
    try {
      const url = new URL(urlMatch[1])
      const match = url.pathname.match(/\/bienes\/(\d+)/)
      if (match) return { id: Number(match[1]) }
    } catch {
      // ignore
    }
  }

  // Código institucional embebido (CÓDIGO/CODIGO)
  const codigoMatch = text.match(/C.DIGO:\s*([^\n\r]+)/i)
  if (codigoMatch?.[1]) return { codigo: codigoMatch[1].trim() }

  // SENESCYT como fallback
  const senescytMatch = text.match(/SENESCYT:\s*([^\n\r]+)/i)
  if (senescytMatch?.[1]) {
    const sen = senescytMatch[1].trim()
    if (sen && sen.toUpperCase() !== 'N/A') return { codigo: sen }
  }

  const token = text.split(/\s+/)[0]
  return { codigo: token || text }
}

const searchBien = async (qrCode: string, identifier?: { id?: number; codigo?: string }) => {
  try {
    if (!isOnline.value) {
      // Búsqueda offline
      const bienesCache = localStorage.getItem('bienes_cache')
      if (bienesCache) {
        const bienes = JSON.parse(bienesCache)
        const codigo = identifier?.codigo || ''
        return bienes.find((bien: any) => 
          (codigo && (bien.codigo_institucional === codigo || bien.codigo_senescyt === codigo)) ||
          qrCode.includes(bien.codigo_institucional)
        )
      }
      return null
    }

    // Búsqueda online
    if (identifier?.id) {
      const response = await apiClient.get(`/bienes/${identifier.id}`)
      const data = response
      return data.success ? data.data : null
    }

    const codigo = identifier?.codigo || qrCode
    const response = await apiClient.get(`/bienes/search?codigo=${encodeURIComponent(codigo)}`)
    const data = response

    return data.success && data.data.length > 0 ? data.data[0] : null
  } catch (error) {
    console.error('Error searching bien:', error)
    return null
  }
}

const stopScanning = () => {
  isScanning.value = false
  
  if (mediaStream) {
    mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
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
      const capabilities = track.getCapabilities() as any
      
      if (capabilities.torch) {
        flashEnabled.value = !flashEnabled.value
        await track.applyConstraints({
          advanced: [{ torch: flashEnabled.value } as any]
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

<style src="./QRScannerView.style1.css"></style>

<style scoped src="./QRScannerView.style2.scoped.css"></style>
