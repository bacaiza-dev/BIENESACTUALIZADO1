
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
