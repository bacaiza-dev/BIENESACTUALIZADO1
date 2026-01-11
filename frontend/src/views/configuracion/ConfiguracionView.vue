<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Configuración del Sistema
            </h1>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Gestiona la configuración general del sistema de bienes institucionales
            </p>
          </div>
          <button
            @click="saveAllSettings"
            :disabled="loading || !hasChanges"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar de navegación -->
        <div class="lg:col-span-1">
          <nav class="sticky top-8 space-y-2">
            <button
              v-for="section in sections"
              :key="section.id"
              @click="activeSection = section.id"
              :class="[
                'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                activeSection === section.id
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-l-4 border-red-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
              ]"
            >
              <div class="flex items-center">
                <span class="mr-3">{{ section.icon }}</span>
                {{ section.title }}
              </div>
            </button>
          </nav>
        </div>

        <!-- Panel de configuración -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Configuración General -->
          <div
            v-show="activeSection === 'general'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Configuración General
            </h2>

            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Institución
                  </label>
                  <input
                    v-model="settings.general.institutionName"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código SENESCYT
                  </label>
                  <input
                    v-model="settings.general.senescytCode"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moneda
                  </label>
                  <select
                    v-model="settings.general.currency"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="COP">COP - Peso Colombiano</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zona Horaria
                  </label>
                  <select
                    v-model="settings.general.timezone"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="America/Guayaquil">Ecuador (GMT-5)</option>
                    <option value="America/Bogota">Colombia (GMT-5)</option>
                    <option value="America/Lima">Perú (GMT-5)</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dirección
                </label>
                <textarea
                  v-model="settings.general.address"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Configuración de Bienes -->
          <div
            v-show="activeSection === 'bienes'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Configuración de Bienes
            </h2>

            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prefijo Código Institucional
                  </label>
                  <input
                    v-model="settings.bienes.codePrefix"
                    type="text"
                    placeholder="INT-"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vida Útil por Defecto (años)
                  </label>
                  <input
                    v-model="settings.bienes.defaultUsefulLife"
                    type="number"
                    min="1"
                    max="50"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor Mínimo para Registro
                  </label>
                  <input
                    v-model="settings.bienes.minValueForRegistry"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Método de Depreciación
                  </label>
                  <select
                    v-model="settings.bienes.depreciationMethod"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="lineal">Línea Recta</option>
                    <option value="acelerada">Acelerada</option>
                    <option value="unidades">Unidades de Producción</option>
                  </select>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      Generar códigos QR automáticamente
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Crear QR al registrar nuevos bienes
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.bienes.autoGenerateQR"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
                    ></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      Validar número de serie único
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Evitar duplicados en números de serie
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.bienes.validateUniqueSerial"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
                    ></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Configuración de Notificaciones -->
          <div
            v-show="activeSection === 'notifications'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Configuración de Notificaciones
            </h2>

            <div class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      Notificaciones por Email
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Enviar alertas por correo electrónico
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.notifications.emailEnabled"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
                    ></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      Alertas de Mantenimiento
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Recordatorios automáticos de mantenimiento
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.notifications.maintenanceAlerts"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
                    ></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      Alertas de Depreciación
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Notificar cuando un bien esté próximo a depreciarse completamente
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.notifications.depreciationAlerts"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
                    ></div>
                  </label>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Días de Anticipación (Mantenimiento)
                  </label>
                  <input
                    v-model="settings.notifications.maintenanceDaysBefore"
                    type="number"
                    min="1"
                    max="365"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email del Administrador
                  </label>
                  <input
                    v-model="settings.notifications.adminEmail"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Configuración de Seguridad -->
          <div
            v-show="activeSection === 'security'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Configuración de Seguridad
            </h2>

            <div class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      Autenticación de Dos Factores
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Requerir 2FA para administradores
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.security.require2FA"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
                    ></div>
                  </label>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      Registro de Auditoría
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Mantener logs de todas las acciones
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.security.auditLog"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
                    ></div>
                  </label>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expiración de Sesión (minutos)
                  </label>
                  <input
                    v-model="settings.security.sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Intentos de Login Máximos
                  </label>
                  <input
                    v-model="settings.security.maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Configuración de Backup -->
          <div
            v-show="activeSection === 'backup'"
            class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Configuración de Backup
            </h2>

            <div class="space-y-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                      Backup Automático
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Realizar copias de seguridad automáticas
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input
                      v-model="settings.backup.autoBackup"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"
                    ></div>
                  </label>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frecuencia de Backup
                  </label>
                  <select
                    v-model="settings.backup.frequency"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Retención (días)
                  </label>
                  <input
                    v-model="settings.backup.retentionDays"
                    type="number"
                    min="7"
                    max="365"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div class="flex space-x-4">
                <button
                  @click="createManualBackup"
                  :disabled="loading"
                  class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <i class="bx bx-data text-sm mr-2"></i>
                  Crear Backup Manual
                </button>

                <button
                  @click="downloadBackup"
                  :disabled="loading"
                  class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <i class="bx bx-download text-sm mr-2"></i>
                  Descargar Último Backup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

