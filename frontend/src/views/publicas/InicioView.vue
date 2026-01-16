<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Hero Section -->
    <section class="relative py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Logo -->
          <div class="mb-8">
            <img
              src="@/assets/LogoINT.png"
              alt="Instituto Nelson Torres"
              class="h-20 w-auto mx-auto transform transition-transform duration-300 hover:scale-110"
            />
          </div>

          <!-- Título Principal -->
          <h1
            class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            Sistema de Gestión de
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Bienes Institucionales
            </span>
          </h1>

          <!-- Subtítulo -->
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto px-4">
            Administra, monitorea y controla todos los bienes institucionales del Instituto Nelson Torres
            de manera eficiente y segura.
          </p>

          <!-- Botones de Acción -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <router-link
              to="/login"
              class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl min-h-[50px] text-base sm:text-lg"
            >
              <i class="bx bx-log-in mr-2 text-xl"></i>
              Iniciar Sesión
            </router-link>
            <router-link
              to="/contactos"
              class="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 min-h-[50px] text-base sm:text-lg"
            >
              <i class="bx bx-phone mr-2 text-xl"></i>
              Contactar Soporte
            </router-link>
          </div>
        </div>
      </div>

      <!-- Elementos Decorativos -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-20 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 animate-pulse"></div>
        <div class="absolute bottom-20 right-4 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 bg-indigo-200 dark:bg-indigo-900 rounded-full opacity-20 animate-pulse"></div>
        <div class="absolute top-1/2 left-1/4 w-12 h-12 sm:w-16 sm:h-16 bg-green-200 dark:bg-green-900 rounded-full opacity-20 animate-pulse"></div>
      </div>
    </section>

    <!-- Características Principales -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Características Principales
          </h2>
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Un sistema completo y robusto para la gestión integral de bienes institucionales
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <!-- Gestión de Inventario -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 sm:p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
              <i class="bx bx-package text-white text-2xl"></i>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Gestión de Inventario</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Registro completo de todos los bienes institucionales con códigos únicos, 
              categorización y seguimiento detallado.
            </p>
          </div>

          <!-- Control de Ubicaciones -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 sm:p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div class="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
              <i class="bx bx-map text-white text-2xl"></i>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Control de Ubicaciones</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Monitoreo en tiempo real de la ubicación de todos los bienes 
              dentro de las instalaciones del instituto.
            </p>
          </div>

          <!-- Mantenimiento Preventivo -->
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 sm:p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div class="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
              <i class="bx bx-wrench text-white text-2xl"></i>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Mantenimiento Preventivo</h3>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Programación automática de mantenimientos y alertas para 
              garantizar el óptimo funcionamiento de los equipos.
            </p>
          </div>

          <!-- Reportes y Auditoría -->
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div class="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
              <i class="bx bx-bar-chart-alt-2 text-white text-2xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reportes y Auditoría</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Generación automática de reportes detallados y trazabilidad 
              completa para auditorías institucionales.
            </p>
          </div>

          <!-- Gestión de Usuarios -->
          <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div class="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-6">
              <i class="bx bx-group text-white text-2xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Gestión de Usuarios</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Control de acceso basado en roles con permisos específicos 
              para cada tipo de usuario del sistema.
            </p>
          </div>

          <!-- Códigos QR -->
          <div class="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div class="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
              <i class="bx bx-qr-scan text-white text-2xl"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">Códigos QR</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Identificación rápida y acceso instantáneo a la información 
              de cada bien mediante códigos QR únicos.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Estadísticas -->
    <section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-white mb-4">
            Confianza y Resultados
          </h2>
          <p class="text-xl text-blue-100 max-w-2xl mx-auto">
            Números que respaldan la eficiencia de nuestro sistema
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-5xl font-bold text-white mb-2">500+</div>
            <div class="text-blue-100">Bienes Registrados</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-white mb-2">98%</div>
            <div class="text-blue-100">Precisión en Inventario</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-white mb-2">50+</div>
            <div class="text-blue-100">Usuarios Activos</div>
          </div>
          <div class="text-center">
            <div class="text-5xl font-bold text-white mb-2">24/7</div>
            <div class="text-blue-100">Disponibilidad</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Información Institucional -->
    <section class="py-20 bg-gray-50 dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Instituto Nelson Torres
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
            Institución líder en educación tecnológica comprometida con la excelencia académica 
            y la innovación. Nuestro sistema de gestión de bienes refleja nuestro compromiso 
            con la eficiencia y la transparencia institucional.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i class="bx bx-award text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Excelencia</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Compromiso con la calidad en todos nuestros procesos
              </p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i class="bx bx-shield text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Seguridad</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Protección de datos y transparencia en la gestión
              </p>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i class="bx bx-rocket text-white text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Innovación</h3>
              <p class="text-gray-600 dark:text-gray-300">
                Tecnología de vanguardia para una gestión eficiente
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-20 bg-white dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            ¿Listo para comenzar?
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Accede al sistema y comienza a gestionar los bienes institucionales de manera eficiente
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/login"
              class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <i class="bx bx-log-in mr-2 text-xl"></i>
              Iniciar Sesión
            </router-link>
            <router-link
              to="/contactos"
              class="inline-flex items-center px-8 py-4 bg-transparent text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transform transition-all duration-200 hover:scale-105 border-2 border-blue-600 dark:border-blue-400"
            >
              <i class="bx bx-support mr-2 text-xl"></i>
              Necesito Ayuda
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  // Si ya está autenticado, redirigir al dashboard correspondiente
  if (authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      router.push('/dashboard')
    } else {
      router.push('/dashboard-user')
    }
  }
})
</script>

<style scoped src="./InicioView.style.scoped.css"></style>