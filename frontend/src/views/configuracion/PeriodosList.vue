<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Períodos Académicos
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Administra los períodos académicos institucionales
            </p>
          </div>
          <button
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nuevo Período
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="lg:col-span-2">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar por nombre, año..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <select
              v-model="filters.estado"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="finalizado">Finalizado</option>
              <option value="planificado">Planificado</option>
            </select>
          </div>
          <div>
            <select
              v-model="filters.tipo"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los tipos</option>
              <option value="semestre">Semestre</option>
              <option value="trimestre">Trimestre</option>
              <option value="cuatrimestre">Cuatrimestre</option>
              <option value="anual">Anual</option>
            </select>
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

    <!-- DataTable de períodos -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Período
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Fechas
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Duración
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Bienes Asignados
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
              v-for="periodo in paginatedPeriodos"
              :key="periodo.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ periodo.nombre }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Año: {{ periodo.anio }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getTipoClass(periodo.tipo)"
                >
                  {{ periodo.tipo }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">
                  Inicio: {{ formatDate(periodo.fechaInicio) }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  Fin: {{ formatDate(periodo.fechaFin) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getEstadoClass(periodo.estado)"
                >
                  {{ periodo.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ periodo.duracion }} días
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ periodo.bienesAsignados }} bienes
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="viewPeriodo(periodo)"
                    class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Ver detalles del período"
                  >
                    <i class="bx bx-show text-lg"></i>
                  </button>
                  <button
                    @click="editPeriodo(periodo)"
                    class="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Editar período"
                  >
                    <i class="bx bx-edit text-lg"></i>
                  </button>
                  <button
                    @click="togglePeriodoStatus(periodo)"
                    :class="[
                      'p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation',
                      periodo.estado === 'activo'
                        ? 'text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900'
                        : 'text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900'
                    ]"
                    :title="periodo.estado === 'activo' ? 'Desactivar período' : 'Activar período'"
                  >
                    <i :class="periodo.estado === 'activo' ? 'bx bx-toggle-right' : 'bx bx-toggle-left'" class="text-lg"></i>
                  </button>
                  <button
                    @click="deletePeriodo(periodo.id)"
                    class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Eliminar período"
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
            {{ Math.min(currentPage * itemsPerPage, filteredPeriodos.length) }} de
            {{ filteredPeriodos.length }} períodos
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
                  ? 'bg-blue-600 text-white'
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

    <!-- Modal de creación/edición -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ showEditModal ? 'Editar Período' : 'Nuevo Período' }}
        </h2>
        <form @submit.prevent="savePeriodo" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Nombre *</label
              >
              <input
                v-model="form.nombre"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Año *</label
              >
              <input
                v-model="form.anio"
                type="number"
                min="2020"
                :max="new Date().getFullYear() + 5"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Tipo *</label
              >
              <select
                v-model="form.tipo"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar tipo</option>
                <option value="semestre">Semestre</option>
                <option value="trimestre">Trimestre</option>
                <option value="cuatrimestre">Cuatrimestre</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Estado *</label
              >
              <select
                v-model="form.estado"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Seleccionar estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="finalizado">Finalizado</option>
                <option value="planificado">Planificado</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Fecha de Inicio *</label
              >
              <input
                v-model="form.fechaInicio"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Fecha de Fin *</label
              >
              <input
                v-model="form.fechaFin"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Descripción</label
            >
            <textarea
              v-model="form.descripcion"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >Observaciones</label
            >
            <textarea
              v-model="form.observaciones"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {{ showEditModal ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div
      v-if="showViewModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeViewModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Detalles del Período</h2>
        <div v-if="selectedPeriodo" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Nombre</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedPeriodo.nombre }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Año</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ selectedPeriodo.anio }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getTipoClass(selectedPeriodo.tipo)"
              >
                {{ selectedPeriodo.tipo }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Estado</label
              >
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getEstadoClass(selectedPeriodo.estado)"
              >
                {{ selectedPeriodo.estado }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Fecha de Inicio</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(selectedPeriodo.fechaInicio) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Fecha de Fin</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(selectedPeriodo.fechaFin) }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Duración</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedPeriodo.duracion }} días
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >Bienes Asignados</label
              >
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedPeriodo.bienesAsignados }} bienes
              </p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Descripción</label
            >
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selectedPeriodo.descripcion }}
            </p>
          </div>
          <div v-if="selectedPeriodo.observaciones">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >Observaciones</label
            >
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selectedPeriodo.observaciones }}
            </p>
          </div>
          <div class="flex justify-end pt-4">
            <button
              @click="closeViewModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./PeriodosList.script.js"></script>
