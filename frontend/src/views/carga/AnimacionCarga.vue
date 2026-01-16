<template>
  <div class="loading-overlay" :class="{ 'dark': isDarkMode }">
    <div class="loading-container" :class="{ 'dark': isDarkMode }">
      <!-- Logo -->
      <div class="logo-container">
        <img src="@/assets/LogoINT.png" alt="INT Logo" class="logo" :class="{ 'dark': isDarkMode }" />
      </div>
      
      <!-- Animación de carga -->
      <div class="animation-container">
        <svg class="pl" viewBox="0 0 128 128" width="128px" height="128px" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3b82f6"></stop>
              <stop offset="100%" stop-color="#1d4ed8"></stop>
            </linearGradient>
          </defs>
          <circle class="pl__ring" r="56" cx="64" cy="64" fill="none" :stroke="isDarkMode ? 'hsla(0,10%,90%,0.1)' : 'hsla(0,10%,10%,0.1)'" stroke-width="16" stroke-linecap="round"></circle>
          <path class="pl__worm" d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z" fill="none" stroke="url(#pl-grad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="44 1111" stroke-dashoffset="10"></path>
        </svg>
      </div>

      <!-- Texto de carga -->
      <div class="loading-text">
        <h3>Cargando...</h3>
        <p>Sistema de Gestión de Bienes</p>
      </div>

      <!-- Barra de progreso -->
      <div class="progress-container">
        <div class="progress-bar" :class="{ 'dark': isDarkMode }">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-text">{{ Math.round(progress) }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const progress = ref(0)
let progressInterval: NodeJS.Timeout

const isDarkMode = computed(() => uiStore.isDarkMode)

onMounted(() => {
  // Simular progreso de carga realista
  const targetProgress = 100
  const duration = 1000 // 1 segundo
  const interval = 50 // cada 50ms
  const steps = duration / interval
  const increment = targetProgress / steps
  
  progressInterval = setInterval(() => {
    if (progress.value < targetProgress) {
      progress.value += increment
      if (progress.value > targetProgress) {
        progress.value = targetProgress
      }
    } else {
      clearInterval(progressInterval)
    }
  }, interval)
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<style scoped src="./AnimacionCarga.style.scoped.css"></style>
