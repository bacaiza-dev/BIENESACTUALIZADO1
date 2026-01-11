<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {{ isEditing ? 'Editar Bien' : 'Nuevo Bien' }}
            </h1>
            <p class="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {{
                isEditing
                  ? 'Modifica la información del bien institucional'
                  : 'Registra un nuevo bien institucional'
              }}
            </p>
          </div>
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              @click="goBack"
              class="inline-flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white min-h-[44px] touch-manipulation"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver
            </button>
            <button
              @click="saveBien"
              :disabled="!isFormValid"
              class="inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario principal -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <form @submit.prevent="saveBien" class="p-6 space-y-6">
          <!-- Información Básica -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Básica
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código del Bien *
                </label>
                <input
                  v-model="form.codigo"
                  type="text"
                  required
                  placeholder="Ej: BIEN-001"
                  class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[44px] text-base touch-manipulation"
                  :class="{ 'border-red-500': errors.codigo }"
                />
                <p v-if="errors.codigo" class="mt-1 text-sm text-red-600">{{ errors.codigo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Bien *
                </label>
                <input
                  v-model="form.nombre"
                  type="text"
                  required
                  placeholder="Ej: Laptop HP ProBook"
                  class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[44px] text-base touch-manipulation"
                  :class="{ 'border-red-500': errors.nombre }"
                />
                <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría *
                </label>
                <select
                  v-model="form.categoria"
                  required
                  class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[44px] text-base touch-manipulation"
                  :class="{ 'border-red-500': errors.categoria }"
                >
                  <option value="">Seleccionar categoría</option>
                  <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                    {{ cat.nombre }}
                  </option>
                </select>
                <p v-if="errors.categoria" class="mt-1 text-sm text-red-600">
                  {{ errors.categoria }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado *
                </label>
                <select
                  v-model="form.estado"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.estado }"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="mantenimiento">En Mantenimiento</option>
                  <option value="baja">De Baja</option>
                </select>
                <p v-if="errors.estado" class="mt-1 text-sm text-red-600">{{ errors.estado }}</p>
              </div>
            </div>
          </div>

          <!-- Ubicación y Responsable -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ubicación y Responsable
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación *
                </label>
                <select
                  v-model="form.ubicacion"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.ubicacion }"
                >
                  <option value="">Seleccionar ubicación</option>
                  <option v-for="ub in ubicaciones" :key="ub.id" :value="ub.id">
                    {{ ub.nombre }}
                  </option>
                </select>
                <p v-if="errors.ubicacion" class="mt-1 text-sm text-red-600">
                  {{ errors.ubicacion }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Responsable *
                </label>
                <select
                  v-model="form.responsable"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.responsable }"
                >
                  <option value="">Seleccionar responsable</option>
                  <option v-for="user in usuarios" :key="user.id" :value="user.id">
                    {{ user.nombre }} {{ user.apellido }}
                  </option>
                </select>
                <p v-if="errors.responsable" class="mt-1 text-sm text-red-600">
                  {{ errors.responsable }}
                </p>
              </div>
            </div>
          </div>

          <!-- Especificaciones Técnicas -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Especificaciones Técnicas
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marca
                </label>
                <input
                  v-model="form.marca"
                  type="text"
                  placeholder="Ej: HP, Dell, Samsung"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo
                </label>
                <input
                  v-model="form.modelo"
                  type="text"
                  placeholder="Ej: ProBook 450 G8"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Serie
                </label>
                <input
                  v-model="form.serie"
                  type="text"
                  placeholder="Ej: 5CD1234567"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Año de Fabricación
                </label>
                <input
                  v-model="form.anioFabricacion"
                  type="number"
                  min="1900"
                  :max="new Date().getFullYear()"
                  placeholder="Ej: 2021"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <!-- Información Financiera -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Financiera
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor de Adquisición *
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    v-model="form.valorAdquisicion"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.valorAdquisicion }"
                  />
                </div>
                <p v-if="errors.valorAdquisicion" class="mt-1 text-sm text-red-600">
                  {{ errors.valorAdquisicion }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código SENESCYT
                </label>
                <input
                  v-model="form.codigo_senescyt"
                  type="text"
                  placeholder="Código SENESCYT del bien"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Código asignado por SENESCYT (opcional)
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vida Útil (años) *
                </label>
                <input
                  v-model="form.vida_util"
                  type="number"
                  min="1"
                  max="50"
                  required
                  placeholder="5"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.vida_util }"
                />
                <p v-if="errors.vida_util" class="mt-1 text-sm text-red-600">
                  {{ errors.vida_util }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor Residual
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    v-model="form.valor_residual"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Valor estimado al final de la vida útil
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Depreciación Acumulada
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    v-model="depreciacionCalculada"
                    type="number"
                    step="0.01"
                    readonly
                    placeholder="0.00"
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Calculado automáticamente: {{ porcentajeDepreciacion }}% depreciado
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Adquisición *
                </label>
                <input
                  v-model="form.fechaAdquisicion"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.fechaAdquisicion }"
                />
                <p v-if="errors.fechaAdquisicion" class="mt-1 text-sm text-red-600">
                  {{ errors.fechaAdquisicion }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proveedor
                </label>
                <input
                  v-model="form.proveedor"
                  type="text"
                  placeholder="Ej: Tecnología Avanzada S.A."
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <!-- Información Adicional -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Adicional
            </h2>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  v-model="form.descripcion"
                  rows="3"
                  placeholder="Descripción detallada del bien..."
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  v-model="form.observaciones"
                  rows="2"
                  placeholder="Observaciones adicionales..."
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Información de Documentación -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Documentación y Actas
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nro. Acta Entrega-Recepción
                </label>
                <input
                  v-model="form.nro_acta_entrega_recepcion"
                  type="text"
                  placeholder="Número del acta de entrega-recepción"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nro. Acta Constatación Física
                </label>
                <input
                  v-model="form.nro_acta_constatacion_fisica"
                  type="text"
                  placeholder="Número del acta de constatación física"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <!-- Información Física -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Características Físicas
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <input
                  v-model="form.color"
                  type="text"
                  placeholder="Color del bien"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Material
                </label>
                <input
                  v-model="form.material"
                  type="text"
                  placeholder="Material de construcción"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período Académico
                </label>
                <input
                  v-model="form.periodo_id"
                  type="text"
                  list="periodos-list"
                  placeholder="Ingresa o selecciona el período académico"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <datalist id="periodos-list">
                  <option value="2024-1"></option>
                  <option value="2024-2"></option>
                  <option value="2025-1"></option>
                  <option value="2025-2"></option>
                  <option
                    v-for="periodo in periodos"
                    :key="periodo.id"
                    :value="periodo.nombre"
                  ></option>
                </datalist>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Período académico de registro del bien
                </p>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div
            class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              type="button"
              @click="goBack"
              class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="!isFormValid"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {{ isEditing ? 'Actualizar Bien' : 'Guardar Bien' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirmar Acción</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          ¿Estás seguro de que quieres {{ isEditing ? 'actualizar' : 'guardar' }} este bien?
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="showConfirmModal = false"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          >
            Cancelar
          </button>
          <button
            @click="confirmSave"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

export default {
  name: 'BienForm',
  setup() {
    // Stores
    const authStore = useAuthStore()
    const toast = useToast()

    // Control de acceso por rol
    const isAdmin = computed(() => authStore.hasRole('Administrador'))

    // Estado del formulario
    const isEditing = ref(false)
    const showConfirmModal = ref(false)
    const form = ref({
      id: null,
      codigo: '',
      nombre: '',
      categoria: '',
      estado: '',
      ubicacion: '',
      responsable: '',
      marca: '',
      codigo_senescyt: '',
      vida_util: 5,
      valor_residual: 0,
      nro_acta_entrega_recepcion: '',
      nro_acta_constatacion_fisica: '',
      color: '',
      material: '',
      periodo_id: '',
      modelo: '',
      serie: '',
      anioFabricacion: '',
      valorAdquisicion: '',
      valorActual: '',
      fechaAdquisicion: '',
      proveedor: '',
      descripcion: '',
      observaciones: '',
      frecuenciaMantenimiento: '',
      ultimoMantenimiento: '',
    })

    const errors = ref({})

    // Períodos académicos dinámicos
    const periodos = ref([])

    // Datos reales de usuarios
    const usuarios = ref([])

    // Datos reales de categorías y ubicaciones
    const categorias = ref([])
    const ubicaciones = ref([])

    // Cálculo de depreciación
    const depreciacionCalculada = computed(() => {
      if (!form.value.valorAdquisicion || !form.value.vida_util || !form.value.fechaAdquisicion) {
        return 0
      }

      const valorAdquisicion = parseFloat(form.value.valorAdquisicion)
      const vidaUtil = parseInt(form.value.vida_util)
      const valorResidual = parseFloat(form.value.valor_residual) || 0
      const fechaAdquisicion = new Date(form.value.fechaAdquisicion)
      const fechaActual = new Date()

      // Calcular años transcurridos
      const tiempoTranscurrido = (fechaActual - fechaAdquisicion) / (1000 * 60 * 60 * 24 * 365.25)
      const añosTranscurridos = Math.max(0, tiempoTranscurrido)

      // Depreciación lineal
      const depreciacionAnual = (valorAdquisicion - valorResidual) / vidaUtil
      const depreciacionAcumulada = Math.min(
        depreciacionAnual * añosTranscurridos,
        valorAdquisicion - valorResidual
      )

      return depreciacionAcumulada.toFixed(2)
    })

    const porcentajeDepreciacion = computed(() => {
      if (!form.value.valorAdquisicion || form.value.valorAdquisicion == 0) {
        return 0
      }
      const porcentaje = (depreciacionCalculada.value / form.value.valorAdquisicion) * 100
      return Math.min(100, porcentaje).toFixed(1)
    })

    // Validación del formulario
    const isFormValid = computed(() => {
      return (
        form.value.codigo &&
        form.value.nombre &&
        form.value.categoria &&
        form.value.estado &&
        form.value.ubicacion &&
        form.value.responsable &&
        form.value.valorAdquisicion &&
        form.value.vida_util &&
        form.value.fechaAdquisicion
      )
    })

    // Validaciones específicas
    const validateForm = () => {
      errors.value = {}

      if (!form.value.codigo) {
        errors.value.codigo = 'El código es requerido'
      }

      if (!form.value.nombre) {
        errors.value.nombre = 'El nombre es requerido'
      }

      if (!form.value.categoria) {
        errors.value.categoria = 'La categoría es requerida'
      }

      if (!form.value.estado) {
        errors.value.estado = 'El estado es requerido'
      }

      if (!form.value.ubicacion) {
        errors.value.ubicacion = 'La ubicación es requerida'
      }

      if (!form.value.responsable) {
        errors.value.responsable = 'El responsable es requerido'
      }

      if (!form.value.valorAdquisicion || form.value.valorAdquisicion <= 0) {
        errors.value.valorAdquisicion = 'El valor de adquisición debe ser mayor a 0'
      }

      if (!form.value.fechaAdquisicion) {
        errors.value.fechaAdquisicion = 'La fecha de adquisición es requerida'
      }

      if (!form.value.vida_util || form.value.vida_util <= 0) {
        errors.value.vida_util = 'La vida útil debe ser mayor a 0'
      }

      return Object.keys(errors.value).length === 0
    }

    // Acciones
    const goBack = () => {
      window.history.back()
    }

    const saveBien = () => {
      if (validateForm()) {
        showConfirmModal.value = true
      }
    }

    const confirmSave = async () => {
      showConfirmModal.value = false

      try {
        const method = isEditing.value ? 'PUT' : 'POST'
        const endpoint = isEditing.value ? `/api/bienes/${form.value.id}` : '/api/bienes'

        const response = await fetch(endpoint, {
          method,
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            codigo_institucional: form.value.codigo,
            nombre: form.value.nombre,
            descripcion: form.value.descripcion,
            marca: form.value.marca,
            modelo: form.value.modelo,
            serie: form.value.serie,
            estado: form.value.estado.toUpperCase(),
            valor: parseFloat(form.value.valorAdquisicion),
            fecha_adquisicion: form.value.fechaAdquisicion,
            vida_util: parseInt(form.value.vida_util),
            valor_residual: parseFloat(form.value.valor_residual) || 0,
            categoria_id: parseInt(form.value.categoria),
            ubicacion_id: parseInt(form.value.ubicacion),
            responsable_id: parseInt(form.value.responsable),
            periodo_id: form.value.periodo_id ? parseInt(form.value.periodo_id) : null,
            observaciones: form.value.observaciones,
            codigo_senescyt: form.value.codigo_senescyt,
            nro_acta_entrega_recepcion: form.value.nro_acta_entrega_recepcion,
            nro_acta_constatacion_fisica: form.value.nro_acta_constatacion_fisica,
            color: form.value.color,
            material: form.value.material,
          }),
        })

        if (!response.ok) throw new Error('Error al guardar bien')

        const data = await response.json()
        if (data.success) {
          const mensaje = isEditing.value
            ? 'Bien actualizado correctamente'
            : 'Bien guardado correctamente'
          toast.success(mensaje)
          goBack()
        } else {
          throw new Error(data.message || 'Error al guardar bien')
        }
      } catch (error) {
        console.error('Error saving bien:', error)
        toast.error('Error al guardar el bien')
      }
    }

    // Control de acceso por rol al cargar
    onMounted(async () => {
      if (!isAdmin.value) {
        toast.error('Acceso denegado: solo administradores pueden crear/editar bienes')
        goBack()
        return
      }

      // Cargar datos iniciales
      await Promise.all([loadUsuarios(), loadPeriodos(), loadCategorias(), loadUbicaciones()])

      // Verificar si estamos editando
      const urlParams = new URLSearchParams(window.location.search)
      const bienId = urlParams.get('id')
      if (bienId) {
        isEditing.value = true
        await loadBienData(bienId)
      }
    })

    const loadBienData = async (id) => {
      try {
        const response = await fetch(`/api/bienes/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) throw new Error('Error al cargar bien')

        const data = await response.json()
        if (data.success) {
          const bien = data.data
          form.value = {
            id: bien.id_bien,
            codigo: bien.codigo_institucional,
            nombre: bien.nombre,
            categoria: bien.categoria_id?.toString() || '',
            estado: bien.estado?.toLowerCase() || 'activo',
            ubicacion: bien.ubicacion_id?.toString() || '',
            responsable: bien.responsable_id?.toString() || '',
            marca: bien.marca || '',
            modelo: bien.modelo || '',
            serie: bien.serie || '',
            anioFabricacion: bien.fecha_adquisicion ? new Date(bien.fecha_adquisicion).getFullYear().toString() : '',
            valorAdquisicion: bien.valor?.toString() || '',
            fechaAdquisicion: bien.fecha_adquisicion || '',
            proveedor: bien.proveedor || '',
            descripcion: bien.descripcion || '',
            observaciones: bien.observaciones || '',
            codigo_senescyt: bien.codigo_senescyt || '',
            vida_util: bien.vida_util || 5,
            valor_residual: bien.valor_residual || 0,
            nro_acta_entrega_recepcion: bien.nro_acta_entrega_recepcion || '',
            nro_acta_constatacion_fisica: bien.nro_acta_constatacion_fisica || '',
            color: bien.color || '',
            material: bien.material || '',
            periodo_id: bien.periodo_id?.toString() || '',
          }
        } else {
          throw new Error(data.message || 'Error al cargar bien')
        }
      } catch (error) {
        console.error('Error loading bien:', error)
        toast.error('Error al cargar los datos del bien')
      }
    }

    const loadUsuarios = async () => {
      try {
        const response = await fetch('/api/usuarios', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) throw new Error('Error al cargar usuarios')

        const data = await response.json()
        if (data.success) {
          usuarios.value = data.data || []
        } else {
          throw new Error(data.message || 'Error al cargar usuarios')
        }
      } catch (error) {
        console.error('Error loading usuarios:', error)
        usuarios.value = []
        toast.error('Error al cargar usuarios')
      }
    }

    const loadPeriodos = async () => {
      try {
        const response = await fetch('/api/periodos-academicos', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) throw new Error('Error al cargar períodos')

        const data = await response.json()
        if (data.success) {
          periodos.value = data.data || []
        } else {
          throw new Error(data.message || 'Error al cargar períodos')
        }
      } catch (error) {
        console.error('Error loading periodos:', error)
        periodos.value = []
        // No mostrar error si no hay periodos, es opcional
      }
    }

    const loadCategorias = async () => {
      try {
        const response = await fetch('/api/categorias', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) throw new Error('Error al cargar categorías')

        const data = await response.json()
        if (data.success) {
          categorias.value = data.data || []
        }
      } catch (error) {
        console.error('Error loading categorias:', error)
        categorias.value = []
      }
    }

    const loadUbicaciones = async () => {
      try {
        const response = await fetch('/api/ubicaciones', {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) throw new Error('Error al cargar ubicaciones')

        const data = await response.json()
        if (data.success) {
          ubicaciones.value = data.data || []
        }
      } catch (error) {
        console.error('Error loading ubicaciones:', error)
        ubicaciones.value = []
      }
    }

    return {
      isAdmin,
      isEditing,
      showConfirmModal,
      form,
      errors,
      usuarios,
      periodos,
      categorias,
      ubicaciones,
      depreciacionCalculada,
      porcentajeDepreciacion,
      isFormValid,
      validateForm,
      goBack,
      saveBien,
      confirmSave,
    }
  },
}
</script>
