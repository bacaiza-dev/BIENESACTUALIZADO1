<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" @click.self="cancel">
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ message }}</p>
        </div>
        <div class="ml-4">
          <button @click="cancel" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end space-x-3">
        <button @click="cancel"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white font-medium transition-colors">
          {{ cancelText }}
        </button>
        <button @click="confirmAction"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors',
            destructive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-blue-600 text-white hover:bg-blue-700'
          ]">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Confirmar' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirmar' },
  cancelText: { type: String, default: 'Cancelar' },
  destructive: { type: Boolean, default: false },
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const confirmAction = () => emit('confirm')
const cancel = () => emit('cancel')
</script>
