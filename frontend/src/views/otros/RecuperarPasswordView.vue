<template>
  <div
    class="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <img class="mx-auto h-20 w-auto" src="@/assets/LogoINT.png" alt="Instituto Nelson Torres" />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Recuperar Contraseña
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Te ayudamos a recuperar el acceso a tu cuenta
        </p>
      </div>

      <!-- Formulario -->
      <div
        class="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 p-8"
      >
        <!-- Paso 1: Solicitar recuperación -->
        <div v-if="step === 1" class="space-y-6">
          <div class="text-center">
            <div
              class="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Ingresa tu email</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          <form @submit.prevent="requestPasswordReset" class="space-y-4">
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Correo Electrónico
              </label>
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
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="tu.email@intsuperior.edu.ec"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
              </div>
            </div>

            <!-- reCAPTCHA placeholder -->
            <div
              class="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div class="text-sm text-gray-600 dark:text-gray-400">[ reCAPTCHA aquí ]</div>
            </div>

            <button
              type="submit"
              :disabled="loading || !form.email"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              {{ loading ? 'Enviando...' : 'Enviar Enlace de Recuperación' }}
            </button>
          </form>
        </div>

        <!-- Paso 2: Confirmación -->
        <div v-if="step === 2" class="space-y-6">
          <div class="text-center">
            <div
              class="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">¡Correo enviado!</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Hemos enviado un enlace de recuperación a <strong>{{ form.email }}</strong>
            </p>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Revisa tu bandeja de entrada y también la carpeta de spam
            </p>
          </div>

          <div
            class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Instrucciones importantes:
                </h3>
                <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <ul class="list-disc pl-5 space-y-1">
                    <li>El enlace expirará en 30 minutos</li>
                    <li>Solo puedes usar el enlace una vez</li>
                    <li>Si no recibes el correo, verifica tu dirección de email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Temporizador de reenvío -->
          <div v-if="countdown > 0" class="text-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Podrás solicitar un nuevo enlace en {{ formatTime(countdown) }}
            </p>
          </div>

          <button
            v-else
            @click="resendEmail"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Reenviar correo
          </button>
        </div>

        <!-- Enlaces de navegación -->
        <div class="mt-6 text-center space-y-3">
          <router-link
            to="/login"
            class="text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-200"
          >
            ← Volver al inicio de sesión
          </router-link>

          <div class="text-xs text-gray-500 dark:text-gray-400">
            <p>¿Problemas para acceder?</p>
            <a
              href="mailto:soporte@intsuperior.edu.ec"
              class="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
            >
              Contacta a soporte técnico
            </a>
          </div>
        </div>
      </div>

      <!-- Footer informativo -->
      <div class="text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Este sistema está protegido por medidas de seguridad avanzadas
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

// Composables
const router = useRouter()
const toast = useToast()

// Estado del componente
const loading = ref(false)
const step = ref(1) // 1: Formulario, 2: Confirmación
const countdown = ref(0)
let countdownInterval: NodeJS.Timeout | null = null

const form = ref({
  email: '',
})

// Métodos
const requestPasswordReset = async () => {
  loading.value = true

  try {
    const response = await fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.value.email,
      }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      step.value = 2
      startCountdown()
      toast.success('Enlace de recuperación enviado exitosamente')
    } else {
      throw new Error(data.message || 'Error al procesar la solicitud')
    }
  } catch (error: unknown) {
    // Manejo de errores específicos
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('not found') || errorMessage.includes('no encontrado')) {
      toast.error('No existe una cuenta asociada a este correo electrónico')
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('límite')) {
      toast.error('Has enviado demasiadas solicitudes. Intenta más tarde')
    } else {
      toast.error('Error al enviar el enlace de recuperación')
    }
  } finally {
    loading.value = false
  }
}

const resendEmail = async () => {
  // Resetear y volver a enviar
  step.value = 1
  await requestPasswordReset()
}

const startCountdown = () => {
  countdown.value = 60 // 1 minuto
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval!)
      countdownInterval = null
    }
  }, 1000)
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Lifecycle
onMounted(() => {
  // Verificar si hay parámetros de URL para token de reset
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')

  if (token) {
    // Redirigir a página de reset con token
    router.push(`/reset-password?token=${token}`)
  }
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>
