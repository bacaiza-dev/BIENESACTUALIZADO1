// Vue runtime augmentation
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $route: import('vue-router').RouteLocationNormalized
    $router: import('vue-router').Router
    $emit: (event: string, ...args: any[]) => void
  }
}