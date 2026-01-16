<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo y Título -->
      <div class="text-center">
        <div
          class="mx-auto h-24 w-24 mb-6 transform transition-all duration-300 hover:scale-110 bg-white dark:bg-gray-800 rounded-full shadow-lg p-3">
          <img src="@/assets/LogoINT.png" alt="Instituto Nelson Torres" class="h-full w-full object-contain" />
        </div>
        <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenido de
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            vuelta
          </span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Sistema de Gestión de Bienes Institucionales
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-500">Instituto Nelson Torres</p>
      </div>

      <!-- Formulario de Login -->
      <div v-if="!authStore.isAuthenticated"
        class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transform transition-all duration-300 hover:shadow-2xl">
        <form @submit.prevent="iniciarSesion" class="space-y-6">
          <!-- Campo Email -->
          <BaseInput v-model="formulario.email" label="Email Institucional" type="email" icon="bx bx-mail-send"
            placeholder="usuario@intsuperior.edu.ec" :error="errores.email" required />

          <!-- Campo Contraseña -->
          <BaseInput 
            v-model="formulario.password" 
            label="Contraseña" 
            type="password"
            icon="bx bx-lock-alt" 
            placeholder="Ingresa tu contraseña" 
            :error="errores.password" 
            :show-password-toggle="true"
            required 
          />

          <!-- Opciones Adicionales -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="recordar" v-model="formulario.recordar" type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label for="recordar" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Recordar sesión
              </label>
            </div>
            <div class="text-sm">
              <button type="button" @click="mostrarRecuperarPassword = true"
                class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <!-- Botón de Login -->
          <BaseButton type="submit" :loading="cargando" :disabled="cargando" variant="primary" size="lg" block
            icon="bx bx-log-in"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl">
            {{ cargando ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </BaseButton>

          <!-- Mensaje de Error -->
          <div v-if="mensajeError"
            class="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z">
                  </path>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800 dark:text-red-200">
                  {{ mensajeError }}
                </p>
              </div>
            </div>
          </div>

          <!-- Botón de debug para redirección manual -->
          <div v-if="authStore.isAuthenticated" class="mt-4 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
            <p class="text-sm text-green-800 dark:text-green-200 mb-2">
              ✅ Login exitoso! Si no se redirige automáticamente, usa estos botones:
            </p>
            <div class="space-y-2">
              <button @click="debugEstado" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                🔍 Debug Estado
              </button>
              <button @click="manejarRedireccion" 
                class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                🚀 Ir al Dashboard
              </button>
            </div>
          </div>
        </form>

        <!-- Enlaces Adicionales -->
      </div>

      <!-- Información del Sistema -->
      <div class="text-center">
        <div
          class="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p class="text-xs text-gray-500 dark:text-gray-400">Sistema de Gestión de Bienes v2.1.0</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            © 2024 Instituto Nacional de Tecnología. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>

    <!-- Modal de Recuperar Contraseña -->
    <BaseModal v-model:show="mostrarRecuperarPassword" title="Recuperar Contraseña" icon="bx bx-key" size="sm" closable
      cancelable confirmable cancel-text="Cancelar" confirm-text="Enviar" @confirm="enviarRecuperacion">
      <BaseInput v-model="recuperarPassword.email" label="Email" type="email" icon="bx bx-mail-send"
        placeholder="Ingresa tu email" required />
    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { useToast } from 'vue-toastification'
import type { LoginRequest } from '@/types'
import BaseInput from '@/components/shared/BaseInput.vue'
import BaseButton from '@/components/shared/BaseButton.vue'
import BaseModal from '@/components/shared/BaseModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()
const toast = useToast()

// Formulario de login
const formulario = reactive({
  email: '',
  password: '',
  recordar: false,
})

// Errores de validación
const errores = reactive({
  email: '',
  password: '',
})

// Formulario de recuperación de contraseña
const recuperarPassword = reactive({
  email: '',
})

// Estado del componente
const cargando = ref(false)
const mostrarRecuperarPassword = ref(false)
const mensajeError = ref('')

// Validar formulario
const validarFormulario = (): boolean => {
  errores.email = ''
  errores.password = ''

  if (!formulario.email.trim()) {
    errores.email = 'El email es requerido'
  } else if (!/^[^\s@]+@intsuperior\.edu\.ec$/.test(formulario.email)) {
    errores.email = 'Solo se permiten emails institucionales (@intsuperior.edu.ec)'
  }

  if (!formulario.password) {
    errores.password = 'La contraseña es requerida'
  } else if (formulario.password.length < 6) {
    errores.password = 'La contraseña debe tener al menos 6 caracteres'
  }

  return !errores.email && !errores.password
}


// Función para manejar la redirección después del login
const manejarRedireccion = async () => {
  // Dar tiempo para que el store se reactive completamente
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // Verificar si el usuario tiene roles
  if (authStore.roles && authStore.roles.length > 0) {
    const userRoles = authStore.roles.map((r: any) => r.nombre)
    
    let targetRoute = 'DashboardUser' // Default fallback
    
    if (userRoles.includes('Administrador')) {
      targetRoute = 'Dashboard'
    } else if (userRoles.includes('Usuario')) {
      targetRoute = 'DashboardUser'
    }
    
    // Usar navegación programática del router
    await router.push({ name: targetRoute })
  } else {
    // Fallback para usuarios sin roles
    await router.push({ name: 'DashboardUser' })
  }
}

// Iniciar sesión
const iniciarSesion = async () => {
  // Prevenir ejecución duplicada
  if (cargando.value) {
    return
  }

  if (!validarFormulario()) {
    return
  }

  cargando.value = true
  mensajeError.value = ''
  uiStore.setLoading(true)

  try {
    const credentials: LoginRequest = {
      email: formulario.email.trim().toLowerCase(),
      password: formulario.password,
    }
    
    await authStore.login(credentials)
    
    toast.success('¡Bienvenido de vuelta!')
    mensajeError.value = ''
    
    // Manejar redirección
    await manejarRedireccion()
    
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string'
        ? String((error as any).message)
        : error instanceof Error
          ? error.message
          : 'Error al iniciar sesión'
    mensajeError.value = errorMessage
    toast.error(mensajeError.value)
  } finally {
    cargando.value = false
    uiStore.setLoading(false)
  }
}

// Enviar recuperación de contraseña
const enviarRecuperacion = async () => {
  if (!recuperarPassword.email) {
    toast.error('Por favor ingresa tu email')
    return
  }

  try {
    await authStore.resetPassword(recuperarPassword.email)
    toast.success('Se ha enviado un enlace de recuperación a tu email')
    mostrarRecuperarPassword.value = false
    recuperarPassword.email = ''
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al enviar el enlace de recuperación'
    toast.error(errorMessage)
  }
}

// Lifecycle
onMounted(async () => {
  // Si ya está autenticado, redirigir
  if (authStore.isAuthenticated) {
    await manejarRedireccion()
  }
})

// Watcher desactivado temporalmente para debugging
// watch(
//   () => [authStore.isAuthenticated, authStore.isAdmin, authStore.isUser, authStore.roles],
//   ([isAuthenticated, isAdmin, isUser, roles]) => {
//     
//     if (isAuthenticated) {
//       if (isAdmin) {
//         router.push('/dashboard')
//       } else if (isUser) {
//         router.push('/dashboard-user')
//       } else {
//         // Fallback para cualquier usuario autenticado
//         router.push('/dashboard-user')
//       }
//     }
//   },
//   { immediate: true }
// )
</script>

<style scoped src="./LoginView.style.scoped.css"></style>
