<template>
  <div class="space-y-1">
    <button
      @click="toggleGroup"
      class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-105 min-h-[44px]"
      :aria-expanded="isOpen"
      :aria-controls="`group-${groupId}`"
    >
      <div class="flex items-center min-w-0">
        <i :class="['bx', icon, 'mr-3 text-lg flex-shrink-0']"></i>
        <span class="truncate">{{ label }}</span>
      </div>
      <i
        :class="[
          'bx bx-chevron-down text-lg transition-transform duration-200 flex-shrink-0',
          { 'rotate-180': isOpen },
        ]"
      ></i>
    </button>

    <div
      :id="`group-${groupId}`"
      class="overflow-hidden transition-all duration-300 ease-in-out"
      :class="[isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0']"
    >
      <div class="ml-6 space-y-1">
        <router-link
          v-for="item in items"
          :key="item.label"
          :to="item.to"
          class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 min-h-[40px]"
          :class="[
            isItemActive(item.to)
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shadow-md'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-lg',
          ]"
        >
          <i :class="['bx', item.icon, 'mr-3 text-base flex-shrink-0']"></i>
          <span class="truncate">{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

interface NavGroupItem {
  to: RouteLocationRaw
  icon: string
  label: string
}

interface Props {
  icon: string
  label: string
  items: NavGroupItem[]
}

const props = defineProps<Props>()
const route = useRoute()

const groupId = computed(() => props.label.toLowerCase().replace(/\s+/g, '-'))
const isOpen = ref(false)

const hasActiveItem = computed(() => {
  return props.items.some(item => isItemActive(item.to))
})

const isItemActive = (to: RouteLocationRaw) => {
  if (typeof to === 'string') {
    return route.path === to
  }

  if (typeof to === 'object' && 'name' in to && to.name && route.name) {
    return String(route.name) === String(to.name)
  }

  return false
}

const toggleGroup = () => {
  isOpen.value = !isOpen.value
}

// Open group if it has an active item
onMounted(() => {
  if (hasActiveItem.value) {
    isOpen.value = true
  }
})
</script>
