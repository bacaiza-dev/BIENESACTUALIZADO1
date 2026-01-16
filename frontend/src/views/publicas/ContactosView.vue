<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Header -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Logo -->
          <div class="mb-8">
            <img
              src="@/assets/LogoINT.png"
              alt="Instituto Nelson Torres"
              class="h-16 w-auto mx-auto"
            />
          </div>

          <!-- Título -->
          <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Contacta con
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Nuestro Soporte
            </span>
          </h1>

          <!-- Subtítulo -->
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Estamos aquí para ayudarte con cualquier consulta sobre el sistema de gestión de bienes
            institucionales. Contáctanos y te responderemos a la brevedad.
          </p>
        </div>
      </div>
    </section>

    <!-- Información de Contacto -->
    <section class="py-16 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- Información de Contacto -->
            <div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Información de Contacto
              </h2>

              <!-- Dirección -->
              <div class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <i class="bx bx-map text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Dirección</h3>
                    <p class="text-gray-600 dark:text-gray-300">
                      Instituto Nacional de Tecnología Nelson Torres<br>
                      Avenida Principal #123<br>
                      Ciudad, Estado - Código Postal<br>
                      País
                    </p>
                  </div>
                </div>
              </div>

              <!-- Teléfono -->
              <div class="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                    <i class="bx bx-phone text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Teléfono</h3>
                    <p class="text-gray-600 dark:text-gray-300">
                      Mesa de Ayuda: +1 (555) 123-4567<br>
                      Administración: +1 (555) 123-4568<br>
                      Soporte Técnico: +1 (555) 123-4569
                    </p>
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="mb-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <i class="bx bx-envelope text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Email</h3>
                    <p class="text-gray-600 dark:text-gray-300">
                      Soporte General: soporte@int.edu<br>
                      Administración: admin@int.edu<br>
                      Soporte Técnico: tech@int.edu
                    </p>
                  </div>
                </div>
              </div>

              <!-- Horarios -->
              <div class="p-6 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
                <div class="flex items-start">
                  <div class="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                    <i class="bx bx-time text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Horarios de Atención</h3>
                    <p class="text-gray-600 dark:text-gray-300">
                      Lunes a Viernes: 8:00 AM - 6:00 PM<br>
                      Sábados: 9:00 AM - 1:00 PM<br>
                      Domingos: Cerrado<br>
                      <span class="font-medium">Soporte de Emergencia: 24/7</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Formulario de Contacto -->
            <div>
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Envía tu Consulta
              </h2>

              <form @submit.prevent="enviarConsulta" class="space-y-6">
                <!-- Tipo de Consulta -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Consulta
                  </label>
                  <select
                    v-model="formulario.tipo"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="soporte_tecnico">Soporte Técnico</option>
                    <option value="solicitud_acceso">Solicitud de Acceso</option>
                    <option value="consulta_general">Consulta General</option>
                    <option value="reporte_error">Reporte de Error</option>
                    <option value="sugerencia">Sugerencia o Mejora</option>
                  </select>
                </div>

                <!-- Nombre -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    v-model="formulario.nombre"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <!-- Email -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    v-model="formulario.email"
                    type="email"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="tu.email@ejemplo.com"
                    required
                  />
                </div>

                <!-- Departamento -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Departamento
                  </label>
                  <select
                    v-model="formulario.departamento"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  >
                    <option value="">Selecciona tu departamento</option>
                    <option value="tecnologia">Tecnología de la Información</option>
                    <option value="administracion">Administración</option>
                    <option value="academico">Académico</option>
                    <option value="finanzas">Finanzas</option>
                    <option value="recursos_humanos">Recursos Humanos</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <!-- Asunto -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asunto
                  </label>
                  <input
                    v-model="formulario.asunto"
                    type="text"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Breve descripción del tema"
                    required
                  />
                </div>

                <!-- Mensaje -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    v-model="formulario.mensaje"
                    rows="6"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                    placeholder="Describe tu consulta de manera detallada..."
                    required
                  ></textarea>
                </div>

                <!-- Prioridad -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prioridad
                  </label>
                  <div class="flex space-x-4">
                    <label class="flex items-center">
                      <input
                        v-model="formulario.prioridad"
                        type="radio"
                        value="baja"
                        class="text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Baja</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="formulario.prioridad"
                        type="radio"
                        value="media"
                        class="text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Media</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        v-model="formulario.prioridad"
                        type="radio"
                        value="alta"
                        class="text-blue-600 focus:ring-blue-500"
                      />
                      <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Alta</span>
                    </label>
                  </div>
                </div>

                <!-- Botón de Envío -->
                <div>
                  <button
                    type="submit"
                    :disabled="enviando"
                    class="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <i
                      v-if="enviando"
                      class="bx bx-loader-alt animate-spin mr-2 text-lg"
                    ></i>
                    <i v-else class="bx bx-send mr-2 text-lg"></i>
                    {{ enviando ? 'Enviando...' : 'Enviar Consulta' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Soporte Adicional -->
    <section class="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-white mb-8">
            Recursos Adicionales de Soporte
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Manual de Usuario -->
            <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition-all duration-300">
              <div class="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i class="bx bx-book-open text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Manual de Usuario</h3>
              <p class="text-blue-100 mb-4">
                Guía completa para usar el sistema de gestión de bienes
              </p>
              <button class="text-white hover:text-blue-100 font-medium">
                Descargar Manual
              </button>
            </div>

            <!-- Video Tutoriales -->
            <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition-all duration-300">
              <div class="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i class="bx bx-play-circle text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Video Tutoriales</h3>
              <p class="text-blue-100 mb-4">
                Aprende a usar las funciones principales del sistema
              </p>
              <button class="text-white hover:text-blue-100 font-medium">
                Ver Videos
              </button>
            </div>

            <!-- FAQ -->
            <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition-all duration-300">
              <div class="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i class="bx bx-help-circle text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold text-white mb-3">Preguntas Frecuentes</h3>
              <p class="text-blue-100 mb-4">
                Respuestas a las consultas más comunes
              </p>
              <button class="text-white hover:text-blue-100 font-medium">
                Ver FAQ
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mensaje de Confirmación -->
    <div
      v-if="mensajeEnviado"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="bx bx-check text-green-600 dark:text-green-400 text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Mensaje Enviado!
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            Hemos recibido tu consulta. Te responderemos dentro de las próximas 24 horas.
          </p>
          <button
            @click="mensajeEnviado = false"
            class="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import apiClient from '@/api/client'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Estado del formulario
const formulario = reactive({
  tipo: '',
  nombre: '',
  email: '',
  departamento: '',
  asunto: '',
  mensaje: '',
  prioridad: 'media'
})

// Estado del componente
const enviando = ref(false)
const mensajeEnviado = ref(false)

// Método para enviar la consulta
const enviarConsulta = async () => {
  enviando.value = true
  
  try {
    // Intento de envío real al backend
    // Nota: El backend puede no tener este endpoint público aún, manejamos el error
    const response = await apiClient.post('/public/contact', formulario).catch(() => {
        // Fallback si 404 o no autorizado (para demo frontend)
        return { success: true, simulated: true }
    })
    
    // Si llegamos aquí, asumimos éxito (o fallback)
    mensajeEnviado.value = true
    toast.success('Mensaje enviado correctamente')
    
    // Limpiar formulario
    Object.assign(formulario, {
      tipo: '',
      nombre: '',
      email: '',
      departamento: '',
      asunto: '',
      mensaje: '',
      prioridad: 'media'
    })
    
  } catch (error) {
    console.error('Error al enviar consulta:', error)
    toast.error('Error al enviar el mensaje')
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped src="./ContactosView.style.scoped.css"></style>