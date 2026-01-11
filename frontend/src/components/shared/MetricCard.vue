<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
    :class="{ 'animate-pulse': loading }"
  >
    <div class="flex items-center">
      <div
        class="p-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
        :class="iconColorClasses"
      >
        <i :class="icon" class="text-2xl"></i>
      </div>
      <div class="ml-4 flex-1">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ title }}</p>
        <div class="flex items-center space-x-2">
          <p class="text-2xl font-bold text-gray-900 dark:text-white">
            <span
              v-if="loading"
              class="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></span>
            <span v-else>{{ formattedValue }}</span>
          </p>
          <div v-if="change && !loading" class="flex items-center space-x-1">
            <i :class="changeIcon" class="text-sm"></i>
            <span class="text-sm font-medium" :class="changeColorClass"> {{ change }}% </span>
          </div>
        </div>
        <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ subtitle }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  icon: string
  value: string | number
  title: string
  subtitle?: string
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'primary'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  changeType: 'neutral',
  color: 'primary',
  loading: false,
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('es-ES')
  }
  return props.value
})

const iconColorClasses = computed(() => {
  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400',
  }
  return colorMap[props.color] || colorMap.primary
})

const changeIcon = computed(() => {
  switch (props.changeType) {
    case 'increase':
      return 'bx bx-trending-up text-green-500'
    case 'decrease':
      return 'bx bx-trending-down text-red-500'
    default:
      return 'bx bx-minus text-gray-500'
  }
})

const changeColorClass = computed(() => {
  switch (props.changeType) {
    case 'increase':
      return 'text-green-600 dark:text-green-400'
    case 'decrease':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
})
</script>
