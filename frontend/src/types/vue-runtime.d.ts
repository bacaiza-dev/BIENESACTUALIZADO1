// Complete Vue runtime type definitions
declare module 'vue' {
  // Re-export all Vue types
  export * from '@vue/runtime-dom'
  export * from '@vue/runtime-core'
  export * from '@vue/reactivity'
  
  // Ensure specific exports are available
  export { 
    ref, 
    reactive, 
    readonly, 
    computed, 
    watch, 
    watchEffect,
    onBeforeMount,
    onMounted, 
    onBeforeUpdate,
    onUpdated,
    onBeforeUnmount,
    onUnmounted,
    onActivated,
    onDeactivated,
    onErrorCaptured,
    onServerPrefetch,
    defineComponent,
    defineAsyncComponent,
    defineProps,
    defineEmits,
    defineExpose,
    withDefaults,
    useSlots,
    useAttrs,
    getCurrentInstance,
    inject,
    provide,
    nextTick,
    isRef,
    unref,
    toRef,
    toRefs,
    isProxy,
    isReactive,
    isReadonly,
    shallowRef,
    shallowReactive,
    shallowReadonly,
    markRaw,
    effectScope,
    getCurrentScope,
    onScopeDispose,
    customRef,
    triggerRef,
    createApp,
    h,
    Fragment,
    Text,
    Comment,
    Static,
    Suspense,
    Teleport,
    KeepAlive,
    Transition,
    TransitionGroup
  } from '@vue/runtime-dom'
}

// Vue SFC script setup support
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $emit: (event: string, ...args: any[]) => void
    $props: Record<string, any>
    $attrs: Record<string, any>
    $slots: Record<string, any>
    $refs: Record<string, any>
    $parent: any
    $root: any
    $el: any
  }
}