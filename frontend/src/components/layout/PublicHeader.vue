<template>
  <header class="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo y Título -->
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <img
              src="@/assets/LogoINT.png"
              alt="Instituto Nelson Torres"
              class="h-10 w-10 object-contain"
            />
          </div>
          <div class="hidden md:block">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              Sistema de Bienes
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Instituto Nelson Torres
            </p>
          </div>
        </div>

        <!-- Navegación Desktop -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            to="/"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="{ 'text-primary-600 dark:text-primary-400': $route.path === '/' }"
          >
            <i class="bx bx-home mr-2"></i>
            Inicio
          </router-link>
          
          <router-link
            to="/contactos"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            :class="{ 'text-primary-600 dark:text-primary-400': $route.path === '/contactos' }"
          >
            <i class="bx bx-phone mr-2"></i>
            Contactos
          </router-link>
          
          <a
            href="#"
            @click="scrollToSection('about')"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            <i class="bx bx-info-circle mr-2"></i>
            Acerca de
          </a>
          
          <a
            href="#"
            @click="scrollToSection('features')"
            class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            <i class="bx bx-star mr-2"></i>
            Características
          </a>
        </nav>

        <!-- Botones de Acción -->
        <div class="flex items-center space-x-4">
          <!-- Toggle Theme -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Cambiar tema"
          >
            <i class="bx bx-sun text-lg" v-if="isDark"></i>
            <i class="bx bx-moon text-lg" v-else></i>
          </button>

          <!-- Botón Login -->
          <router-link
            to="/login"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <i class="bx bx-log-in"></i>
            <span>Iniciar Sesión</span>
          </router-link>

          <!-- Botón Menú Móvil -->
          <button
            @click="toggleMobileMenu"
            class="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Abrir menú"
          >
            <i class="bx bx-menu text-lg" v-if="!mobileMenuOpen"></i>
            <i class="bx bx-x text-lg" v-else></i>
          </button>
        </div>
      </div>

      <!-- Menú Móvil -->
      <div
        v-if="mobileMenuOpen"
        class="md:hidden border-t border-gray-200 dark:border-gray-700 pt-4 pb-3"
      >
        <div class="space-y-1">
          <router-link
            to="/"
            @click="closeMobileMenu"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            :class="{ 'text-primary-600 dark:text-primary-400 bg-gray-50 dark:bg-gray-700': $route.path === '/' }"
          >
            <i class="bx bx-home mr-2"></i>
            Inicio
          </router-link>
          
          <router-link
            to="/contactos"
            @click="closeMobileMenu"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            :class="{ 'text-primary-600 dark:text-primary-400 bg-gray-50 dark:bg-gray-700': $route.path === '/contactos' }"
          >
            <i class="bx bx-phone mr-2"></i>
            Contactos
          </router-link>
          
          <a
            href="#"
            @click="scrollToSection('about'); closeMobileMenu()"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <i class="bx bx-info-circle mr-2"></i>
            Acerca de
          </a>
          
          <a
            href="#"
            @click="scrollToSection('features'); closeMobileMenu()"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <i class="bx bx-star mr-2"></i>
            Características
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/stores/theme'

const theme = useTheme()
const mobileMenuOpen = ref(false)

// Computed
const isDark = computed(() => theme.isDark)

// Methods
const toggleTheme = () => {
  theme.toggleTheme()
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// Close mobile menu when clicking outside
const handleClickOutside = (event: Event) => {
  if (mobileMenuOpen.value && !(event.target as Element).closest('header')) {
    mobileMenuOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>