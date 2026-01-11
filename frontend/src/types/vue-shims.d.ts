// Vue 3 Script Setup shims for TypeScript
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Support for script setup
declare global {
  const defineProps: typeof import('vue').defineProps
  const defineEmits: typeof import('vue').defineEmits
  const defineExpose: typeof import('vue').defineExpose
  const withDefaults: typeof import('vue').withDefaults
}

// Vue SFC macros
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    [key: string]: any
  }
}

export {}