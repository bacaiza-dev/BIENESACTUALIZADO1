<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configuración del Sistema</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Administra la configuración general del sistema
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Settings Sections -->
    <div v-else class="space-y-6">
      <!-- General Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <i class="bx bx-cog mr-2 text-blue-600"></i>
          Configuración General
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Nombre de la Institución</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Nombre que aparecerá en los reportes</p>
            </div>
            <input 
              v-model="settings.institutionName" 
              type="text"
              class="input-field w-64"
              placeholder="Instituto..."
            />
          </div>

          <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Código Institucional</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Código único de la institución</p>
            </div>
            <input 
              v-model="settings.institutionCode" 
              type="text"
              class="input-field w-64"
              placeholder="INT-001"
            />
          </div>

          <div class="flex items-center justify-between py-3">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Zona Horaria</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Zona horaria para fechas y reportes</p>
            </div>
            <select v-model="settings.timezone" class="input-field w-64">
              <option value="America/Guayaquil">Ecuador (GMT-5)</option>
              <option value="America/Bogota">Colombia (GMT-5)</option>
              <option value="America/Lima">Perú (GMT-5)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <i class="bx bx-bell mr-2 text-yellow-600"></i>
          Notificaciones
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Notificaciones por Email</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Recibir alertas importantes por correo</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.emailNotifications" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between py-3">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Alertas de Mantenimiento</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Notificar cuando un bien requiere mantenimiento</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.maintenanceAlerts" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <i class="bx bx-shield mr-2 text-green-600"></i>
          Seguridad
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Tiempo de Sesión (minutos)</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Tiempo antes de cerrar sesión automáticamente</p>
            </div>
            <input 
              v-model.number="settings.sessionTimeout" 
              type="number"
              min="5"
              max="120"
              class="input-field w-32"
            />
          </div>

          <div class="flex items-center justify-between py-3">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Requerir Contraseña Fuerte</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Mínimo 8 caracteres con mayúsculas y números</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.strongPassword" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end space-x-4">
        <button 
          @click="resetSettings"
          class="btn-secondary"
        >
          <i class="bx bx-reset mr-2"></i>
          Restablecer
        </button>
        <button 
          @click="saveSettings"
          :disabled="saving"
          class="btn-primary"
        >
          <i v-if="saving" class="bx bx-loader-alt animate-spin mr-2"></i>
          <i v-else class="bx bx-save mr-2"></i>
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(true)
const saving = ref(false)

const settings = ref({
  institutionName: 'Instituto Nelson Torres',
  institutionCode: 'INT-001',
  timezone: 'America/Guayaquil',
  emailNotifications: true,
  maintenanceAlerts: true,
  sessionTimeout: 30,
  strongPassword: true
})

const defaultSettings = { ...settings.value }

onMounted(() => {
  // Simulate loading settings
  setTimeout(() => {
    loading.value = false
  }, 500)
})

const saveSettings = async () => {
  saving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Configuración guardada correctamente')
  } catch (error) {
    toast.error('Error al guardar la configuración')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  settings.value = { ...defaultSettings }
  toast.info('Configuración restablecida')
}
</script>
