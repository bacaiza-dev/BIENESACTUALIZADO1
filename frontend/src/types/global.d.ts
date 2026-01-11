// Vue types fix
/// <reference types="vite/client" />
/// <reference types="node" />
/// <reference types="vue/macros-global" />

import type { Router } from 'vue-router'
import type { App } from 'vue'
import type { Pinia } from 'pinia'

// Global Vue 3 + TypeScript configuration
declare global {
  // Vue 3 Composition API globals
  const defineProps: typeof import('vue').defineProps
  const defineEmits: typeof import('vue').defineEmits
  const defineExpose: typeof import('vue').defineExpose
  const withDefaults: typeof import('vue').withDefaults
  const useSlots: typeof import('vue').useSlots
  const useAttrs: typeof import('vue').useAttrs
  const useRouter: typeof import('vue-router').useRouter
  const useRoute: typeof import('vue-router').useRoute
  const useStore: typeof import('pinia').useStore
  
  // Vue instance types
  interface ComponentCustomProperties {
    $router: Router
    $route: ReturnType<typeof import('vue-router').useRoute>
    $store: Pinia
  }
  
  interface Window {
    Capacitor?: any
    cordova?: any
  }
}

// Extend Vue component instance type
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: Router
    $route: ReturnType<typeof import('vue-router').useRoute>
    $store: Pinia
  }
}

// Vue SFC types
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

export {}