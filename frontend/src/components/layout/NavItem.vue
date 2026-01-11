<template>
  <router-link
    :to="to"
    class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 min-h-[44px]"
    :class="[
      isActive
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shadow-md'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-lg',
    ]"
  >
    <i :class="['bx', icon, 'mr-3 text-lg flex-shrink-0']"></i>
    <span class="truncate">{{ label }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  to: RouteLocationRaw
  icon: string
  label: string
}

const props = defineProps<Props>()
const route = useRoute()

const isActive = computed(() => {
  if (typeof props.to === 'string') {
    return route.path === props.to
  }

  if (typeof props.to === 'object' && 'name' in props.to && props.to.name && route.name) {
    return String(route.name) === String(props.to.name)
  }

  return false
})
</script>
