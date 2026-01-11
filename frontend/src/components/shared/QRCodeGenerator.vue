<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
  >
    <div class="p-6">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-600"
      >
        <h3
          class="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-4 sm:mb-0"
        >
          <svg
            class="w-6 h-6 text-red-600 dark:text-red-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4m-4 8h4M4 16h4m6-4h2m-6 0V9a3 3 0 013-3h1m-4 12h4m0 0v4m-4-4v4m-4-4h4"
            />
          </svg>
          Código QR del Bien
        </h3>
        <div class="flex gap-2 sm:gap-3">
          <button
            @click="downloadQR"
            :disabled="!qrData || loading"
            class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Descargar
          </button>
          <button
            @click="printQR"
            :disabled="!qrData || loading"
            class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Imprimir
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-col lg:flex-row gap-6 items-start">
        <!-- QR Code Container -->
        <div class="flex-shrink-0 mx-auto lg:mx-0">
          <div class="relative">
            <canvas
              ref="qrCanvas"
              class="border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white shadow-lg transition-all duration-300"
              :class="{ 'animate-pulse': loading }"
            ></canvas>

            <!-- Loading Placeholder -->
            <div
              v-if="!qrData || loading"
              class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-xl transition-all duration-300"
            >
              <svg
                v-if="loading"
                class="w-12 h-12 text-red-600 dark:text-red-400 animate-spin mb-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg
                v-else
                class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4m-4 8h4M4 16h4m6-4h2m-6 0V9a3 3 0 013-3h1m-4 12h4m0 0v4m-4-4v4m-4-4h4"
                />
              </svg>
              <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {{ loading ? 'Generando código QR...' : 'Código QR no disponible' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <div class="flex-1 w-full lg:w-auto">
          <div class="space-y-3">
            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Código:</span>
              <span class="text-sm text-gray-900 dark:text-white font-mono font-semibold">
                {{ bienData.codigo_institucional || 'No asignado' }}
              </span>
            </div>

            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Bien:</span>
              <span class="text-sm text-gray-900 dark:text-white">
                {{ bienData.nombre || bienData.clase_de_bien || 'No especificado' }}
              </span>
            </div>

            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación:</span>
              <span class="text-sm text-gray-900 dark:text-white">
                {{ bienData.ubicacion || 'No asignada' }}
              </span>
            </div>

            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Estado:</span>
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                :class="getEstadoClass(bienData.estado)"
              >
                {{ bienData.estado || 'No definido' }}
              </span>
            </div>

            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Serie:</span>
              <span class="text-sm text-gray-900 dark:text-white font-mono">
                {{ bienData.serie || 'No especificada' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm text-gray-600 dark:text-gray-400"
      >
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Generado: {{ currentTimestamp }}
        </div>
        <div class="flex items-center">
          <svg
            class="w-4 h-4 mr-2 transition-colors duration-200"
            :class="isOnline ? 'text-green-500' : 'text-red-500'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="isOnline"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
            />
          </svg>
          {{ isOnline ? 'Modo Online' : 'Modo Offline' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcode'

export default {
  name: 'QRCodeGenerator',
  props: {
    bienData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      qrData: null,
      loading: true,
      isOnline: navigator.onLine,
      currentTimestamp: new Date().toLocaleString('es-ES'),
    }
  },
  watch: {
    bienData: {
      handler: 'generateQR',
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateOnlineStatus)
    window.removeEventListener('offline', this.updateOnlineStatus)
  },
  methods: {
    async generateQR() {
      if (!this.bienData) return

      this.loading = true

      try {
        // Crear datos del QR con información organizada horizontalmente
        const qrData = [
          `=== INSTITUTO SUPERIOR TECNOLÓGICO NELSON TORRES ===`,
          `CÓDIGO: ${this.bienData.codigo_institucional || 'N/A'}`,
          `SENESCYT: ${this.bienData.codigo_senescyt || 'N/A'}`,
          `NOMBRE: ${this.bienData.nombre || 'N/A'}`,
          `DESCRIPCIÓN: ${this.bienData.descripcion || 'N/A'}`,
          `MARCA: ${this.bienData.marca || 'N/A'}`,
          `MODELO: ${this.bienData.modelo || 'N/A'}`,
          `SERIE: ${this.bienData.serie || 'N/A'}`,
          `CATEGORÍA: ${this.bienData.categoria?.nombre || 'N/A'}`,
          `UBICACIÓN: ${this.bienData.ubicacion?.nombre || 'N/A'}`,
          `ESTADO: ${this.bienData.estado || 'N/A'}`,
          `VALOR: $${this.bienData.valor_adquisicion || '0.00'}`,
          `RESPONSABLE: ${this.bienData.responsable ? (this.bienData.responsable.nombre + ' ' + (this.bienData.responsable.apellido || '')).trim() : 'Sin asignar'}`,
          `FECHA ADQUISICIÓN: ${this.bienData.fecha_adquisicion ? new Date(this.bienData.fecha_adquisicion).toLocaleDateString() : 'N/A'}`,
          ``,
          `URL: ${this.isOnline ? `${window.location.origin}/bienes/${this.bienData.id_bien}` : 'Modo offline'}`,
          `GENERADO: ${new Date().toLocaleString()}`,
          `SISTEMA: v2.0.0`
        ].join('\n')

        this.qrData = qrData

        // Generar QR
        const canvas = this.$refs.qrCanvas
        const qrString = qrData

        await QRCode.toCanvas(canvas, qrString, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        })

        this.currentTimestamp = new Date().toLocaleString('es-ES')
      } catch (error) {
        // Puedes manejar el error aquí si lo deseas
      } finally {
        this.loading = false
      }
    },

    getEstadoClass(estado) {
      const map = {
        ACTIVO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        INACTIVO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        MANTENIMIENTO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        BAJA: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        TRANSFERIDO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      }
      return (
        map[estado?.toUpperCase()] ||
        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      )
    },

    updateOnlineStatus() {
      this.isOnline = navigator.onLine
      if (this.isOnline) {
        this.generateQR() // Regenerar con URL si vuelve online
      }
    },

    downloadQR() {
      if (!this.$refs.qrCanvas) return

      const canvas = this.$refs.qrCanvas
      const link = document.createElement('a')
      link.download = `QR_${this.bienData.codigo_institucional}_${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    },

    printQR() {
      if (!this.$refs.qrCanvas) return

      const printWindow = window.open('', '_blank')
      const canvas = this.$refs.qrCanvas

      printWindow.document.write(`
        <html>
          <head>
            <title>QR - ${this.bienData.codigo_institucional}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
              }
              .qr-print-container {
                max-width: 400px;
                margin: 0 auto;
              }
              .qr-info {
                margin-top: 20px;
                text-align: left;
              }
              .info-item {
                margin: 5px 0;
              }
              .info-label {
                font-weight: bold;
                margin-right: 10px;
              }
            </style>
          </head>
          <body>
            <div class="qr-print-container">
              <h2>Código QR - ${this.bienData.codigo_institucional}</h2>
              <img src="${canvas.toDataURL()}" alt="QR Code" style="max-width: 100%;">
              <div class="qr-info">
                <div class="info-item">
                  <span class="info-label">Bien:</span>
                  <span>${this.bienData.clase_de_bien}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Ubicación:</span>
                  <span>${this.bienData.ubicacion || 'No asignada'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Estado:</span>
                  <span>${this.bienData.estado || 'No definido'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Generado:</span>
                  <span>${this.currentTimestamp}</span>
                </div>
              </div>
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.print()
    },
  },
}
</script>
