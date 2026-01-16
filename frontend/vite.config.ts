import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      },
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ion-')
        }
      }
    })
  ],
  esbuild: {
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['@ionic/vue', 'vue-toastification'],
          'chart-vendor': ['chart.js', 'vue-chartjs'],
          'capacitor-vendor': ['@capacitor/core', '@capacitor/camera', '@capacitor/device', '@capacitor/filesystem'],
          'utils-vendor': ['qrcode', 'lodash-es'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 3001,
    host: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://intbienes_backend:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      'vue', 
      'vue-router', 
      'pinia', 
      '@capacitor/core',
      '@ionic/vue',
      'qrcode',
      'chart.js'
    ],
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false,
  },
})
