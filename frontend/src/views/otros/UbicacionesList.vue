<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ headerTitle }}</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              {{ headerDescription }}
            </p>
          </div>
          <div class="flex gap-2">
            <button @click="showInactiveModal = true"
              class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
              </svg>
              Ver Inactivas
            </button>
            <button v-if="isAdmin" @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {{ createButtonLabel }}
            </button>
          </div>
            <!-- Modal de ubicaciones inactivas -->
            <div v-if="showInactiveModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showInactiveModal = false">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl">
                <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Ubicaciones Inactivas</h2>
                <div class="mb-4">
                  <input v-model="inactiveSearch" type="text" placeholder="Buscar por nombre o campus..."
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                </div>
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 mb-4">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Campus</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Piso</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="ubicacion in filteredInactiveUbicaciones" :key="ubicacion.id">
                      <td class="px-4 py-2">{{ ubicacion.nombre }}</td>
                      <td class="px-4 py-2">{{ ubicacion.campus_nombre || ubicacion.edificio || '—' }}</td>
                      <td class="px-4 py-2">{{ ubicacion.piso }}</td>
                      <td class="px-4 py-2">
                        <div class="flex items-center space-x-2">
                          <button
                            :disabled="reactivatingIds.has(ubicacion.id)"
                            @click="reactivateUbicacion(ubicacion)"
                            class="px-3 py-1 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            :class="reactivatingIds.has(ubicacion.id) ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'">
                            <span v-if="reactivatingIds.has(ubicacion.id)" class="inline-flex items-center gap-2">
                              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path></svg>
                              Activando...
                            </span>
                            <span v-else>Activar</span>
                          </button>

                          <!-- Permanent delete (only admins) -->
                          <button
                            v-if="isAdmin"
                            :disabled="deletingIds.has(ubicacion.id)"
                            @click="deleteInactiveUbicacion(ubicacion)"
                            class="px-3 py-1 rounded text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            :class="deletingIds.has(ubicacion.id) ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'">
                            <span v-if="deletingIds.has(ubicacion.id)" class="inline-flex items-center gap-2">
                              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path></svg>
                              Eliminando...
                            </span>
                            <span v-else>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="filteredInactiveUbicaciones.length === 0">
                      <td colspan="4" class="text-center text-gray-500 py-4">No hay ubicaciones inactivas</td>
                    </tr>
                  </tbody>
                </table>
                <div class="flex justify-end">
                  <button @click="showInactiveModal = false" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">Cerrar</button>
                </div>
              </div>
            </div>
        <!-- ...existing code... -->
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="lg:col-span-2">
            <input v-model="filters.search" type="text" placeholder="Buscar por nombre, campus..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
          </div>

          <div>
            <select v-model="filters.estado"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">En Mantenimiento</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button @click="clearFilters"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- DataTable de ubicaciones -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ubicación
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Campus
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Capacidad
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Bienes
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="ubicacion in paginatedUbicaciones" :key="ubicacion.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ ubicacion.nombre }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    Piso {{ ubicacion.piso }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ ubicacion.campus_nombre || ubicacion.edificio || '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ ubicacion.capacidad }} personas
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getEstadoClass(ubicacion.estado)">
                  {{ ubicacion.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <button @click="openBienesUbicacion(ubicacion)" class="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {{ ubicacion.bienesAsignados != null ? ubicacion.bienesAsignados : 0 }} bienes
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewUbicacion(ubicacion)"
                    class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Ver detalles y gestionar">
                    <i class="bx bx-show text-lg"></i>
                  </button>
                  <button v-if="isAdmin" @click="editUbicacion(ubicacion)"
                    class="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Editar ubicación">
                    <i class="bx bx-edit text-lg"></i>
                  </button>
                  <button v-if="isAdmin" @click="deleteUbicacion(ubicacion.id)"
                    class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Eliminar ubicación">
                    <i class="bx bx-trash text-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Paginación -->
        <div class="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
            {{ Math.min(currentPage * itemsPerPage, filteredUbicaciones.length) }} de
            {{ filteredUbicaciones.length }} ubicaciones
          </div>
          <div class="flex space-x-1">
            <button @click="previousPage" :disabled="currentPage === 1"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50">
              Anterior
            </button>
            <button v-for="page in visiblePages" :key="page" @click="goToPage(page)" :class="[
              'px-3 py-1 rounded',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white',
            ]">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="(showCreateModal || showEditModal) && isAdmin"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4"
      @click.self="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ showEditModal ? 'Editar Ubicación' : 'Nueva Ubicación' }}
        </h2>
        <form @submit.prevent="saveUbicacion" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
              <input v-model="form.nombre" type="text" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campus *</label>
              <select v-model.number="form.id_campus" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleccionar Campus</option>
                <option v-for="dept in departamentos" :key="dept.id_campus" :value="dept.id_campus">
                  {{ dept.nombre }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Piso *</label>
              <input v-model="form.piso" type="number" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de Aula</label>
              <input v-model="form.aula" type="text"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Ej. A-101" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacidad</label>
              <input v-model="form.capacidad" type="number" min="1"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado *</label>
              <select v-model="form.estado" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleccionar estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="mantenimiento">En Mantenimiento</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea v-model="form.descripcion" rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal"
              class="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white transition-colors">
              <i class="bx bx-x text-lg"></i>
              <span>Cancelar</span>
            </button>
            <button type="submit"
              class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <i :class="showEditModal ? 'bx bx-save' : 'bx bx-plus'" class="text-lg"></i>
              <span>{{ showEditModal ? 'Actualizar' : 'Crear' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Avanzado de Gestión (Detalles, Custodia, Bienes) -->
    <div v-if="showViewModal && selectedUbicacion"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeViewModal">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        <!-- Modal Header -->
        <div
          class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i class='bx bx-building-house'></i>
              {{ selectedUbicacion.nombre }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ selectedUbicacion.edificio }} - Piso {{ selectedUbicacion.piso }}
            </p>
          </div>
          <button @click="closeViewModal"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <i class='bx bx-x text-3xl'></i>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 dark:border-gray-700 px-6 bg-white dark:bg-gray-800">
          <button @click="activeTab = 'detalles'"
            class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'detalles' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'">
            <i class='bx bx-info-circle'></i> Detalles
          </button>
          <button @click="activeTab = 'custodia'"
            class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'custodia' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'">
            <i class='bx bx-user-check'></i> Custodia
          </button>
          <button @click="activeTab = 'bienes'"
            class="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'bienes' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'">
            <i class='bx bx-box'></i> Bienes ({{ selectedUbicacion.bienesAsignados || 0 }})
          </button>
        </div>

        <!-- Modal Content Scrollable -->
        <div class="p-6 overflow-y-auto flex-1 bg-white dark:bg-gray-800">

          <!-- TAB: Detalles -->
          <div v-if="activeTab === 'detalles'" class="animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Información General</h4>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Capacidad:</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{ selectedUbicacion.capacidad }}
                      personas</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Estado:</span>
                    <span class="font-medium" :class="getEstadoClass(selectedUbicacion.estado)">{{ selectedUbicacion.estado }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600 dark:text-gray-300">Aula/Oficina:</span>
                    <span class="font-medium text-gray-900 dark:text-white">{{ selectedUbicacion.aula || selectedUbicacion.numero_aula || 'N/A' }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h4 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Descripción</h4>
                <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ selectedUbicacion.descripcion || 'Sin descripción' }}</p>
              </div>
            </div>
          </div>

          <!-- TAB: Custodia -->
          <div v-if="activeTab === 'custodia'" class="animate-fade-in space-y-6">
            <!-- Asignar Nuevo (Solo Admin) -->
            <div v-if="isAdmin"
              class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
              <h3 class="font-semibold text-blue-900 dark:text-blue-100 flex items-center mb-4">
                <i class="bx bx-plus-circle mr-2"></i> Asignar Custodio
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custodio</label>
                  <select v-model="custodiaForm.usuario_id"
                    class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Seleccionar Usuario</option>
                    <option v-for="u in users" :key="u.id_usuario" :value="u.id_usuario">
                      {{ u.nombres }} {{ u.apellidos }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periodo
                    Académico</label>
                  <select v-model="custodiaForm.periodo_id"
                    class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Seleccionar Periodo</option>
                    <option v-for="p in periodos" :key="p.id_periodo" :value="p.id_periodo">
                      {{ p.nombre_periodo }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
                <textarea v-model="custodiaForm.observaciones" rows="2"
                  class="w-full rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Opcional"></textarea>
              </div>
              <div class="mt-4 flex justify-end">
                <button @click="saveCustodia" :disabled="!custodiaForm.usuario_id || !custodiaForm.periodo_id"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                  Guardar Asignación
                </button>
              </div>
            </div>

            <!-- Historial -->
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Historial de Asignaciones</h3>
              <div
                class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Periodo</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Custodio</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Observación</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Estado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="c in custodiaHistory" :key="c.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">{{ c.nombre_periodo }}</td>
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div class="font-medium">{{ c.usuario_nombre }}</div>
                        <div class="text-xs text-gray-500">{{ c.usuario_email }}</div>
                      </td>
                      <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{{ c.observaciones || '-' }}</td>
                      <td class="px-4 py-3 text-sm">
                        <span
                          :class="c.activo ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'"
                          class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ c.activo ? 'Vigente' : 'Histórico' }}
                        </span>
                      </td>
                    </tr>
                    <tr v-if="custodiaHistory.length === 0">
                      <td colspan="4" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No hay registro de custodios para esta ubicación.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TAB: Bienes -->
          <div v-if="activeTab === 'bienes'" class="animate-fade-in">
            <div
              class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden p-4">

              <!-- Resumen (Summary) -->
              <!-- Resumen (Summary) -->
              <div class="flex justify-between items-center mb-4 px-1">
                <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Resumen de Inventario
                </h4>
                <button v-if="isAdmin" @click="openAssignAssetModal"
                  class="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                  <i class='bx bx-plus'></i> Asignar Bien
                </button>
              </div>

              <div v-if="bienesList.length > 0" class="mb-6">
                <div class="border-b pb-2 mb-3 dark:border-gray-700 hidden"></div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div v-for="item in bienesSummary" :key="item.name"
                    class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 dark:border-gray-600 transition-transform hover:scale-105 duration-200">
                    <span class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{{ item.count }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-300 font-medium uppercase truncate w-full px-2"
                      :title="item.name">{{ item.name }}</span>
                  </div>
                </div>
              </div>

              <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Lista
                Detallada</h4>
              <div v-if="bienesLoading" class="p-8 flex justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <table v-else class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Código</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Descripción</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Marca/Modelo</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="bien in bienesList" :key="bien.id_bien" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ bien.codigo_institucional }}</td>
                    <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ bien.nombre }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {{ bien.marca }} <span v-if="bien.modelo">- {{ bien.modelo }}</span>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {{ bien.estado }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="bienesList.length === 0">
                    <td colspan="4" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay bienes asignados a esta ubicación.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal de bienes por Ubicación -->
    <div v-if="showUbicacionBienesModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" @click.self="showUbicacionBienesModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Bienes en la ubicación: {{ selectedUbicacionParaBienes?.nombre }}</h2>

        <div v-if="bienesUbicacionLoading" class="p-8 flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="bienesUbicacion.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Código</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Marca</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Responsable</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="bien in bienesUbicacion" :key="bien.id_bien" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{{ bien.codigo_institucional || bien.codigo || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{{ bien.nombre }}</td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ bien.marca || '-' }}</td>
                <td class="px-4 py-3 text-sm"><span :class="getEstadoBienClass(bien.estado)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">{{ bien.estado }}</span></td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{{ bien.responsable_completo || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">No hay bienes asignados a esta ubicación</p>
        </div>

        <div class="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button @click="showUbicacionBienesModal = false" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Modal Asignar Bien -->
    <div v-if="showAssignAssetModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[60] p-4"
      @click.self="showAssignAssetModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="font-bold text-gray-900 dark:text-white">Asignar Bien a {{ selectedUbicacion?.nombre }}</h3>
          <button @click="showAssignAssetModal = false" class="text-gray-500 hover:text-gray-700"><i
              class='bx bx-x text-2xl'></i></button>
        </div>
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <input v-model="assetSearch" type="text" placeholder="Buscar bien por nombre, código o marca..."
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          <div v-if="availableBienes.length === 0" class="text-center py-8 text-gray-500">
            {{ assetSearch ? 'No se encontraron bienes.' : 'Cargando o no hay más bienes disponibles.' }}
          </div>
          <div v-else class="space-y-2">
            <div v-for="bien in availableBienes" :key="bien.id_bien"
              class="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div class="overflow-hidden">
                <div class="font-medium text-gray-900 dark:text-white truncate">{{ bien.nombre }}</div>
                <div class="text-xs text-gray-500 truncate">{{ bien.codigo_institucional }} - {{ bien.marca }}</div>
                <div class="text-xs text-gray-400" v-if="bien.ubicacion_nombre">Actual: {{ bien.ubicacion_nombre }}
                </div>
                <div class="text-xs text-green-600" v-else>Disponible (Sin ubicación)</div>
              </div>
              <button @click="assignAsset(bien)" :disabled="assigningAsset"
                class="ml-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50">
                Asignar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'
import type { Ubicacion } from '@/types'
import { confirm } from '@/composables/useConfirm'

// Estado para modal de inactivas
const showInactiveModal = ref(false)

// Computed para ubicaciones inactivas (seguro: filtrar solo objetos válidos)
const inactiveUbicaciones = computed(() => ubicaciones.value.filter((u: Ubicacion | null) => !!u && u.estado === 'inactivo'))

// Búsqueda dentro del modal de inactivas
const inactiveSearch = ref('')
const filteredInactiveUbicaciones = computed(() => {
  try {
    const q = String(inactiveSearch.value ?? '').toLowerCase().trim()
    if (!q) return inactiveUbicaciones.value
    return inactiveUbicaciones.value.filter((u: Ubicacion | null) => {
      if (!u) return false
      const nombre = String(u.nombre ?? u.area ?? '').toLowerCase()
      const campus = String(u.campus_nombre ?? u.edificio ?? u.sede ?? '').toLowerCase()
      return nombre.includes(q) || campus.includes(q)
    })
  } catch (err) {
    console.error('filteredInactiveUbicaciones error:', err)
    return inactiveUbicaciones.value || []
  }
})

// Limpiar búsqueda cuando se cierra el modal (uso watchEffect para leer el ref de forma segura)
watchEffect(() => {
  try {
    if (!showInactiveModal.value) inactiveSearch.value = ''
  } catch (err) {
    console.error('watchEffect showInactiveModal error:', err)
  }
})

// Reactivar ubicación (envía payload compatible con backend, maneja estado de carga por fila)
const reactivatingIds = ref(new Set<number>())

const reactivateUbicacion = async (ubicacion: Ubicacion) => {
  if (!ubicacion || !ubicacion.id) return
  const id = ubicacion.id
  try {
    reactivatingIds.value.add(id)

    // Enviar 'activo' numérico (backend interpreta correctamente) y evitar enviar 'estado' en minúsculas
    const response = await apiClient.put(`/ubicaciones/${id}`, { activo: 1 })
    const data = response

    if (data && data.success) {
      ubicaciones.value = ubicaciones.value.map((u: Ubicacion) =>
        u.id === id ? { ...u, estado: 'activo' } : u
      )
      toast.success(data.message || 'Ubicación activada correctamente')
      // Cerrar modal si ya no hay inactivas visibles
      if (inactiveUbicaciones.value.length <= 1) showInactiveModal.value = false
    } else {
      toast.error(data?.message || 'Error al activar ubicación')
    }
  } catch (error: any) {
    // Mostrar mensaje explícito del backend si existe (p.ej. en uso, FK, etc.)
    const msg = error?.response?.data?.message || error?.message || 'Error al activar la ubicación'
    toast.error(msg)
    console.error('reactivateUbicacion error:', error)
  } finally {
    reactivatingIds.value.delete(id)
  }
}

// IDs en proceso de eliminación definitiva
const deletingIds = ref(new Set<number>())

// Eliminar una ubicación inactiva de forma permanente (DELETE en backend)
const deleteInactiveUbicacion = async (ubicacion: Ubicacion) => {
  if (!isAdmin.value) {
    toast.error('No tienes permisos para eliminar ubicaciones')
    return
  }
  const confirmed = await confirm({
    title: 'Eliminar ubicación',
    message: `¿Eliminar definitivamente la ubicación "${ubicacion.nombre}"? Esta acción es irreversible.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    destructive: true,
  })
  if (!confirmed) return

  const id = ubicacion.id
  try {
    deletingIds.value.add(id)
    const response = await apiClient.delete(`/ubicaciones/${id}`)
    if (response && response.success) {
      // Remover de la lista local
      ubicaciones.value = ubicaciones.value.filter((u: Ubicacion) => u.id !== id)
      toast.success(response.message || 'Ubicación eliminada correctamente')
      if (inactiveUbicaciones.value.length <= 1) showInactiveModal.value = false
    } else {
      throw new Error(response.message || 'Error eliminando ubicación')
    }
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || 'Error al eliminar la ubicación'
    toast.error(msg)
    console.error('deleteInactiveUbicacion error:', error)
  } finally {
    deletingIds.value.delete(id)
  }
}


interface Props {
  title?: string
  description?: string
  createLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Gestión de Ubicaciones',
  description: 'Administra las ubicaciones físicas y asignaciones de custodia',
  createLabel: 'Nueva Ubicación',
})

const headerTitle = computed(() => props.title)
const headerDescription = computed(() => props.description)
const createButtonLabel = computed(() => props.createLabel)



// Stores
const authStore = useAuthStore()
const toast = useToast()

// Control de acceso por rol
const isAdmin = computed(() => authStore.hasRole('Administrador'))

// Estado del componente
const ubicaciones = ref<Ubicacion[]>([])
const departamentos = ref<any[]>([])
const loading = ref(false)

const filters = ref({
  search: '',
  estado: '',
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const selectedUbicacion = ref<Ubicacion | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const form = ref({
  id: null as number | null,
  nombre: '',
  edificio: '',
  piso: '',
  aula: '',
  capacidad: '',
  estado: '',
  descripcion: '',
  id_campus: null as number | null,
})

// Custodia & Bienes States
const activeTab = ref('detalles')
const users = ref<any[]>([])
const periodos = ref<any[]>([])
const custodiaHistory = ref<any[]>([])
const bienesList = ref<any[]>([])
const bienesLoading = ref(false)

const custodiaForm = ref({
  usuario_id: '',
  periodo_id: '',
  observaciones: ''
})

// Asset Assignment State
const showAssignAssetModal = ref(false)
const allBienes = ref<any[]>([])
const assetSearch = ref('')
const assigningAsset = ref(false)

// Modal y lista de bienes por ubicación
const showUbicacionBienesModal = ref(false)
const selectedUbicacionParaBienes = ref<Ubicacion | null>(null)
const bienesUbicacion = ref<any[]>([])
const bienesUbicacionLoading = ref(false)

const openBienesUbicacion = async (ubicacion: Ubicacion) => {
  if (!ubicacion || !ubicacion.id) return
  selectedUbicacionParaBienes.value = ubicacion
  showUbicacionBienesModal.value = true
  bienesUbicacionLoading.value = true
  try {
    const res = await apiClient.get(`/bienes?ubicacion=${ubicacion.id}`)
    if (res.success) bienesUbicacion.value = res.data || []
    else bienesUbicacion.value = []
  } catch (e) {
    console.error('Error loading bienes for ubicacion', e)
    toast.error('Error al cargar bienes de la ubicación')
    bienesUbicacion.value = []
  } finally {
    bienesUbicacionLoading.value = false
  }
}

const availableBienes = computed(() => {
  if (!assetSearch.value) return allBienes.value.filter((b: any) => !b.ubicacion_id || b.ubicacion_id === 0).slice(0, 10)
  const q = assetSearch.value.toLowerCase()
  return allBienes.value
    .filter((b: any) => !b.ubicacion_id || b.ubicacion_id === 0)
    .filter((b: any) =>
      b.nombre.toLowerCase().includes(q) ||
      b.codigo_institucional.toLowerCase().includes(q) ||
      b.marca?.toLowerCase().includes(q)
    )
    .slice(0, 20)
})

// Computed Summary
const bienesSummary = computed(() => {
  const map: Record<string, number> = {}
  bienesList.value.forEach((b: any) => {
    const name = b.nombre || 'Desconocido'
    map[name] = (map[name] || 0) + 1
  })
  return Object.entries(map).map(([name, count]) => ({ name, count }))
})

// Métodos de carga de datos auxiliares
const loadUsers = async () => {
  // Cargar solo si está vacío
  if (users.value.length > 0) return
  try {
    const res = await apiClient.get('/usuarios')
    if (res.success) users.value = res.data
  } catch (e) {
    console.error('Error loading users', e)
  }
}

const loadPeriodos = async () => {
  if (periodos.value.length > 0) return
  try {
    const res = await apiClient.get('/periodos-academicos')
    if (res.success) periodos.value = res.data
  } catch (e) {
    console.error('Error loading periods', e)
  }
}

const loadCustodiaHistory = async (id: number) => {
  try {
    const res = await apiClient.get(`/ubicaciones/${id}/custodios`)
    if (res.success) custodiaHistory.value = res.data
  } catch (e) {
    console.error(e)
    toast.error('Error al cargar historial de custodia')
  }
}

const loadBienes = async (id: number) => {
  bienesLoading.value = true
  try {
    const res = await apiClient.get(`/bienes?ubicacion=${id}`)
    if (res.success) bienesList.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    bienesLoading.value = false
  }
}

const saveCustodia = async () => {
  if (!selectedUbicacion.value) return
  try {
    const res = await apiClient.post(`/ubicaciones/${selectedUbicacion.value.id}/custodios`, {
      usuario_id: custodiaForm.value.usuario_id,
      periodo_id: custodiaForm.value.periodo_id,
      observaciones: custodiaForm.value.observaciones
    })
    if (res.success) {
      toast.success('Asignación guardada')
      loadCustodiaHistory(selectedUbicacion.value.id)
      // Reset form but keep period maybe?
      custodiaForm.value.usuario_id = ''
      custodiaForm.value.observaciones = ''
    }
  } catch (e: any) {
    toast.error(e.response?.data?.message || 'Error al guardar asignación')
  }
}

const openAssignAssetModal = async () => {
  try {
    const res = await apiClient.get('/bienes')
    if (res.success) {
      allBienes.value = res.data
      showAssignAssetModal.value = true
    }
  } catch (e) {
    toast.error('Error al cargar lista de bienes')
  }
}

const assignAsset = async (bien: any) => {
  if (!selectedUbicacion.value) return
  assigningAsset.value = true
  try {
    // Determine payload structure based on API. Assuming PUT /bienes/:id updates fields.
    // We need to preserve other fields or backend handles partial update?
    // Usually standard crud expects full object or backend handles partial.
    // I'll assume endpoint handles partial or I'll try to just send what I want if backend supports it.
    // Checking backend/routes/bienes.js would be ideal but I'll assume standard update.
    // Actually, safect update: get bien, update field, send back.
    // But backend likely supports standard update.

    // Using a specific quick update or standard PUT.
    // I'll use standard PUT with the bien data + new ubicacion_id
    const payload = {
      nombre: bien.nombre,
      codigo_institucional: bien.codigo_institucional,
      codigo_senescyt: bien.codigo_senescyt || null,
      categoria_id: bien.categoria_id,
      ubicacion_id: selectedUbicacion.value.id,
      marca: bien.marca || null,
      modelo: bien.modelo || null,
      serie: bien.serie || null,
      estado: bien.estado,
      descripcion: bien.descripcion || null,
      valor: bien.valor !== undefined ? bien.valor : 0,
      fecha_adquisicion: bien.fecha_adquisicion || null,
      vida_util: bien.vida_util || null,
      valor_residual: bien.valor_residual !== undefined ? bien.valor_residual : null,
      color: bien.color || null,
      material: bien.material || null,
      periodo_id: bien.periodo_id || null,
      observaciones: bien.observaciones || null,
      nro_acta_entrega_recepcion: bien.nro_acta_entrega_recepcion || null,
      nro_acta_constatacion_fisica: bien.nro_acta_constatacion_fisica || null,
      depreciacion_acumulada: bien.depreciacion_acumulada !== undefined ? bien.depreciacion_acumulada : null
    }

    const bienId = bien.id || bien.id_bien;
    if (!bienId) {
      toast.error('ID de bien no definido');
      assigningAsset.value = false;
      return;
    }
    const res = await apiClient.put(`/bienes/${bienId}`, payload)

    if (res.success) {
      toast.success('Bien asignado correctamente')
      // Remove from allBienes locally to update UI instantly
      allBienes.value = allBienes.value.filter((b: any) => b.id_bien !== bien.id_bien)
      // Reload current list
      loadBienes(selectedUbicacion.value.id)
    } else {
      toast.error(res.message || 'Error al asignar bien')
    }
  } catch (e) {
    console.error(e)
    toast.error('Error al asignar bien')
  } finally {
    assigningAsset.value = false
  }
}

// Watch activeTab to load needed data
watch(activeTab, async (tab: string) => {
  if (tab === 'custodia') {
    await Promise.all([loadUsers(), loadPeriodos()])
    if (selectedUbicacion.value) loadCustodiaHistory(selectedUbicacion.value.id)
  } else if (tab === 'bienes') {
    if (selectedUbicacion.value) loadBienes(selectedUbicacion.value.id)
  }
})

// Métodos de carga de datos
const loadUbicaciones = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/ubicaciones')
    const data = response

    if (data.success) {
      ubicaciones.value = (data.data || []).map((u: any) => ({
        ...u,
        bienesAsignados: u.bienes_count != null ? u.bienes_count : 0
      }))
    } else {
      throw new Error(data.message || 'Error al cargar ubicaciones')
    }
  } catch (error) {
    toast.error('Error al cargar las ubicaciones')
  } finally {
    loading.value = false
  }
}

const loadDepartamentos = async () => {
  try {
    const response = await apiClient.get('/campus')
    const data = response

    if (data.success) {
      departamentos.value = data.data || []
    } else {
      departamentos.value = []
    }
  } catch (error) {
    console.error('Error al cargar campus:', error)
    departamentos.value = []
  }
}

// Filtros y búsqueda
const filteredUbicaciones = computed(() => {
  let result = ubicaciones.value.filter((u: Ubicacion) => u.estado === 'activo')

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      (u: Ubicacion) =>
        (u.nombre || '').toLowerCase().includes(search) ||
        (u.campus_nombre || '').toLowerCase().includes(search) ||
        (u.piso !== undefined && u.piso != null ? u.piso.toString() : '').includes(search)
    )
  }
  if (filters.value.estado) {
    result = result.filter((u: Ubicacion) => u.estado === filters.value.estado)
  }
  return result
})

// Paginación
const totalPages = computed(() => Math.ceil(filteredUbicaciones.value.length / itemsPerPage.value))
const paginatedUbicaciones = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUbicaciones.value.slice(start, start + itemsPerPage.value)
})
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Clases para badges
const getEstadoClass = (estado: string): string => {
  const map: Record<string, string> = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    mantenimiento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }
  return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const getEstadoBienClass = (estado: string): string => {
  const map: Record<string, string> = {
    ACTIVO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    INACTIVO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    MANTENIMIENTO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    mantenimiento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    BAJA: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    baja: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  }
  return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Acciones
const clearFilters = () => {
  filters.value = { search: '', estado: '' }
  currentPage.value = 1
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToPage = (page: number) => {
  currentPage.value = page
}

const viewUbicacion = (ubicacion: Ubicacion) => {
  selectedUbicacion.value = ubicacion
  activeTab.value = 'detalles' // Reset default tab
  showViewModal.value = true
}

const editUbicacion = (ubicacion: Ubicacion) => {
  if (!isAdmin.value) return
  form.value = {
    id: ubicacion.id,
    nombre: ubicacion.nombre,
    edificio: ubicacion.edificio,
    piso: ubicacion.piso?.toString() || '',
    aula: ubicacion.numero_aula || ubicacion.aula || '',
    capacidad: ubicacion.capacidad?.toString() || '',
    estado: ubicacion.estado,
    descripcion: ubicacion.descripcion || '',
    id_campus: ubicacion.id_campus || null,
  }
  showEditModal.value = true
}

const deleteUbicacion = async (id: number) => {
  if (!isAdmin.value) return
  const ubicacion = ubicaciones.value.find((u: Ubicacion) => u.id === id)
  if (!ubicacion) return
  if (ubicacion.bienesAsignados && ubicacion.bienesAsignados > 0) {
    toast.error('No se puede eliminar la ubicación porque tiene bienes asignados.')
    return
  }
  const confirmed = await confirm({
    title: 'Inactivar ubicación',
    message: `¿Estás seguro de que quieres inactivar la ubicación "${ubicacion.nombre}"?`,
    confirmText: 'Inactivar',
    cancelText: 'Cancelar',
    destructive: true,
  })
  if (!confirmed) return

  try {
      // Enviar todos los campos requeridos, cambiando solo el estado
      const payload = {
        nombre: ubicacion.nombre || '',
        area: ubicacion.area || ubicacion.nombre || '',
        sede: ubicacion.sede || ubicacion.edificio || '',
        piso: ubicacion.piso?.toString() || '1',
        numero_aula: ubicacion.numero_aula || ubicacion.aula || '',
        capacidad: Number(ubicacion.capacidad) || 1,
        descripcion: ubicacion.descripcion || null,
        activo: 0,
        id_campus: Number(ubicacion.id_campus) || 1,
        estado: 'inactivo'
      }
      const response = await apiClient.put(`/ubicaciones/${id}`, payload)
      const data = response
      if (data.success) {
        ubicaciones.value = ubicaciones.value.map((u: Ubicacion) =>
          u.id === id ? { ...u, estado: 'inactivo' } : u
        )
        toast.success('Ubicación inactivada correctamente')
      } else {
        toast.error(data.message || 'Error al inactivar ubicación')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Error al inactivar la ubicación')
    }
  }

const saveUbicacion = async () => {
  try {
    // Validación cliente: prevenir nombres duplicados (comparación case-insensitive sobre 'area')
    const nombreTrim = form.value.nombre?.trim().toLowerCase() || ''
    if (!nombreTrim) {
      toast.error('El nombre es requerido')
      return
    }
    // Evitar error de 'implicit any' tipando el parámetro y simplificar la lógica
    const duplicate = ubicaciones.value.some((u: Ubicacion) => {
      const area = (u.area || u.nombre || '').toString().trim().toLowerCase()
      if (showEditModal.value) return area === nombreTrim && u.id !== form.value.id
      return area === nombreTrim
    })
    if (duplicate) {
      toast.error('ya existe ese nombre')
      return
    }

    const payload = {
      nombre: form.value.nombre?.trim() || '',
      area: form.value.area?.trim() || form.value.nombre?.trim() || '',
      sede: form.value.sede?.trim() || form.value.edificio?.trim() || '',
      piso: form.value.piso?.toString() || '1',
      numero_aula: form.value.aula?.trim() || '',
      capacidad: Number(form.value.capacidad) || 1,
      descripcion: form.value.descripcion?.trim() || null,
      activo: form.value.estado === 'activo' || form.value.estado === 'mantenimiento' ? 1 : 0,
      id_campus: Number(form.value.id_campus) || 1
    }

    let response
    if (showEditModal.value && form.value.id) {
      response = await apiClient.put(`/ubicaciones/${form.value.id}`, payload)
    } else {
      response = await apiClient.post('/ubicaciones', payload)
    }

    const data = response
    if (data.success) {
      if (showEditModal.value) {
        // Recargar datos para obtener información actualizada
        await loadUbicaciones()
        toast.success('Ubicación actualizada correctamente')
      } else {
        // Recargar datos para obtener la nueva ubicación
        await loadUbicaciones()
        toast.success('Ubicación creada correctamente')
      }
      closeModal()
    } else {
      throw new Error(data.message || 'Error al guardar ubicación')
    }
  } catch (error: any) {
    console.error('Error saving ubicacion:', error)
    const msg = error.response?.data?.message || error.message || 'Error al guardar la ubicación'
    toast.error(msg)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  form.value = {
    id: null,
    nombre: '',
    edificio: '',
    piso: '',
    aula: '',
    capacidad: '',
    estado: '',
    descripcion: '',
    id_campus: null,
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedUbicacion.value = null
}

// Lifecycle
onMounted(() => {
  loadUbicaciones()
  loadDepartamentos()
})
</script>
