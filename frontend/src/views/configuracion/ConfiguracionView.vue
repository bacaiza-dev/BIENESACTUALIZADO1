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
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import apiClient from '@/api/client'

// Composables
const toast = useToast()
const authStore = useAuthStore()
const uiStore = useUIStore()

// Estado del componente
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('general')

// Configuración
const settings = reactive({
  general: {
    nombreInstitucion: 'Unidad Educativa Teodoro Wolf',
    direccion: 'Av. Principal 123',
    telefono: '042-123456',
    email: 'contacto@teodorowolf.edu.ec',
    sitioWeb: 'www.teodorowolf.edu.ec',
    moneda: 'USD',
  },
  bienes: {
    prefijoCodigo: 'UE-TW',
    formatoCodigo: 'PREFIJO-AÑO-CONSECUTIVO',
    depreciacionAutomatica: true,
    vidaUtilDefecto: 5,
    notificarGarantia: 30, // días antes
  },
  notificaciones: {
    emailMantenimiento: true,
    emailAsignacion: true,
    emailAlertas: true,
    diasAnticipacion: 3,
  },
  seguridad: {
    longitudMinimaPassword: 8,
    requerirMayusculas: true,
    requerirNumeros: true,
    requerirEspeciales: true,
    tiempoSesion: 60, // minutos
    intentosMaximos: 3,
  },
  backup: {
    frecuencia: 'semanal',
    hora: '00:00',
    retencion: 30, // días
    ultimoBackup: '2024-01-14 00:00:00',
    estado: 'completado',
  },
})

// Métodos
const loadSettings = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/settings')
    const data = response
    // Update settings with data from server if exists
    if (data.success && data.data) {
        // Merge recursively or property by property
        Object.assign(settings, data.data)
    }
  } catch (err: any) {
    const error = err as any
    if (error.response?.status === 404) {
        // Endpoint not found, use defaults and don't error loudly
        console.warn('Endpoint /settings no encontrado, usando configuración por defecto.')
    } else {
        toast.error('Error al cargar la configuración')
    }
  } finally {
    loading.value = false
  }
}

const saveAllSettings = async () => {
  saving.value = true
  try {
    const response = await apiClient.post('/settings', settings)
    const data = response
    if (data.success) {
        toast.success('Configuración guardada correctamente')
    } else {
        throw new Error(data.message || 'Error al guardar')
    }
  } catch (error: any) {
     if (error.response?.status === 404) {
         toast.info('La persistencia de configuración no está implementada en el backend aún.')
     } else {
        toast.error('Error al guardar la configuración')
     }
  } finally {
    saving.value = false
  }
}

const createManualBackup = async () => {
  try {
    toast.info('Iniciando respaldo manual...')
    const response = await apiClient.post('/backup')
    if (response.success) {
      settings.backup.ultimoBackup = new Date().toISOString() // Update UI
      toast.success('Respaldo completado correctamente')
    } else {
      throw new Error(response.message || 'Error en respaldo')
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
         toast.error('Funcionalidad de respaldo no disponible en el servidor.')
    } else {
        toast.error('Error al crear el respaldo')
    }
  }
}

const downloadBackup = async () => {
  try {
    const response = await apiClient.get('/backup/download', { responseType: 'blob' })
    const blob = response as any
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `backup_${new Date().toISOString().split('T')[0]}.sql`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error: any) {
    if (error.response?.status === 404) {
         toast.error('Descarga de respaldo no disponible.')
    } else {
        toast.error('Error al descargar el respaldo')
    }
  }
}

const toggleDarkMode = () => {
  uiStore.toggleDarkMode()
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>
