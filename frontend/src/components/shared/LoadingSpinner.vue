<template>
  <div
    :class="[
      'animate-spin rounded-full border-current',
      sizeClasses[size],
      colorClasses[color]
    ]"
    role="status"
    :aria-label="ariaLabel"
  >
    <span class="sr-only">{{ ariaLabel }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  ariaLabel: 'Cargando...'
})

const sizeClasses = {
  xs: 'h-3 w-3 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
  xl: 'h-12 w-12 border-4'
}

const colorClasses = {
  primary: 'text-blue-600 border-t-transparent',
  secondary: 'text-gray-600 border-t-transparent',
  white: 'text-white border-t-transparent',
  gray: 'text-gray-400 border-t-transparent'
}
</script>