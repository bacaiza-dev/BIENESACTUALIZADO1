<template>
  <div class="theme-toggle-container">
    <!-- Botón principal de toggle -->
    <button
      @click="toggleTheme"
      class="theme-toggle-btn"
      :class="[
        'relative inline-flex items-center justify-center',
        'w-10 h-10 rounded-xl',
        'transition-all duration-300 ease-in-out',
        'hover:scale-105 active:scale-95',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'shadow-md hover:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'group',
      ]"
      :title="themeName"
    >
      <!-- Icono sol -->
      <svg
        :class="[
          'absolute inset-0 m-auto w-5 h-5 text-yellow-500',
          'transition-all duration-300',
          isDark ? 'opacity-0 scale-0 rotate-90' : 'opacity-100 scale-100 rotate-0',
        ]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          clip-rule="evenodd"
        />
      </svg>

      <!-- Icono luna -->
      <svg
        :class="[
          'absolute inset-0 m-auto w-5 h-5 text-blue-400',
          'transition-all duration-300',
          isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90',
        ]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>

      <!-- Ripple effect -->
      <div
        class="absolute inset-0 rounded-xl opacity-0 group-active:opacity-20 bg-current transition-opacity duration-150"
      />
    </button>

    <!-- Dropdown menu (opcional) -->
    <div
      v-if="showDropdown"
      class="theme-dropdown"
      :class="[
        'absolute top-12 right-0 z-50',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-xl shadow-xl',
        'py-2 min-w-48',
        'animate-fade-in',
      ]"
    >
      <div
        class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
      >
        Tema
      </div>

      <button
        v-for="option in themeOptions"
        :key="option.value"
        @click="setTheme(option.value)"
        class="theme-option"
        :class="[
          'w-full flex items-center px-3 py-2 text-sm',
          'text-gray-700 dark:text-gray-300',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'transition-colors duration-150',
          currentTheme === option.value &&
            'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
        ]"
      >
        <span class="mr-3 text-lg">{{ option.icon }}</span>
        <div class="flex-1">
          <div class="font-medium">{{ option.label }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ option.description }}</div>
        </div>
        <svg
          v-if="currentTheme === option.value"
          class="w-4 h-4 text-blue-600 dark:text-blue-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Separador -->
      <div class="my-2 border-t border-gray-200 dark:border-gray-700" />

      <!-- Esquemas de color -->
      <div
        class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
      >
        Esquema de color
      </div>

      <div class="px-3 py-2">
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="scheme in colorSchemes"
            :key="scheme.name"
            class="color-scheme-btn"
            :class="[
              'w-8 h-8 rounded-lg border-2 transition-all duration-200',
              'hover:scale-110 active:scale-95',
              'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
            ]"
            :style="{ backgroundColor: scheme.color }"
            :title="scheme.label"
          />
        </div>
      </div>
    </div>

    <!-- Overlay para cerrar dropdown -->
    <div v-if="showDropdown" @click="showDropdown = false" class="fixed inset-0 z-40" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useUIStore } from '@/stores/ui'

// Props
const props = defineProps({
  showLabel: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'button', // 'button', 'switch', 'dropdown'
    validator: value => ['button', 'switch', 'dropdown'].includes(value),
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
    validator: value => ['sm', 'md', 'lg'].includes(value),
  },
})

// Store
const uiStore = useUIStore()

// Estado local
const showDropdown = ref(false)

// Computadas
const isDark = computed(() => uiStore.isDarkMode)
const currentTheme = computed(() => uiStore.currentTheme)
const themeName = computed(() => uiStore.themeName)

// Opciones de tema
const themeOptions = ref([
  {
    value: 'light',
    label: 'Claro',
    description: 'Tema claro',
    icon: '☀️',
  },
  {
    value: 'dark',
    label: 'Oscuro',
    description: 'Tema oscuro',
    icon: '🌙',
  },
  {
    value: 'system',
    label: 'Sistema',
    description: 'Usar preferencia del sistema',
    icon: '🖥️',
  },
])

// Esquemas de color simplificados para UI store
const colorSchemes = ref([
  { name: 'blue', label: 'Azul', color: '#3b82f6' },
  { name: 'green', label: 'Verde', color: '#10b981' },
])

// Métodos
const toggleTheme = () => {
  if (props.variant === 'dropdown') {
    showDropdown.value = !showDropdown.value
  } else {
    uiStore.toggleDarkMode()
  }
}

const setTheme = theme => {
  if (theme === 'system') {
    uiStore.useSystemPreference()
  } else {
    uiStore.setTheme(theme)
  }
  showDropdown.value = false
}

// Manejar click fuera del dropdown
const handleClickOutside = event => {
  if (showDropdown.value && !event.target.closest('.theme-toggle-container')) {
    showDropdown.value = false
  }
}

// Manejar teclas
const handleKeyDown = event => {
  if (event.key === 'Escape' && showDropdown.value) {
    showDropdown.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped src="./ThemeToggle.style.scoped.css"></style>
