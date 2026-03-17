// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Importar estilos
import './assets/styles/main.css'
import 'boxicons/css/boxicons.min.css'

// Importar Toast (compatible con Tailwind)
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Importar Capacitor para funcionalidades móviles
import { Capacitor } from '@capacitor/core'

// Configuración de Toast con estilos Tailwind modernos
const toastOptions = {
  toastClassName:
    'bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700',
  bodyClassName: 'text-gray-800 dark:text-gray-200 font-medium',
  timeout: 4000,
  position: 'top-right',
  hideProgressBar: false,
  showCloseButtonOnHover: true,
  pauseOnHover: true,
  draggable: true,
  transition: 'Vue-Toastification__fade',
  maxToasts: 5,
  newestOnTop: true,
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Configuración global para Capacitor
app.config.globalProperties.$isNative = Capacitor.isNativePlatform()
app.config.globalProperties.$platform = Capacitor.getPlatform()

// Configuración global para desarrollo
if (import.meta.env.DEV) {
  app.config.globalProperties.$log = console.log
  app.config.globalProperties.$debug = true

  // Evitar que aparezcan alert()/prompt() nativos en desarrollo — usar toasts o modales más agradables
  ;(window as any).alert = (msg: any) => {
    try {
      app.config.globalProperties.$toast.info(String(msg), { timeout: 3000 })
    } catch (e) {
      // fallback
      console.info('alert:', msg)
    }
  }

  // Exponer un helper async para confirm programático (útil en dev): await window.$confirm(...)
  import('@/composables/useConfirm').then(mod => {
    (window as any).$confirm = mod.confirm
  })

  // Aviso si se usa window.confirm nativo en desarrollo (no cambia comportamiento)
  try {
    const nativeConfirm = window.confirm.bind(window)
    ;(window as any).__native_confirm = nativeConfirm
    window.confirm = (message?: string) => {
      try {
        app.config.globalProperties.$toast.info('Se llamó a dialog nativo (confirm). Usa modales personalizados para evitar diálogos del navegador.')
      } catch (e) {
        console.warn('Native confirm called:', message)
      }
      return nativeConfirm(message)
    }
  } catch (e) {
    /* ignore */
  }
}

app.mount('#app')

// Logs informativos
