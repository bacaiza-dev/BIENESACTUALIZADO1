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
}

app.mount('#app')

// Logs informativos
