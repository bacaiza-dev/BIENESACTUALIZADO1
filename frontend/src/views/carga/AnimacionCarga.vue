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

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

.loading-overlay.dark {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.loading-container {
  text-align: center;
  color: #1e293b;
  max-width: 400px;
  padding: 2rem;
}

.loading-container.dark {
  color: #f8fafc;
}

.logo-container {
  margin-bottom: 2rem;
  animation: pulse 2s infinite;
}

.logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: none;
}

.logo.dark {
  filter: brightness(0) invert(1);
}

.animation-container {
  margin-bottom: 2rem;
}

.pl,
.pl__worm {
  animation-duration: 3s;
  animation-iteration-count: infinite;
}

.pl {
  animation-name: bump9;
  animation-timing-function: linear;
  width: 8em;
  height: 8em;
}

.pl__ring {
  stroke: hsla(0, 10%, 10%, 0.1);
  transition: stroke 0.3s;
}

.pl__worm {
  animation-name: worm9;
  animation-timing-function: cubic-bezier(0.42, 0.17, 0.75, 0.83);
}

.loading-text {
  margin-bottom: 2rem;
}

.loading-text h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.loading-text p {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}

.progress-container {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar.dark {
  background: rgba(71, 85, 105, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: shimmer 2s infinite;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.9;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}

@keyframes bump9 {
  from,
  42%,
  46%,
  51%,
  55%,
  59%,
  63%,
  67%,
  71%,
  74%,
  78%,
  81%,
  85%,
  88%,
  92%,
  to {
    transform: translate(0, 0);
  }

  44% {
    transform: translate(1.33%, 6.75%);
  }

  53% {
    transform: translate(-16.67%, -0.54%);
  }

  61% {
    transform: translate(3.66%, -2.46%);
  }

  69% {
    transform: translate(-0.59%, 15.27%);
  }

  76% {
    transform: translate(-1.92%, -4.68%);
  }

  83% {
    transform: translate(9.38%, 0.96%);
  }

  90% {
    transform: translate(-4.55%, 1.98%);
  }
}

@keyframes worm9 {
  from {
    stroke-dashoffset: 10;
  }

  25% {
    stroke-dashoffset: 295;
  }

  to {
    stroke-dashoffset: 1165;
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .loading-container {
    padding: 1rem;
  }

  .logo {
    width: 60px;
    height: 60px;
  }

  .pl {
    width: 6em;
    height: 6em;
  }

  .loading-text h3 {
    font-size: 1.25rem;
  }

  .loading-text p {
    font-size: 0.9rem;
  }
}
</style>
