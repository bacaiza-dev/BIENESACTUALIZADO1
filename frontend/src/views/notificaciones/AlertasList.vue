<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Alertas</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Administra las alertas del sistema para mantenimientos, depreciaciones y eventos
              importantes.
            </p>
          </div>
          <button
            v-if="isAdmin"
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Nueva Alerta
          </button>
        </div>
      </div>
    </div>

    <!-- Métricas de alertas -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <svg
                class="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Alertas Pendientes</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ alertasPendientes }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg
                class="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Mantenimientos</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ alertasMantenimiento }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg
                class="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Depreciaciones</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ alertasDepreciacion }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg
                class="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Resueltas Hoy</p>
              <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ alertasResueltasHoy }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div class="col-span-2">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar por descripción, bien, tipo..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <select
              v-model="filters.tipo"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tipo de Alerta</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="depreciacion">Depreciación</option>
              <option value="garantia">Garantía</option>
              <option value="transferencia">Transferencia</option>
              <option value="baja">Baja de Bien</option>
            </select>
          </div>
          <div>
            <select
              v-model="filters.estado"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Estado</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelto">Resuelto</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div>
            <input
              v-model="filters.fechaDesde"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de alertas -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Bien
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Descripción
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Fecha Alerta
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Prioridad
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="alerta in paginatedAlertas"
              :key="alerta.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getTipoClass(alerta.tipo_alerta)"
                >
                  {{ alerta.tipo_alerta }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ alerta.bien.codigo }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ alerta.bien.nombre }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                  {{ alerta.descripcion }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getEstadoClass(alerta.estado)"
                >
                  {{ alerta.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(alerta.fecha_alerta) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getPrioridadClass(alerta.prioridad)"
                >
                  {{ alerta.prioridad }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-2">
                  <button
                    @click="viewAlerta(alerta)"
                    class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Ver alerta"
                  >
                    <i class="bx bx-show text-lg"></i>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="editAlerta(alerta)"
                    class="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Editar alerta"
                  >
                    <i class="bx bx-edit text-lg"></i>
                  </button>
                  <button
                    v-if="alerta.estado === 'pendiente'"
                    @click="resolverAlerta(alerta)"
                    class="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    <i class="bx bx-check-circle text-lg"></i>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="deleteAlerta(alerta.id)"
                    class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Eliminar alerta"
                  >
                    <i class="bx bx-trash text-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div
          class="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700"
        >
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
            {{ Math.min(currentPage * itemsPerPage, filteredAlertas.length) }} de
            {{ filteredAlertas.length }} alertas
          </div>
          <div class="flex space-x-1">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded',
                page === currentPage
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white',
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición de alerta -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ showEditModal ? 'Editar Alerta' : 'Nueva Alerta' }}
        </h2>
        <form @submit.prevent="saveAlerta" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bien *
              </label>
              <select
                v-model="form.id_bien"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar bien...</option>
                <option v-for="bien in bienes" :key="bien.id" :value="bien.id">
                  {{ bien.codigo }} - {{ bien.nombre }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Alerta *
              </label>
              <select
                v-model="form.tipo_alerta"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar tipo...</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="depreciacion">Depreciación</option>
                <option value="garantia">Garantía</option>
                <option value="transferencia">Transferencia</option>
                <option value="baja">Baja de Bien</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado *
              </label>
              <select
                v-model="form.estado"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="resuelto">Resuelto</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridad *
              </label>
              <select
                v-model="form.prioridad"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Alerta *
              </label>
              <input
                v-model="form.fecha_alerta"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Resolución
              </label>
              <input
                v-model="form.fecha_resolucion"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              v-model="form.descripcion"
              rows="4"
              required
              placeholder="Descripción detallada de la alerta..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              {{ showEditModal ? 'Actualizar' : 'Crear' }} Alerta
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de detalles de alerta -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeDetailModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Detalles de Alerta</h2>
        <div v-if="selectedAlerta" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo:</p>
              <p class="text-gray-900 dark:text-white">{{ selectedAlerta.tipo_alerta }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Estado:</p>
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                :class="getEstadoClass(selectedAlerta.estado)"
              >
                {{ selectedAlerta.estado }}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Bien:</p>
              <p class="text-gray-900 dark:text-white">
                {{ selectedAlerta.bien.codigo }} - {{ selectedAlerta.bien.nombre }}
              </p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad:</p>
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                :class="getPrioridadClass(selectedAlerta.prioridad)"
              >
                {{ selectedAlerta.prioridad }}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Alerta:</p>
              <p class="text-gray-900 dark:text-white">
                {{ formatDate(selectedAlerta.fecha_alerta) }}
              </p>
            </div>
            <div v-if="selectedAlerta.fecha_resolucion">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Fecha de Resolución:
              </p>
              <p class="text-gray-900 dark:text-white">
                {{ formatDate(selectedAlerta.fecha_resolucion) }}
              </p>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción:</p>
            <p class="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              {{ selectedAlerta.descripcion }}
            </p>
          </div>
        </div>
        <div class="flex justify-end mt-6">
          <button
            @click="closeDetailModal"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AlertasList.script.js"></script>
