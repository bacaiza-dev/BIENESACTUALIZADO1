<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Gestión de Mantenimientos
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Programa y controla los mantenimientos de bienes institucionales
          </p>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ mantenimientos.length }} mantenimientos registrados</span>
            <span>•</span>
            <span>{{ mantenimientosPendientes.length }} pendientes</span>
            <span>•</span>
            <span>{{ mantenimientosVencidos.length }} vencidos</span>
          </div>
        </div>
        <div
          class="mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button @click="exportarDatos"
            class="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <i class="bx bx-download text-lg"></i>
            <span class="hidden sm:inline">Exportar</span>
          </button>
          <button v-if="canCreateMaintenance" @click="mostrarModalCrear = true"
            class="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <i class="bx bx-plus-circle text-lg"></i>
            <span>Programar Mantenimiento</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros y estadísticas rápidas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-calendar text-blue-600 dark:text-blue-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Programados</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ mantenimientosProgramados.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-time text-yellow-600 dark:text-yellow-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pendientes</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ mantenimientosPendientes.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-check text-green-600 dark:text-green-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Completados</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ mantenimientosCompletados.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <i class="bx bx-error text-red-600 dark:text-red-400"></i>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Vencidos</p>
            <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ mantenimientosVencidos.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable title="Lista de Mantenimientos" :data="mantenimientosFiltrados" :columns="columns" :loading="cargando"
      :search-term="filtros.busqueda" :page-size="filtros.limite" :selectable="canEditMaintenance" :has-actions="true"
      empty-message="No hay mantenimientos registrados"
      search-placeholder="Buscar por bien, tipo de mantenimiento, responsable..."
      @update:search-term="filtros.busqueda = $event" @update:page-size="filtros.limite = $event"
      @edit="editarMantenimiento" @view="verMantenimiento" @delete="eliminarMantenimiento">
      <template #header-actions>
        <div class="flex items-center space-x-2">
          <select v-model="filtros.estado"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="">Todos los estados</option>
            <option value="programado">Programado</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
            <option value="vencido">Vencido</option>
          </select>
          <select v-model="filtros.tipo"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
            <option value="">Todos los tipos</option>
            <option value="preventivo">Preventivo</option>
            <option value="correctivo">Correctivo</option>
            <option value="predictivo">Predictivo</option>
            <option value="revision">Revisión</option>
          </select>
          <button @click="limpiarFiltros"
            class="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
            <i class="bx bx-refresh text-sm"></i>
            <span>Limpiar</span>
          </button>
        </div>
      </template>

      <template #cell-bien="{ value }">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <i class="bx bx-laptop text-primary-600 dark:text-primary-400 text-sm"></i>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">{{ value?.nombre || 'N/A' }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ value?.codigo || 'N/A' }}</p>
          </div>
        </div>
      </template>

      <template #cell-tipo="{ value }">
        <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getTipoClass(value)">
          {{ getTipoLabel(value) }}
        </span>
      </template>

      <template #cell-estado="{ value }">
        <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getEstadoClass(value)">
          {{ getEstadoLabel(value) }}
        </span>
      </template>

      <template #cell-fecha_programada="{ value }">
        <span class="text-sm text-gray-900 dark:text-white">
          {{ formatDate(value) }}
        </span>
      </template>

      <template #cell-fecha_limite="{ value }">
        <span class="text-sm"
          :class="isVencido(value) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-900 dark:text-white'">
          {{ formatDate(value) }}
          <i v-if="isVencido(value)" class="bx bx-time text-red-500 ml-1"></i>
        </span>
      </template>

      <template #cell-costo="{ value }">
        <span class="font-medium text-green-600 dark:text-green-400">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center space-x-2">
          <button @click="verMantenimiento(item)"
            class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
            title="Ver detalles">
            <i class="bx bx-show text-lg"></i>
          </button>
          <button v-if="canEditMaintenance" @click="editarMantenimiento(item)"
            class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
            title="Editar">
            <i class="bx bx-edit text-lg"></i>
          </button>
          <button v-if="canCompleteMaintenance && item.estado === 'programado'" @click="completarMantenimiento(item)"
            class="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors"
            title="Marcar como completado">
            <i class="bx bx-check text-lg"></i>
          </button>
          <button v-if="canDeleteMaintenance" @click="eliminarMantenimiento(item)"
            class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            title="Eliminar">
            <i class="bx bx-trash text-lg"></i>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Modal de Crear/Editar Mantenimiento -->
    <BaseModal :show="mostrarModalCrear || mostrarModalEditar"
      :title="mantenimientoActual ? 'Editar Mantenimiento' : 'Programar Mantenimiento'" size="large"
      @close="cerrarModal">
      <form @submit.prevent="guardarMantenimiento" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bien *
            </label>
            <select v-model="formulario.bien_id" required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
              <option value="">Selecciona un bien</option>
              <option v-for="bien in bienes" :key="bien.id" :value="bien.id">
                {{ bien.nombre }} ({{ bien.codigo }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Mantenimiento *
            </label>
            <select v-model="formulario.tipo" required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
              <option value="">Selecciona el tipo</option>
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
              <option value="predictivo">Predictivo</option>
              <option value="revision">Revisión</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción *
          </label>
          <textarea v-model="formulario.descripcion" required rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe las actividades de mantenimiento a realizar"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha Programada *
            </label>
            <input v-model="formulario.fecha_programada" type="date" required
              :min="new Date().toISOString().split('T')[0]"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha Límite *
            </label>
            <input v-model="formulario.fecha_limite" type="date" required
              :min="formulario.fecha_programada || new Date().toISOString().split('T')[0]"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Responsable *
            </label>
            <select v-model="formulario.responsable_id" required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
              <option value="">Selecciona el responsable</option>
              <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
                {{ usuario.nombre }} {{ usuario.apellido }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Costo Estimado
            </label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-gray-500">$</span>
              <input v-model.number="formulario.costo_estimado" type="number" step="0.01" min="0" placeholder="0.00"
                class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridad
            </label>
            <select v-model="formulario.prioridad"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones
            </label>
            <textarea v-model="formulario.observaciones" rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Observaciones adicionales"></textarea>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <BaseButton type="button" variant="secondary" @click="cerrarModal">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="guardando">
            {{ guardando ? 'Guardando...' : (mantenimientoActual ? 'Actualizar' : 'Guardar') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Modal de Detalle -->
    <BaseModal :show="mostrarModalDetalle" title="Detalle del Mantenimiento" size="large" @close="cerrarModalDetalle">
      <div v-if="mantenimientoDetalle" class="space-y-4">
        <!-- Bien -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Bien</h3>
          <p class="text-lg font-medium text-gray-900 dark:text-white">
            {{ mantenimientoDetalle.bien?.nombre || 'N/A' }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Código: {{ mantenimientoDetalle.bien?.codigo || 'N/A' }}
          </p>
        </div>

        <!-- Tipo y Estado -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Tipo</h3>
            <span class="px-3 py-1 text-sm font-semibold rounded-full" :class="getTipoClass(mantenimientoDetalle.tipo)">
              {{ getTipoLabel(mantenimientoDetalle.tipo) }}
            </span>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Estado</h3>
            <span class="px-3 py-1 text-sm font-semibold rounded-full"
              :class="getEstadoClass(mantenimientoDetalle.estado)">
              {{ getEstadoLabel(mantenimientoDetalle.estado) }}
            </span>
          </div>
        </div>

        <!-- Descripción -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Descripción</h3>
          <p class="text-gray-900 dark:text-white">{{ mantenimientoDetalle.descripcion }}</p>
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Fecha Programada</h3>
            <p class="text-gray-900 dark:text-white">{{ formatDate(mantenimientoDetalle.fecha_programada) }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Fecha Límite</h3>
            <p :class="isVencido(mantenimientoDetalle.fecha_limite) ? 'text-red-600' : 'text-gray-900 dark:text-white'">
              {{ formatDate(mantenimientoDetalle.fecha_limite) }}
            </p>
          </div>
        </div>

        <!-- Responsable y Costo -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Responsable</h3>
            <p class="text-gray-900 dark:text-white">
              {{ mantenimientoDetalle.responsable?.nombre }} {{ mantenimientoDetalle.responsable?.apellido }}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Costo Estimado</h3>
            <p class="text-green-600 font-semibold">{{ formatCurrency(mantenimientoDetalle.costo_estimado) }}</p>
          </div>
        </div>

        <!-- Prioridad y Observaciones -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Prioridad</h3>
            <p class="text-gray-900 dark:text-white capitalize">{{ mantenimientoDetalle.prioridad }}</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Observaciones</h3>
            <p class="text-gray-900 dark:text-white">{{ mantenimientoDetalle.observaciones || 'Sin observaciones' }}</p>
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <BaseButton variant="secondary" @click="cerrarModalDetalle">
            Cerrar
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useAuth } from '@/composables/useAuth'
import DataTable from '@/components/shared/DataTable.vue'
import BaseModal from '@/components/shared/BaseModal.vue'
import BaseButton from '@/components/shared/BaseButton.vue'
import apiClient from '@/api/client'
import type { DataTableColumn, Asset, User } from '@/types'

interface Mantenimiento {
  id: number
  bien_id: number
  bien?: Asset
  tipo: 'preventivo' | 'correctivo' | 'predictivo' | 'revision'
  descripcion: string
  estado: 'programado' | 'en_progreso' | 'completado' | 'cancelado' | 'vencido'
  fecha_programada: string
  fecha_limite: string
  fecha_completado?: string
  responsable_id: number
  responsable?: User
  costo_estimado: number
  costo_real?: number
  prioridad: 'baja' | 'media' | 'alta' | 'critica'
  observaciones?: string
  created_at: string
  updated_at: string
}

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { canCreateMaintenance, canEditMaintenance, canDeleteMaintenance, canCompleteMaintenance } = useAuth()

// Estado del componente
const cargando = ref(false)
const guardando = ref(false)
const mostrarModalCrear = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalDetalle = ref(false)
const mantenimientoActual = ref<Mantenimiento | null>(null)
const mantenimientoDetalle = ref<Mantenimiento | null>(null)

// Filtros
const filtros = reactive({
  busqueda: '',
  estado: '',
  tipo: '',
  limite: 10,
})

// Formulario
const formulario = reactive({
  bien_id: '',
  tipo: '',
  descripcion: '',
  fecha_programada: '',
  fecha_limite: '',
  responsable_id: '',
  costo_estimado: 0,
  prioridad: 'media',
  observaciones: '',
})

// Datos
const mantenimientos = ref<Mantenimiento[]>([])
const bienes = ref<Asset[]>([])
const usuarios = ref<User[]>([])

// Computadas
const mantenimientosProgramados = computed(() =>
  mantenimientos.value.filter((m: Mantenimiento) => m.estado === 'programado')
)

const mantenimientosPendientes = computed(() =>
  mantenimientos.value.filter((m: Mantenimiento) => ['programado', 'en_progreso'].includes(m.estado))
)

const mantenimientosCompletados = computed(() =>
  mantenimientos.value.filter((m: Mantenimiento) => m.estado === 'completado')
)

const mantenimientosVencidos = computed(() =>
  mantenimientos.value.filter((m: Mantenimiento) => {
    const fechaLimite = new Date(m.fecha_limite)
    const hoy = new Date()
    return fechaLimite < hoy && m.estado !== 'completado'
  })
)

const mantenimientosFiltrados = computed(() => {
  let resultado = [...mantenimientos.value]

  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.toLowerCase()
    resultado = resultado.filter((m: Mantenimiento) =>
      m.bien?.nombre?.toLowerCase().includes(busqueda) ||
      m.bien?.codigo?.toLowerCase().includes(busqueda) ||
      m.descripcion.toLowerCase().includes(busqueda) ||
      m.responsable?.nombre?.toLowerCase().includes(busqueda)
    )
  }

  if (filtros.estado) {
    resultado = resultado.filter((m: Mantenimiento) => m.estado === filtros.estado)
  }

  if (filtros.tipo) {
    resultado = resultado.filter((m: Mantenimiento) => m.tipo === filtros.tipo)
  }

  return resultado
})

// Columnas de la tabla
const columns: DataTableColumn[] = [
  { key: 'bien.codigo', label: 'Bien', sortable: true },
  { key: 'tipo', label: 'Tipo', sortable: true },
  { key: 'descripcion', label: 'Descripción', sortable: false },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'fecha_programada', label: 'Fecha Programada', sortable: true },
  { key: 'fecha_limite', label: 'Fecha Límite', sortable: true },
  { key: 'responsable.nombre', label: 'Responsable', sortable: true },
  { key: 'costo_estimado', label: 'Costo', sortable: true },
  { key: 'prioridad', label: 'Prioridad', sortable: true },
]

// Métodos
// Métodos
const cargarMantenimientos = async () => {
  cargando.value = true
  try {
    const response = await apiClient.get('/mantenimientos')

    const data = response
    if (data.success) {
      mantenimientos.value = data.data || []
    }
  } catch (error) {
    console.error('Error loading mantenimientos:', error)
    toast.error('Error al cargar los mantenimientos')
    mantenimientos.value = []
  } finally {
    cargando.value = false
  }
}

const cargarBienes = async () => {
  try {
    const response = await apiClient.get('/bienes')

    const data = response
    if (data.success) {
      bienes.value = data.data || []
    }
  } catch (error) {
    console.error('Error loading bienes:', error)
    bienes.value = []
  }
}

const cargarUsuarios = async () => {
  try {
    const response = await apiClient.get('/usuarios')

    const data = response
    if (data.success) {
      usuarios.value = data.data || []
    }
  } catch (error) {
    console.error('Error loading usuarios:', error)
    usuarios.value = []
  }
}

const verMantenimiento = (mantenimiento: Mantenimiento) => {
  mantenimientoDetalle.value = mantenimiento
  mostrarModalDetalle.value = true
}

const cerrarModalDetalle = () => {
  mostrarModalDetalle.value = false
  mantenimientoDetalle.value = null
}

const editarMantenimiento = (mantenimiento: Mantenimiento) => {
  mantenimientoActual.value = mantenimiento
  Object.assign(formulario, {
    bien_id: mantenimiento.bien_id.toString(),
    tipo: mantenimiento.tipo,
    descripcion: mantenimiento.descripcion,
    fecha_programada: mantenimiento.fecha_programada.split('T')[0],
    fecha_limite: mantenimiento.fecha_limite.split('T')[0],
    responsable_id: mantenimiento.responsable_id.toString(),
    costo_estimado: mantenimiento.costo_estimado,
    prioridad: mantenimiento.prioridad,
    observaciones: mantenimiento.observaciones || '',
  })
  mostrarModalEditar.value = true
}

const completarMantenimiento = async (mantenimiento: Mantenimiento) => {
  if (confirm(`¿Marcar como completado el mantenimiento "${mantenimiento.descripcion}"?`)) {
    try {
      const response = await apiClient.patch(`/mantenimientos/${mantenimiento.id}/completar`, {
        fecha_completado: new Date().toISOString(),
        estado: 'completado'
      })

      const data = response
      if (data.success) {
        await cargarMantenimientos()
        toast.success('Mantenimiento marcado como completado')
      }
    } catch (error) {
      console.error('Error completing mantenimiento:', error)
      toast.error('Error al completar el mantenimiento')
    }
  }
}

const eliminarMantenimiento = async (mantenimiento: Mantenimiento) => {
  if (confirm(`¿Estás seguro de eliminar el mantenimiento "${mantenimiento.descripcion}"?`)) {
    try {
      const response = await apiClient.delete(`/mantenimientos/${mantenimiento.id}`)

      const data = response
      if (data.success) {
        const index = mantenimientos.value.findIndex((m: Mantenimiento) => m.id === mantenimiento.id)
        if (index > -1) {
          mantenimientos.value.splice(index, 1)
        }
        toast.success('Mantenimiento eliminado correctamente')
      }
    } catch (error) {
      console.error('Error deleting mantenimiento:', error)
      toast.error('Error al eliminar el mantenimiento')
    }
  }
}

const guardarMantenimiento = async () => {
  guardando.value = true
  try {
    const endpoint = mantenimientoActual.value
      ? `/mantenimientos/${mantenimientoActual.value.id}`
      : '/mantenimientos'

    const payload = {
      ...formulario,
      bien_id: parseInt(formulario.bien_id),
      responsable_id: parseInt(formulario.responsable_id),
    }

    let response;
    if (mantenimientoActual.value) {
      response = await apiClient.put(endpoint, payload)
    } else {
      response = await apiClient.post(endpoint, payload)
    }

    const data = response
    if (data.success) {
      await cargarMantenimientos()
      toast.success(mantenimientoActual.value
        ? 'Mantenimiento actualizado correctamente'
        : 'Mantenimiento programado correctamente'
      )
      cerrarModal()
    }
  } catch (error) {
    console.error('Error saving mantenimiento:', error)
    toast.error('Error al guardar el mantenimiento')
  } finally {
    guardando.value = false
  }
}

const cerrarModal = () => {
  mostrarModalCrear.value = false
  mostrarModalEditar.value = false
  mantenimientoActual.value = null
  Object.assign(formulario, {
    bien_id: '',
    tipo: '',
    descripcion: '',
    fecha_programada: '',
    fecha_limite: '',
    responsable_id: '',
    costo_estimado: 0,
    prioridad: 'media',
    observaciones: '',
  })
}

const limpiarFiltros = () => {
  Object.assign(filtros, {
    busqueda: '',
    estado: '',
    tipo: '',
    limite: 10,
  })
}

const exportarDatos = async () => {
  try {
    toast.info('Exportando datos...')
    const response = await apiClient.get('/mantenimientos/export', { responseType: 'blob' })

    // response IS the blob because responseType is blob
    const blob = response as any
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mantenimientos_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success('Datos exportados correctamente')
  } catch (error) {
    console.error('Error exporting mantenimientos:', error)
    toast.error('Error al exportar los datos')
  }
}

// Helpers
const getTipoClass = (tipo: string) => {
  const classes = {
    preventivo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    correctivo: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    predictivo: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    revision: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  }
  return classes[tipo as keyof typeof classes] || classes.revision
}

const getTipoLabel = (tipo: string) => {
  const labels = {
    preventivo: 'Preventivo',
    correctivo: 'Correctivo',
    predictivo: 'Predictivo',
    revision: 'Revisión',
  }
  return labels[tipo as keyof typeof labels] || tipo
}

const getEstadoClass = (estado: string) => {
  const classes = {
    programado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    en_progreso: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelado: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    vencido: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return classes[estado as keyof typeof classes] || classes.programado
}

const getEstadoLabel = (estado: string) => {
  const labels = {
    programado: 'Programado',
    en_progreso: 'En Progreso',
    completado: 'Completado',
    cancelado: 'Cancelado',
    vencido: 'Vencido',
  }
  return labels[estado as keyof typeof labels] || estado
}

const formatDate = (fecha: string) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES')
}

const formatCurrency = (value: number) => {
  if (!value) return '$0.00'
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

const isVencido = (fechaLimite: string) => {
  if (!fechaLimite) return false
  const fecha = new Date(fechaLimite)
  const hoy = new Date()
  return fecha < hoy
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    cargarMantenimientos(),
    cargarBienes(),
    cargarUsuarios()
  ])
})
</script>
