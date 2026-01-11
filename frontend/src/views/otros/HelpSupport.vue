<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Ayuda y Soporte</h1>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Centro de ayuda para el Sistema de Gestión de Bienes INT Nelson Torres
            </p>
          </div>
          <button
            @click="contactSupport"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 hover:scale-105"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar de navegación -->
        <div class="lg:col-span-1">
          <nav class="sticky top-8 space-y-2">
            <button
              v-for="section in sections"
              :key="section.id"
              @click="activeSection = section.id"
              :class="[
                'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                activeSection === section.id
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-l-4 border-red-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
              ]"
            >
              <div class="flex items-center">
                <span class="mr-3">{{ section.icon }}</span>
                {{ section.title }}
              </div>
            </button>
          </nav>
        </div>

        <!-- Panel principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Búsqueda -->
          <div
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar en la documentación..."
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            </div>
          </div>

          <!-- Guía de Inicio Rápido -->
          <div
            v-show="activeSection === 'quickstart'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              🚀 Guía de Inicio Rápido
            </h2>

            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="step in quickstartSteps"
                  :key="step.id"
                  class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <div
                        class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center"
                      >
                        <span class="text-sm font-bold text-red-600 dark:text-red-400">{{
                          step.id
                        }}</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ step.title }}
                      </h3>
                      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {{ step.description }}
                      </p>
                      <button
                        @click="openGuide(step.guide)"
                        class="mt-2 text-xs text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium"
                      >
                        Ver guía →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Preguntas Frecuentes -->
          <div
            v-show="activeSection === 'faq'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              ❓ Preguntas Frecuentes
            </h2>

            <div class="space-y-4">
              <div
                v-for="faq in filteredFAQs"
                :key="faq.id"
                class="border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <button
                  @click="toggleFAQ(faq.id)"
                  class="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                    faq.question
                  }}</span>
                  <svg
                    :class="[
                      'w-5 h-5 text-gray-400 transition-transform duration-200',
                      openFAQs.includes(faq.id) ? 'rotate-180' : '',
                    ]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  v-show="openFAQs.includes(faq.id)"
                  class="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400"
                  v-html="faq.answer"
                ></div>
              </div>
            </div>
          </div>

          <!-- Documentación -->
          <div
            v-show="activeSection === 'docs'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              📚 Documentación
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="doc in documentation"
                :key="doc.id"
                class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
                @click="openDocumentation(doc)"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <span class="text-2xl">{{ doc.icon }}</span>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ doc.title }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {{ doc.description }}
                    </p>
                    <div class="mt-2 flex items-center text-xs text-red-600 dark:text-red-400">
                      <span>{{ doc.pages }} páginas</span>
                      <span class="mx-2">•</span>
                      <span>{{ doc.lastUpdated }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Videos Tutoriales -->
          <div
            v-show="activeSection === 'videos'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              🎥 Videos Tutoriales
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                v-for="video in videos"
                :key="video.id"
                class="group cursor-pointer"
                @click="playVideo(video)"
              >
                <div class="relative">
                  <img
                    :src="video.thumbnail"
                    :alt="video.title"
                    class="w-full h-32 object-cover rounded-lg"
                  />
                  <div
                    class="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div
                    class="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded"
                  >
                    {{ video.duration }}
                  </div>
                </div>
                <div class="mt-3">
                  <h3
                    class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors"
                  >
                    {{ video.title }}
                  </h3>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {{ video.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contacto -->
          <div
            v-show="activeSection === 'contact'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              📞 Contacto y Soporte
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Información de Contacto -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Información de Contacto
                </h3>
                <div class="space-y-4">
                  <div class="flex items-start">
                    <svg
                      class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        soporte@intsuperior.edu.ec
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <svg
                      class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">Teléfono</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">+593 (04) 123-4567</p>
                    </div>
                  </div>
                  <div class="flex items-start">
                    <svg
                      class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">
                        Horarios de Atención
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">
                        Lunes a Viernes: 8:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Formulario de Contacto -->
              <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Enviar Mensaje
                </h3>
                <form @submit.prevent="sendSupportMessage" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Asunto
                    </label>
                    <select
                      v-model="supportForm.subject"
                      required
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Seleccionar asunto</option>
                      <option value="bug">Reporte de Error</option>
                      <option value="feature">Solicitud de Funcionalidad</option>
                      <option value="support">Soporte Técnico</option>
                      <option value="training">Capacitación</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mensaje
                    </label>
                    <textarea
                      v-model="supportForm.message"
                      required
                      rows="4"
                      placeholder="Describe tu consulta o problema..."
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {{ loading ? 'Enviando...' : 'Enviar Mensaje' }}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

// Composables
const toast = useToast()
const authStore = useAuthStore()

// Estado del componente
const loading = ref(false)
const activeSection = ref('quickstart')
const searchQuery = ref('')
const openFAQs = ref<number[]>([])

const supportForm = ref({
  subject: '',
  message: '',
})

// Secciones
const sections = [
  { id: 'quickstart', title: 'Inicio Rápido', icon: '🚀' },
  { id: 'faq', title: 'Preguntas Frecuentes', icon: '❓' },
  { id: 'docs', title: 'Documentación', icon: '📚' },
  { id: 'videos', title: 'Videos', icon: '🎥' },
  { id: 'contact', title: 'Contacto', icon: '📞' },
]

// Datos estáticos
const quickstartSteps = [
  {
    id: 1,
    title: 'Acceder al Sistema',
    description: 'Cómo iniciar sesión y navegar por primera vez',
    guide: 'login-guide',
  },
  {
    id: 2,
    title: 'Registrar Bienes',
    description: 'Aprende a agregar nuevos bienes al inventario',
    guide: 'asset-registration',
  },
  {
    id: 3,
    title: 'Generar Reportes',
    description: 'Crear y exportar reportes de inventario',
    guide: 'reports-guide',
  },
  {
    id: 4,
    title: 'Gestionar Usuarios',
    description: 'Administrar usuarios y permisos del sistema',
    guide: 'user-management',
  },
]

const faqs = [
  {
    id: 1,
    question: '¿Cómo puedo restablecer mi contraseña?',
    answer:
      'Puedes restablecer tu contraseña desde la página de <a href="/recover-password" class="text-red-600 hover:text-red-500">recuperación de contraseña</a>. Solo necesitas tu email registrado.',
  },
  {
    id: 2,
    question: '¿Qué navegadores son compatibles?',
    answer:
      'El sistema es compatible con Chrome 80+, Firefox 75+, Safari 13+, y Edge 80+. Recomendamos mantener tu navegador actualizado.',
  },
  {
    id: 3,
    question: '¿Cómo genero códigos QR para los bienes?',
    answer:
      'Los códigos QR se generan automáticamente al registrar un bien. También puedes regenerarlos desde la vista de detalle del bien.',
  },
  {
    id: 4,
    question: '¿Puedo exportar los datos del inventario?',
    answer:
      'Sí, puedes exportar datos en formato Excel, PDF y CSV desde la sección de Reportes. Los administradores tienen acceso completo a todas las opciones de exportación.',
  },
  {
    id: 5,
    question: '¿Cómo funciona el sistema de depreciación?',
    answer:
      'El sistema calcula la depreciación automáticamente usando el método de línea recta basado en la vida útil configurada para cada categoría de bien.',
  },
]

const documentation = [
  {
    id: 1,
    title: 'Manual de Usuario',
    description: 'Guía completa para usuarios finales',
    icon: '👤',
    pages: 45,
    lastUpdated: 'Actualizado hace 2 días',
  },
  {
    id: 2,
    title: 'Manual de Administrador',
    description: 'Documentación para administradores del sistema',
    icon: '👑',
    pages: 78,
    lastUpdated: 'Actualizado hace 1 semana',
  },
  {
    id: 3,
    title: 'API Reference',
    description: 'Documentación técnica de la API REST',
    icon: '⚙️',
    pages: 120,
    lastUpdated: 'Actualizado hace 3 días',
  },
  {
    id: 4,
    title: 'Guía de Instalación',
    description: 'Instrucciones para instalación y configuración',
    icon: '🔧',
    pages: 25,
    lastUpdated: 'Actualizado hace 1 mes',
  },
]

const videos = [
  {
    id: 1,
    title: 'Introducción al Sistema',
    description: 'Visión general de las funcionalidades principales',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: '10:30',
    url: 'https://example.com/video1',
  },
  {
    id: 2,
    title: 'Registro de Bienes',
    description: 'Cómo registrar y gestionar bienes paso a paso',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: '15:45',
    url: 'https://example.com/video2',
  },
  {
    id: 3,
    title: 'Generación de Reportes',
    description: 'Crear reportes personalizados y exportar datos',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: '12:20',
    url: 'https://example.com/video3',
  },
  {
    id: 4,
    title: 'Gestión de Usuarios',
    description: 'Administrar usuarios, roles y permisos',
    thumbnail: 'https://via.placeholder.com/320x180',
    duration: '18:15',
    url: 'https://example.com/video4',
  },
]

// Computed
const filteredFAQs = computed(() => {
  if (!searchQuery.value) return faqs
  const query = searchQuery.value.toLowerCase()
  return faqs.filter(
    faq => faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
  )
})

// Métodos
const toggleFAQ = (id: number) => {
  const index = openFAQs.value.indexOf(id)
  if (index > -1) {
    openFAQs.value.splice(index, 1)
  } else {
    openFAQs.value.push(id)
  }
}

const openGuide = (guideId: string) => {
  // Aquí podrías abrir un modal con la guía o navegar a una página específica
  toast.info(`Abriendo guía: ${guideId}`)
}

const openDocumentation = (doc: any) => {
  // Aquí podrías abrir el documento en una nueva ventana o modal
  toast.info(`Abriendo documentación: ${doc.title}`)
}

const playVideo = (video: any) => {
  // Aquí podrías abrir el video en un modal o nueva ventana
  toast.info(`Reproduciendo video: ${video.title}`)
}

const contactSupport = () => {
  activeSection.value = 'contact'
}

const sendSupportMessage = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/support/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`,
      },
      body: JSON.stringify({
        ...supportForm.value,
        userId: authStore.user?.id,
        userEmail: authStore.user?.email,
      }),
    })

    if (!response.ok) throw new Error('Error al enviar mensaje')

    const data = await response.json()
    if (data.success) {
      toast.success('Mensaje enviado exitosamente. Te contactaremos pronto.')
      supportForm.value = { subject: '', message: '' }
    } else {
      throw new Error(data.message || 'Error al enviar mensaje')
    }
  } catch (error) {
    toast.error('Error al enviar el mensaje. Intenta nuevamente.')
  } finally {
    loading.value = false
  }
}
</script>
