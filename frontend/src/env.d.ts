/// <reference types="vite/client" />
/// <reference types="vue/macros-global" />
/// <reference path="./types/vue-runtime.d.ts" />
/// <reference path="./types/vue-shims.d.ts" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vue 3 Script Setup global compilation context
declare global {
  const defineProps: typeof import('vue').defineProps
  const defineEmits: typeof import('vue').defineEmits
  const defineExpose: typeof import('vue').defineExpose
  const withDefaults: typeof import('vue').withDefaults
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
