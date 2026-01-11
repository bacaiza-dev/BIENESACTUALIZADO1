<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent"
          >
            Gestión de Bienes
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Administra todos los bienes institucionales con filtros avanzados y acciones rápidas
          </p>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ bienes.length }} bienes totales</span>
            <span>•</span>
            <span>{{ bienesActivos.length }} activos</span>
          </div>
        </div>
        <div class="mt-4 sm:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            @click="exportarDatos"
            class="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            title="Exportar datos a Excel"
          >
            <i class="bx bx-download text-lg"></i>
            <span class="hidden sm:inline">Exportar</span>
          </button>
          <button
            v-if="canCreateAsset"
            @click="mostrarModalCrear = true"
            class="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            title="Crear nuevo bien institucional"
          >
            <i class="bx bx-plus-circle text-lg"></i>
            <span>Nuevo Bien</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Filters Panel -->
    <div
      v-if="mostrarFiltrosMobile"
      class="lg:hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4"
    >
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
        <button
          @click="mostrarFiltrosMobile = false"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <i class="bx bx-x text-xl"></i>
        </button>
      </div>
      
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
          <select
            v-model="filtros.categoria"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas las categorías</option>
            <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
              {{ categoria.nombre }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
          <select
            v-model="filtros.estado"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="baja">De baja</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
          <select
            v-model="filtros.ubicacion"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas las ubicaciones</option>
            <option v-for="ubicacion in ubicaciones" :key="ubicacion.id" :value="ubicacion.id">
              {{ ubicacion.nombre }}
            </option>
          </select>
        </div>
        
        <div class="flex space-x-2">
          <button
            @click="limpiarFiltros"
            class="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Limpiar
          </button>
          <button
            @click="mostrarFiltrosMobile = false"
            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>

    <!-- DataTable -->
    <DataTable
      title="Lista de Bienes"
      :data="bienes"
      :columns="columns"
      :loading="cargando"
      :search-term="filtros.busqueda"
      :page-size="filtros.limite"
      :show-q-r="true"
      :selectable="canEditAsset"
      :has-actions="true"
      empty-message="No hay bienes registrados"
      search-placeholder="Buscar por código, nombre, responsable..."
      @update:search-term="filtros.busqueda = $event"
      @update:page-size="filtros.limite = $event"
      @edit="editarBien"
      @view="verBien"
      @delete="eliminarBien"
      @selection-change="bienesSeleccionados = $event"
    >
      <template #header-actions>
        <!-- Desktop filters -->
        <div class="hidden lg:flex items-center space-x-2">
          <select
            v-model="filtros.categoria"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas las categorías</option>
            <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
              {{ categoria.nombre }}
            </option>
          </select>
          <select
            v-model="filtros.estado"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="baja">De baja</option>
          </select>
          <select
            v-model="filtros.ubicacion"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas las ubicaciones</option>
            <option v-for="ubicacion in ubicaciones" :key="ubicacion.id" :value="ubicacion.id">
              {{ ubicacion.nombre }}
            </option>
          </select>
          <button
            @click="limpiarFiltros"
            class="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            title="Limpiar todos los filtros"
          >
            <i class="bx bx-refresh text-sm"></i>
            <span>Limpiar</span>
          </button>
        </div>
        
        <!-- Mobile filters button -->
        <div class="lg:hidden">
          <button
            @click="mostrarFiltrosMobile = !mostrarFiltrosMobile"
            class="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            :title="mostrarFiltrosMobile ? 'Ocultar filtros' : 'Mostrar filtros'"
          >
            <i :class="mostrarFiltrosMobile ? 'bx bx-filter-alt' : 'bx bx-filter'" class="text-lg"></i>
            <span>Filtros</span>
          </button>
        </div>
      </template>

      <template #cell-codigo_institucional="{ value }">
        <span class="font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-2 py-1 rounded">
          {{ value }}
        </span>
      </template>


      <template #cell-estado="{ value }">
        <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getEstadoClass(value)">
          {{ value }}
        </span>
      </template>

      <template #cell-valor_adquisicion="{ value }">
        <span class="font-medium text-green-600 dark:text-green-400">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <template #cell-responsable_completo="{ value }">
        <div class="flex items-center space-x-2">
          <div
            class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center"
          >
            <i class="bx bx-user text-primary-600 dark:text-primary-400"></i>
          </div>
          <span class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ value || 'Sin asignar' }}</span>
        </div>
      </template>

      <template #actions="{ item }">
        <div class="flex items-center space-x-2">
          <button
            @click="verBien(item)"
            class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <i class="bx bx-show text-lg"></i>
          </button>
          <button
            v-if="canEditAsset"
            @click="editarBien(item)"
            class="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
            title="Editar"
          >
            <i class="bx bx-edit text-lg"></i>
          </button>
          <button
            v-if="canDeleteAsset"
            @click="eliminarBien(item)"
            class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
            title="Eliminar"
          >
            <i class="bx bx-trash text-lg"></i>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Modal de Crear/Editar Bien -->
    <div
      v-if="mostrarModalCrear || mostrarModalEditar"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ bienActual ? 'Editar Bien' : 'Nuevo Bien' }}
          </h2>
          <button
            @click="cerrarModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>

        <form @submit.prevent="guardarBien" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código Institucional
              </label>
              <input
                v-model="formulario.codigo_institucional"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código SENESCYT
              </label>
              <input
                v-model="formulario.codigo_senescyt"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Bien
            </label>
            <input
              v-model="formulario.nombre"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              v-model="formulario.descripcion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marca
              </label>
              <input
                v-model="formulario.marca"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modelo
              </label>
              <input
                v-model="formulario.modelo"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Serie
              </label>
              <input
                v-model="formulario.serie"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                v-model="formulario.categoria_id"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Selecciona una categoría</option>
                <option v-for="categoria in categorias" :key="categoria.id" :value="categoria.id">
                  {{ categoria.nombre }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ubicación
              </label>
              <select
                v-model="formulario.ubicacion_id"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Selecciona una ubicación</option>
                <option v-for="ubicacion in ubicaciones" :key="ubicacion.id" :value="ubicacion.id">
                  {{ ubicacion.nombre }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                v-model="formulario.estado"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="baja">De baja</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor de Adquisición
              </label>
              <input
                v-model.number="formulario.valor_adquisicion"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Adquisición
              </label>
              <input
                v-model="formulario.fecha_adquisicion"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <input
                v-model="formulario.color"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Material
              </label>
              <input
                v-model="formulario.material"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Responsable
              </label>
              <select
                v-model="formulario.responsable_id"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sin responsable</option>
                <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
                  {{ usuario.nombres }} {{ usuario.apellidos }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observaciones
            </label>
            <textarea
              v-model="formulario.observaciones"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Cualquier observación adicional sobre el bien..."
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="cerrarModal"
              class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="guardando"
              class="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
            >
              <i
                :class="guardando ? 'bx bx-loader-alt animate-spin' : 'bx bx-save'"
                class="text-lg"
              ></i>
              <span>{{ guardando ? 'Guardando...' : 'Guardar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de código QR -->
    <div
      v-if="mostrarModalQR"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cerrarModalQR"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
            Código QR del Bien
          </h2>
          <button
            @click="cerrarModalQR"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>

        <div v-if="qrActual" class="text-center space-y-4">
          <div class="bg-white p-4 rounded-lg border inline-block">
            <div id="qr-code" class="w-48 h-48 mx-auto"></div>
          </div>
          
          <div class="space-y-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Código: <span class="font-mono">{{ qrActual.codigo }}</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-500">
              URL: {{ qrActual.url }}
            </p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="descargarQR"
              class="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <i class="bx bx-download"></i>
              <span>Descargar</span>
            </button>
            <button
              @click="imprimirQR"
              class="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <i class="bx bx-printer"></i>
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { useAuth } from '@/composables/useAuth'
import DataTable from '@/components/shared/DataTable.vue'
import QRCode from 'qrcode'
import apiClient from '@/api/client'
import type { Asset, DataTableColumn, Category, Location, User } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()
const { canCreateAsset, canEditAsset, canDeleteAsset } = useAuth()

// Estado del componente
const cargando = ref(false)
const guardando = ref(false)
const mostrarModalCrear = ref(false)
const mostrarModalEditar = ref(false)
const mostrarFiltrosMobile = ref(false)
const bienActual = ref<Asset | null>(null)
const bienesSeleccionados = ref<(string | number)[]>([])
const mostrarModalQR = ref(false)
const qrActual = ref<{ codigo: string; url: string } | null>(null)

// Filtros
const filtros = reactive({
  busqueda: '',
  categoria: '',
  estado: '',
  ubicacion: '',
  limite: 10,
})

// Formulario
const formulario = reactive({
  codigo_institucional: '',
  codigo_senescyt: '',
  nombre: '',
  descripcion: '',
  marca: '',
  modelo: '',
  serie: '',
  categoria_id: '',
  ubicacion_id: '',
  estado: 'activo',
  valor_adquisicion: 0,
  fecha_adquisicion: new Date().toISOString().split('T')[0],
  color: '',
  material: '',
  observaciones: '',
  responsable_id: '',
})

// Datos de bienes
const bienes = ref<Asset[]>([])
const categorias = ref<Category[]>([])
const ubicaciones = ref<Location[]>([])
const usuarios = ref<User[]>([])

// Computadas
const bienesActivos = computed(() => bienes.value.filter(bien => bien.estado === 'activo'))

// Columnas de la tabla
const columns: DataTableColumn[] = [
  { key: 'codigo_institucional', label: 'Código Institucional', sortable: true },
  { key: 'codigo_senescyt', label: 'Código SENESCYT', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  { key: 'marca', label: 'Marca', sortable: true },
  { key: 'modelo', label: 'Modelo', sortable: true },
  { key: 'serie', label: 'Serie', sortable: true },
  { key: 'categoria.nombre', label: 'Categoría', sortable: true },
  { key: 'ubicacion.nombre', label: 'Ubicación', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'valor_adquisicion', label: 'Valor', sortable: true },
  { key: 'responsable_completo', label: 'Responsable', sortable: true },
  { key: 'fecha_adquisicion', label: 'Fecha Adquisición', sortable: true },
]

// Métodos
const cargarBienes = async () => {
  cargando.value = true
  try {
    const response = await apiClient.get('/bienes')
    if (response.success && response.data) {
      // Si la respuesta es paginada, usar response.data.data, sino usar response.data directamente
      const bienesData = Array.isArray(response.data) ? response.data : response.data.data || []
      
      // Agregar campos calculados para mejor búsqueda y visualización
      bienes.value = bienesData.map(bien => ({
        ...bien,
        responsable_completo: bien.responsable ? 
          `${bien.responsable.nombre || ''} ${bien.responsable.apellido || ''}`.trim() || 
          'Sin asignar' : 'Sin asignar',
        categoria: {
          ...bien.categoria,
          nombre: bien.categoria?.nombre || bien.categoria_nombre || 'Sin categoría'
        },
        ubicacion: {
          ...bien.ubicacion,
          nombre: bien.ubicacion?.nombre || bien.ubicacion_nombre || 'Sin ubicación'
        }
      }))
      
      toast.success('Bienes cargados correctamente')
    } else {
      throw new Error(response.message || 'Error al cargar bienes')
    }
  } catch (error) {
    console.error('Error loading bienes:', error)
    bienes.value = []
    toast.error('Error al cargar los bienes. Intente nuevamente.')
  } finally {
    cargando.value = false
  }
}

const verBien = (bien: Asset) => {
  router.push(`/bienes/${bien.id}`)
}

const editarBien = (bien: Asset) => {
  bienActual.value = bien
  Object.assign(formulario, {
    codigo_institucional: bien.codigo_institucional,
    codigo_senescyt: bien.codigo_senescyt,
    nombre: bien.nombre,
    descripcion: bien.descripcion,
    marca: bien.marca || '',
    modelo: bien.modelo || '',
    serie: bien.serie || '',
    categoria_id: bien.categoria_id.toString(),
    ubicacion_id: bien.ubicacion_id?.toString() || '',
    estado: bien.estado,
    valor_adquisicion: bien.valor_adquisicion,
    fecha_adquisicion: bien.fecha_adquisicion,
    color: bien.color || '',
    material: bien.material || '',
    observaciones: bien.observaciones || '',
    responsable_id: bien.responsable_id?.toString() || '',
  })
  mostrarModalEditar.value = true
}

const eliminarBien = async (bien: Asset) => {
  if (confirm(`¿Estás seguro de eliminar el bien "${bien.nombre}"?`)) {
    try {
      const response = await apiClient.delete(`/bienes/${bien.id}`)

      if (!response.success) throw new Error('Error al eliminar bien')

      if (response.success) {
        const index = bienes.value.findIndex(b => b.id === bien.id)
        if (index > -1) {
          bienes.value.splice(index, 1)
        }
        toast.success('Bien eliminado correctamente')
      } else {
        throw new Error(data.message || 'Error al eliminar bien')
      }
    } catch (error) {
      toast.error('Error al eliminar el bien')
    }
  }
}

const guardarBien = async () => {
  guardando.value = true
  try {
    const method = bienActual.value ? 'PUT' : 'POST'
    const endpoint = bienActual.value ? `/api/bienes/${bienActual.value.id}` : '/api/bienes'

    const response = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formulario,
        categoria_id: parseInt(formulario.categoria_id),
        ubicacion_id: formulario.ubicacion_id ? parseInt(formulario.ubicacion_id) : null,
        responsable_id: formulario.responsable_id ? parseInt(formulario.responsable_id) : null,
      }),
    })

    if (!response.ok) throw new Error('Error al guardar bien')

    const data = await response.json()
    if (data.success) {
      if (bienActual.value) {
        // Recargar datos para obtener información actualizada
        await cargarBienes()
        toast.success('Bien actualizado correctamente')
      } else {
        // Recargar datos para obtener el nuevo bien
        await cargarBienes()
        toast.success('Bien creado correctamente')
      }
      cerrarModal()
    } else {
      throw new Error(data.message || 'Error al guardar bien')
    }
  } catch (error) {
    toast.error('Error al guardar el bien')
  } finally {
    guardando.value = false
  }
}

const cerrarModal = () => {
  mostrarModalCrear.value = false
  mostrarModalEditar.value = false
  bienActual.value = null
  Object.assign(formulario, {
    codigo_institucional: '',
    codigo_senescyt: '',
    nombre: '',
    descripcion: '',
    marca: '',
    modelo: '',
    serie: '',
    categoria_id: '',
    ubicacion_id: '',
    estado: 'activo',
    valor_adquisicion: 0,
    fecha_adquisicion: new Date().toISOString().split('T')[0],
    color: '',
    material: '',
    observaciones: '',
    responsable_id: '',
  })
}

const limpiarFiltros = () => {
  Object.assign(filtros, {
    busqueda: '',
    categoria: '',
    estado: '',
    ubicacion: '',
    limite: 10,
  })
}

const exportarDatos = async () => {
  try {
    toast.info('Exportando datos...')

    // Crear archivo Excel con los datos actuales
    const datosExportar = bienes.value.map(bien => ({
      'Código Institucional': bien.codigo_institucional,
      'Código SENESCYT': bien.codigo_senescyt,
      'Nombre': bien.nombre,
      'Descripción': bien.descripcion,
      'Marca': bien.marca,
      'Modelo': bien.modelo,
      'Serie': bien.serie,
      'Categoría': bien.categoria?.nombre || 'Sin categoría',
      'Ubicación': bien.ubicacion?.nombre || 'Sin ubicación',
      'Estado': bien.estado,
      'Valor Adquisición': bien.valor_adquisicion,
      'Responsable': bien.responsable_completo,
      'Fecha Adquisición': bien.fecha_adquisicion ? new Date(bien.fecha_adquisicion).toLocaleDateString() : '',
      'Observaciones': bien.observaciones
    }))

    // Crear CSV
    const headers = Object.keys(datosExportar[0] || {})
    const csvContent = [
      headers.join(','),
      ...datosExportar.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `bienes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Datos exportados correctamente')
  } catch (error) {
    console.error('Error al exportar:', error)
    toast.error('Error al exportar los datos')
  }
}

const getEstadoClass = (estado: string) => {
  switch (estado) {
    case 'activo':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'inactivo':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    case 'mantenimiento':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'baja':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

const showQRModal = (item: Asset) => {
  generarQR(item)
}

const generarQR = async (bien: Asset) => {
  try {
    // Crear información completa del bien para el QR
    const informacionBien = {
      nombre: bien.nombre,
      codigo_institucional: bien.codigo_institucional,
      codigo_senescyt: bien.codigo_senescyt,
      categoria: bien.categoria_nombre || 'No especificada',
      ubicacion: bien.ubicacion_nombre || 'No asignada',
      responsable: bien.responsable_nombre ? `${bien.responsable_nombre} ${bien.responsable_apellido || ''}`.trim() : 'No asignado',
      estado: bien.estado,
      valor: bien.valor_adquisicion ? `$${bien.valor_adquisicion.toFixed(2)}` : 'No especificado',
      fecha_adquisicion: bien.fecha_adquisicion || 'No especificada'
    }

    // Crear el texto del QR con toda la información
    const textoQR = `
BIEN INSTITUCIONAL
==================
Nombre: ${informacionBien.nombre}
Código Inst.: ${informacionBien.codigo_institucional}
Código SENESCYT: ${informacionBien.codigo_senescyt}
Categoría: ${informacionBien.categoria}
Ubicación: ${informacionBien.ubicacion}
Responsable: ${informacionBien.responsable}
Estado: ${informacionBien.estado}
Valor: ${informacionBien.valor}
Fecha Adq.: ${informacionBien.fecha_adquisicion}
==================
Ver detalles: ${window.location.origin}/bienes/${bien.id}
`.trim()

    if (bien.codigo_qr) {
      // Mostrar QR existente con información actualizada
      qrActual.value = {
        codigo: bien.codigo_qr,
        url: textoQR
      }
      mostrarModalQR.value = true
      return
    }

    // Generar nuevo QR con información completa
    const response = await fetch(`/api/bienes/${bien.id}/qr`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contenido_qr: textoQR
      })
    })

    if (!response.ok) throw new Error('Error al generar código QR')

    const data = await response.json()
    if (data.success) {
      bien.codigo_qr = data.codigo_qr
      qrActual.value = {
        codigo: data.codigo_qr,
        url: textoQR
      }
      mostrarModalQR.value = true
      toast.success('Código QR generado correctamente')
    } else {
      throw new Error(data.message || 'Error al generar código QR')
    }
  } catch (error) {
    console.error('Error al generar QR:', error)
    toast.error('Error al generar el código QR')
  }
}

// Función para generar el código QR visual
const generarCodigoQRVisual = async (texto: string) => {
  try {
    const qrContainer = document.getElementById('qr-code')
    if (!qrContainer) {
      console.error('Container qr-code no encontrado')
      return
    }
    
    // Limpiar container
    qrContainer.innerHTML = ''
    
    // Crear canvas y generar QR
    const canvas = document.createElement('canvas')
    await QRCode.toCanvas(canvas, texto, {
      width: 192,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
    
    qrContainer.appendChild(canvas)
  } catch (error) {
    console.error('Error al generar QR visual:', error)
  }
}

const cerrarModalQR = () => {
  mostrarModalQR.value = false
  qrActual.value = null
}

const descargarQR = async () => {
  if (!qrActual.value) return

  try {
    const canvas = document.querySelector('#qr-code canvas') as HTMLCanvasElement
    if (canvas) {
      const link = document.createElement('a')
      link.download = `qr-bien-${qrActual.value.codigo}.png`
      link.href = canvas.toDataURL()
      link.click()
      toast.success('QR descargado correctamente')
    }
  } catch (error) {
    toast.error('Error al descargar el QR')
  }
}

const imprimirQR = async () => {
  if (!qrActual.value) return

  try {
    // Crear un canvas temporal para imprimir
    const tempCanvas = document.createElement('canvas')
    await QRCode.toCanvas(tempCanvas, qrActual.value.url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
          <head>
            <title>Código QR - ${qrActual.value.codigo}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
              .qr-container { margin: 20px 0; }
              .info { text-align: left; max-width: 600px; margin: 0 auto; font-size: 12px; }
              @media print { 
                body { margin: 0; } 
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h2>Código QR - Bien Institucional</h2>
            <div class="qr-container">
              <img src="${tempCanvas.toDataURL()}" alt="Código QR" />
            </div>
            <div class="info">
              <pre>${qrActual.value.url}</pre>
            </div>
            <button class="no-print" onclick="window.print()">Imprimir</button>
          </body>
        </html>
      `)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  } catch (error) {
    console.error('Error al imprimir QR:', error)
    toast.error('Error al imprimir el QR')
  }
}

// Métodos de carga de datos
const cargarCategorias = async () => {
  try {
    const response = await apiClient.get('/categorias')
    if (response.success && response.data) {
      categorias.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
    categorias.value = []
    toast.error('Error al cargar las categorías')
  }
}

const cargarUbicaciones = async () => {
  try {
    const response = await apiClient.get('/ubicaciones')
    if (response.success && response.data) {
      ubicaciones.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar ubicaciones:', error)
    ubicaciones.value = []
    toast.error('Error al cargar las ubicaciones')
  }
}

const cargarUsuarios = async () => {
  try {
    const response = await apiClient.get('/usuarios')
    if (response.success && response.data) {
      usuarios.value = response.data
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    usuarios.value = []
    toast.error('Error al cargar los usuarios')
  }
}

// Lifecycle
// Watcher para generar QR visual cuando se muestra el modal
watch([mostrarModalQR, qrActual], async ([modalVisible, qrData]) => {
  if (modalVisible && qrData) {
    await nextTick()
    await generarCodigoQRVisual(qrData.url)
  }
})

onMounted(async () => {
  await Promise.all([cargarBienes(), cargarCategorias(), cargarUbicaciones(), cargarUsuarios()])
})
</script>