// Composables
const toast = useToast()
const authStore = useAuthStore()

// Estado del componente
const loading = ref(false)
const activeSection = ref('general')
const originalSettings = ref()

// Secciones de configuración
const sections = [
  { id: 'general', title: 'General', icon: '⚙️' },
  { id: 'bienes', title: 'Bienes', icon: '📦' },
  { id: 'notifications', title: 'Notificaciones', icon: '🔔' },
  { id: 'security', title: 'Seguridad', icon: '🔒' },
  { id: 'backup', title: 'Backup', icon: '💾' },
]

// Configuraciones
const settings = ref({
  general: {
    institutionName: 'Instituto Superior Tecnológico Nelson Torres',
    senescytCode: 'INT-2024',
    currency: 'USD',
    timezone: 'America/Guayaquil',
    address: '',
  },
  bienes: {
    codePrefix: 'INT-',
    defaultUsefulLife: 5,
    minValueForRegistry: 50.0,
    depreciationMethod: 'lineal',
    autoGenerateQR: true,
    validateUniqueSerial: true,
  },
  notifications: {
    emailEnabled: true,
    maintenanceAlerts: true,
    depreciationAlerts: true,
    maintenanceDaysBefore: 30,
    adminEmail: '',
  },
  security: {
    require2FA: false,
    auditLog: true,
    sessionTimeout: 120,
    maxLoginAttempts: 5,
  },
  backup: {
    autoBackup: true,
    frequency: 'daily',
    retentionDays: 30,
  },
})

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
})

// Métodos
const loadSettings = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/settings', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al cargar configuraciones')

    const data = await response.json()
    if (data.success) {
      settings.value = { ...settings.value, ...data.data }
      originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    }
  } catch (error) {
    toast.error('Error al cargar las configuraciones')
  } finally {
    loading.value = false
  }
}

const saveAllSettings = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/settings', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings.value),
    })

    if (!response.ok) throw new Error('Error al guardar configuraciones')

    const data = await response.json()
    if (data.success) {
      originalSettings.value = JSON.parse(JSON.stringify(settings.value))
      toast.success('Configuraciones guardadas exitosamente')
    } else {
      throw new Error(data.message || 'Error al guardar configuraciones')
    }
  } catch (error) {
    toast.error('Error al guardar las configuraciones')
  } finally {
    loading.value = false
  }
}

const createManualBackup = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/v1/backup/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al crear backup')

    const data = await response.json()
    if (data.success) {
      toast.success('Backup creado exitosamente')
    } else {
      throw new Error(data.message || 'Error al crear backup')
    }
  } catch (error) {
    toast.error('Error al crear el backup')
  } finally {
    loading.value = false
  }
}

const downloadBackup = async () => {
  try {
    const response = await fetch('/api/v1/backup/latest', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) throw new Error('Error al descargar backup')

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `backup-${new Date().toISOString().split('T')[0]}.sql`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.success('Backup descargado exitosamente')
  } catch (error) {
    toast.error('Error al descargar el backup')
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})

// Watchers
watch(
  settings,
  () => {
    // Auto-save después de 3 segundos de inactividad
    // clearTimeout(autoSaveTimeout)
    // autoSaveTimeout = setTimeout(() => {
    //   if (hasChanges.value) {
    //     saveAllSettings()
    //   }
    // }, 3000)
  },
  { deep: true }
)
</script>
