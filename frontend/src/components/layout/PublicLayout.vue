<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <template v-if="!authStore.isAuthenticated">
      <!-- Navigation Header -->
      <header class="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <div class="flex items-center">
              <img src="@/assets/LogoINT.png" alt="INT Logo" class="h-8 w-auto" />
              <span class="ml-3 text-xl font-bold text-gray-800 dark:text-white">
                Instituto Nelson Torres
              </span>
            </div>

            <!-- Desktop Navigation -->
            <nav class="hidden md:flex items-center space-x-8">
              <router-link to="/inicio"
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                :class="{ 'text-blue-600 dark:text-blue-400': $route.name === 'Inicio' }">
                <i class="bx bx-home mr-1"></i>
                Inicio
              </router-link>
              <router-link to="/contactos"
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                :class="{ 'text-blue-600 dark:text-blue-400': $route.name === 'Contactos' }">
                <i class="bx bx-phone mr-1"></i>
                Contactos
              </router-link>
              <router-link to="/login"
                class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105">
                <i class="bx bx-log-in mr-1"></i>
                Iniciar Sesión
              </router-link>
            </nav>

            <!-- Mobile menu button -->
            <div class="md:hidden">
              <button @click="mobileMenuOpen = !mobileMenuOpen"
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:text-blue-600 dark:focus:text-blue-400 transition-colors duration-200">
                <i class="bx text-2xl" :class="mobileMenuOpen ? 'bx-x' : 'bx-menu'"></i>
              </button>
            </div>

            <!-- Theme Toggle -->
            <button @click="uiStore.toggleDarkMode"
              class="hidden md:flex items-center justify-center w-10 h-10 ml-4 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105"
              title="Alternar modo oscuro">
              <i :class="['bx text-lg', uiStore.isDarkMode ? 'bx-sun' : 'bx-moon']"></i>
            </button>
          </div>

          <!-- Mobile Navigation -->
          <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div class="flex flex-col space-y-3">
              <router-link to="/inicio" @click="mobileMenuOpen = false"
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                :class="{ 'text-blue-600 dark:text-blue-400': $route.name === 'Inicio' }">
                <i class="bx bx-home mr-2"></i>
                Inicio
              </router-link>
              <router-link to="/contactos" @click="mobileMenuOpen = false"
                class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                :class="{ 'text-blue-600 dark:text-blue-400': $route.name === 'Contactos' }">
                <i class="bx bx-phone mr-2"></i>
                Contactos
              </router-link>
              <router-link to="/login" @click="mobileMenuOpen = false"
                class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-center">
                <i class="bx bx-log-in mr-2"></i>
                Iniciar Sesión
              </router-link>
              <button @click="uiStore.toggleDarkMode"
                class="flex items-center justify-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                <i :class="['bx text-lg mr-2', uiStore.isDarkMode ? 'bx-sun' : 'bx-moon']"></i>
                {{ uiStore.isDarkMode ? 'Modo Claro' : 'Modo Oscuro' }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1">
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-12">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Información Institucional -->
            <div>
              <div class="flex items-center mb-4">
                <img src="@/assets/LogoINT.png" alt="INT Logo" class="h-8 w-auto" />
                <span class="ml-3 text-xl font-bold">Instituto Nelson Torres</span>
              </div>
              <p class="text-gray-400 mb-4">
                Institución líder en educación tecnológica, comprometida con la excelencia
                académica y la innovación educativa.
              </p>
              <div class="flex space-x-4">
                <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
                  <i class="bx bxl-facebook text-xl"></i>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
                  <i class="bx bxl-twitter text-xl"></i>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
                  <i class="bx bxl-instagram text-xl"></i>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
                  <i class="bx bxl-linkedin text-xl"></i>
                </a>
              </div>
            </div>

            <!-- Enlaces Rápidos -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul class="space-y-2">
                <li>
                  <router-link to="/inicio" class="text-gray-400 hover:text-white transition-colors duration-200">
                    Inicio
                  </router-link>
                </li>
                <li>
                  <router-link to="/contactos" class="text-gray-400 hover:text-white transition-colors duration-200">
                    Contactos
                  </router-link>
                </li>
                <li>
                  <router-link to="/login" class="text-gray-400 hover:text-white transition-colors duration-200">
                    Iniciar Sesión
                  </router-link>
                </li>
                <li>
                  <a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">
                    Acerca de
                  </a>
                </li>
              </ul>
            </div>

            <!-- Información de Contacto -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Información de Contacto</h3>
              <div class="space-y-3">
                <div class="flex items-start">
                  <i class="bx bx-map text-blue-400 text-lg mr-3 mt-0.5"></i>
                  <div>
                    <p class="text-gray-400">Avenida Principal #123</p>
                    <p class="text-gray-400">Ciudad, Estado</p>
                  </div>
                </div>
                <div class="flex items-center">
                  <i class="bx bx-phone text-blue-400 text-lg mr-3"></i>
                  <p class="text-gray-400">+1 (555) 123-4567</p>
                </div>
                <div class="flex items-center">
                  <i class="bx bx-envelope text-blue-400 text-lg mr-3"></i>
                  <p class="text-gray-400">info@int.edu</p>
                </div>
                <div class="flex items-center">
                  <i class="bx bx-time text-blue-400 text-lg mr-3"></i>
                  <p class="text-gray-400">Lun - Vie: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Separador -->
          <div class="border-t border-gray-700 mt-8 pt-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
              <p class="text-gray-400 text-sm">
                © {{ new Date().getFullYear() }} Instituto Nacional de Tecnología Nelson Torres.
                Todos los derechos reservados.
              </p>
              <div class="flex space-x-6 mt-4 md:mt-0">
                <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Política de Privacidad
                </a>
                <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Términos de Uso
                </a>
                <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                  Sitio Web
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </template>
    <template v-else>
      <!-- Si está autenticado, no mostrar nada del layout público -->
      <router-view />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'

const uiStore = useUIStore()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

onMounted(() => {
  uiStore.initializeTheme()
})

// Cerrar menú móvil al hacer clic fuera
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (!target.closest('header') && mobileMenuOpen.value) {
    mobileMenuOpen.value = false
  }
})
</script>

<style scoped>
/* Animaciones suaves */
.transition-all {
  transition: all 0.3s ease;
}

/* Efectos hover */
.hover-lift:hover {
  transform: translateY(-2px);
}

/* Estilo para enlaces activos */
.router-link-active {
  color: #2563eb;
}

/* Animaciones para el menú móvil */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Sombras suaves */
.shadow-soft {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Optimizaciones para móviles */
@media (max-width: 768px) {

  /* Mejorar rendimiento táctil */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  /* Optimizar scrolling */
  .scrollable {
    -webkit-overflow-scrolling: touch;
  }
}
</style>