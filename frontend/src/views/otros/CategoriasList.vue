<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Categorías</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Administra las categorías de bienes institucionales
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
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="lg:col-span-2">
            <input v-model="filters.search" type="text" placeholder="Buscar por nombre, código, descripción..." title="Buscar por nombre, código o descripción"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
          </div>
          <!-- removed: 'Todos los estados' filter (not used) -->
          <div>
            <select v-model="filters.tipo"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Todos los tipos</option>
              <option value="tecnologia">Tecnología</option>
              <option value="mobiliario">Mobiliario</option>
              <option value="equipos">Equipos</option>
              <option value="vehiculos">Vehículos</option>
              <option value="herramientas">Herramientas</option>
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

    <!-- DataTable de categorías -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Categoría
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descripción
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Bienes Asociados
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="categoria in paginatedCategorias" :key="categoria.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full flex items-center justify-center"
                      :class="getCategoriaColor(categoria.tipo)">
                      <span class="text-sm font-medium text-white">
                        {{ categoria.nombre.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ categoria.nombre }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      Código: {{ categoria.codigo }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getTipoClass(categoria.tipo)">
                  {{ categoria.tipo }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                  {{ categoria.descripcion }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getEstadoClass(categoria.estado)">
                  {{ categoria.estado }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <button @click="viewBienesCategoria(categoria)" 
                  class="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:text-blue-400 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg transition-colors font-medium">
                  {{ (categoria as any).bienesAsociados }} bienes
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(categoria.fechaCreacion) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewCategoria(categoria)"
                    class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Ver detalles de la categoría">
                    <i class="bx bx-show text-lg"></i>
                  </button>
                  <button v-if="isAdmin" @click="editCategoria(categoria)"
                    class="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Editar categoría">
                    <i class="bx bx-edit text-lg"></i>
                  </button>
                  <button v-if="isAdmin" @click="deleteCategoria(categoria.id)"
                    class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Eliminar categoría">
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
            {{ Math.min(currentPage * itemsPerPage, filteredCategorias.length) }} de
            {{ filteredCategorias.length }} categorías
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
    <div v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ showEditModal ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>
        <form @submit.prevent="saveCategoria" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
              <input v-model="form.nombre" type="text" required placeholder="Ej. Computadores"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Código *</label>
              <input v-model="form.codigo" type="text" required placeholder="Ej. CAT-001"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo *</label>
              <select v-model="form.tipo" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleccionar tipo</option>
                <option value="tecnologia">Tecnología</option>
                <option value="mobiliario">Mobiliario</option>
                <option value="equipos">Equipos</option>
                <option value="vehiculos">Vehículos</option>
                <option value="herramientas">Herramientas</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado *</label>
              <select v-model="form.estado" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleccionar estado</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
            <textarea v-model="form.descripcion" rows="3" placeholder="Ej. Equipos de cómputo institucionales"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observaciones</label>
            <textarea v-model="form.observaciones" rows="2" placeholder="Ej. Donado por empresa X en 2024"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              {{ showEditModal ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" @click.self="closeDeleteConfirm">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white text-center">
          ¿Estás seguro de que quieres eliminar esta categoría?
        </h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          Esta acción no se puede deshacer.
        </p>
        <div class="mt-6 flex gap-3 justify-center">
          <button @click="confirmDelete" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
            Eliminar
          </button>
          <button @click="closeDeleteConfirm" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white font-medium transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="showViewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeViewModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Detalles de la Categoría
        </h2>
        <div v-if="selectedCategoria" class="space-y-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 h-12 w-12">
              <div class="h-12 w-12 rounded-full flex items-center justify-center"
                :class="getCategoriaColor(selectedCategoria.tipo)">
                <span class="text-lg font-medium text-white">
                  {{ selectedCategoria.nombre.charAt(0).toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ selectedCategoria.nombre }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Código: {{ selectedCategoria.codigo }}
              </p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getTipoClass(selectedCategoria.tipo)">
                {{ selectedCategoria.tipo }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                :class="getEstadoClass(selectedCategoria.estado)">
                {{ selectedCategoria.estado }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Bienes Asociados</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ selectedCategoria.bienesAsociados }} bienes
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Creación</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-white">
                {{ formatDate(selectedCategoria.fechaCreacion) }}
              </p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selectedCategoria.descripcion }}
            </p>
          </div>
          <div v-if="selectedCategoria.observaciones">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones</label>
            <p class="mt-1 text-sm text-gray-900 dark:text-white">
              {{ selectedCategoria.observaciones }}
            </p>
          </div>
          <div class="flex justify-end pt-4">
            <button @click="closeViewModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de categorías inactivas -->
    <div v-if="showInactiveModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" @click.self="showInactiveModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Categorías Inactivas
        </h2>

        <div class="mb-4">
          <input v-model="inactiveSearch" type="text" placeholder="Buscar inactivas por nombre, código..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
        </div>

        <div v-if="filteredInactiveCategories.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Nombre
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Tipo
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Código
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="categoria in filteredInactiveCategories" :key="categoria.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                  {{ categoria.nombre }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getTipoClass(categoria.tipo)">
                    {{ categoria.tipo }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {{ categoria.codigo }}
                </td>
                <td class="px-4 py-3 text-sm flex items-center gap-2">
                  <button @click="reactivateCategoria(categoria)"
                    class="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 dark:text-green-400 dark:bg-green-900 dark:hover:bg-green-800 rounded-lg transition-colors font-medium">
                    Reactivar
                  </button>

                  <button :disabled="deletingId === categoria.id" @click="confirmPermanentDelete(categoria)"
                    class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:text-red-400 dark:bg-red-900 dark:hover:bg-red-800 rounded-lg transition-colors font-medium">
                    <span v-if="deletingId !== categoria.id">Eliminar</span>
                    <span v-else>Eliminando...</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">No hay categorías inactivas</p>
        </div>
        
        <div class="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button @click="showInactiveModal = false"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de bienes de categoría -->
    <div v-if="showBienesModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" @click.self="showBienesModal = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Bienes de la categoría: {{ selectedCategoriaParaBienes?.nombre }}
        </h2>
        
        <div v-if="bienesCategoria.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Código
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Nombre
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Marca
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Estado
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Responsable
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="bien in bienesCategoria" :key="bien.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                  {{ bien.codigo_institucional || bien.codigo || '-' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                  {{ bien.nombre }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {{ bien.marca || '-' }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getEstadoBienClass(bien.estado)">
                    {{ bien.estado }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {{ bien.responsable_completo || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-else class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">No hay bienes asociados a esta categoría</p>
        </div>
        
        <div class="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button @click="showBienesModal = false"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { confirm } from '@/composables/useConfirm'
import apiClient from '@/api/client'
import type { Category } from '@/types'


// Stores
const authStore = useAuthStore()
const toast = useToast()

// Control de acceso por rol
const isAdmin = computed(() => authStore.hasRole('Administrador'))

// Estado del componente
const categorias = ref<Category[]>([])
const loading = ref(false)
const tiposOptions = ref<string[]>([])

const filters = ref({
  search: '',
  tipo: '',
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showInactiveModal = ref(false)
const showBienesModal = ref(false)
const showDeleteConfirm = ref(false)
const deleteErrorMessage = ref('')
const selectedCategoria = ref<Category | null>(null)
const selectedCategoriaParaBienes = ref<Category | null>(null)
const categoriaToBDelete = ref<number | null>(null)
const bienesCategoria = ref<any[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(10)

const form = ref({
  id: null as number | null,
  nombre: '',
  codigo: '',
  tipo: '',
  descripcion: '',
  estado: '',
  observaciones: '',
})

// Id currently being permanently deleted (to disable UI)
const deletingId = ref<number | null>(null)

// Métodos de carga de datos
const loadCategorias = async () => {
  loading.value = true
  try {
    const response = await apiClient.get('/categorias')
    const data = response

    if (data.success) {
      console.log('Categorias del backend:', data.data)
      categorias.value = data.data.map((cat: any) => ({
        ...cat,

        codigo: cat.codigo || '',
        tipo: cat.tipo || 'tecnologia',
        bienesAsociados: cat.bienes_count || 0,
        fechaCreacion: cat.created_at || new Date().toISOString().split('T')[0],
        estado: cat.activo ? 'activo' : 'inactivo',
      })) || []
      console.log('Categorias mapeadas:', categorias.value)

      // Extraer tipos únicos
      const uniqueTypes = new Set(categorias.value.map((c: any) => c.tipo).filter((t: any) => t))
      tiposOptions.value = Array.from(uniqueTypes).sort()
    } else {
      throw new Error(data.message || 'Error al cargar categorías')
    }
  } catch (error) {
    toast.error('Error al cargar las categorías')
  } finally {
    loading.value = false
  }
}

const loadAllCategories = async () => {
  loading.value = true
  try {
    // Cargar categorías activas
    const activeResponse = await apiClient.get('/categorias')
    // Cargar categorías inactivas
    const inactiveResponse = await apiClient.get('/categorias?activo=false')
    
    const activeData = activeResponse.data || []
    const inactiveData = inactiveResponse.data || []
    
    // Mapear categorías activas
    const mappedActive = activeData.map((cat: any) => ({
      ...cat,
      codigo: cat.codigo || '',
      tipo: cat.tipo || 'tecnologia',
      bienesAsociados: cat.bienes_count || 0,
      fechaCreacion: cat.created_at || new Date().toISOString().split('T')[0],
      estado: cat.activo ? 'activo' : 'inactivo',
    }))
    
    // Mapear categorías inactivas
    const mappedInactive = inactiveData.map((cat: any) => ({
      ...cat,
      codigo: cat.codigo || '',
      tipo: cat.tipo || 'tecnologia',
      bienesAsociados: cat.bienes_count || 0,
      fechaCreacion: cat.created_at || new Date().toISOString().split('T')[0],
      estado: cat.activo ? 'activo' : 'inactivo',
    }))
    
    // Combinar ambas listas
    categorias.value = [...mappedActive, ...mappedInactive]
  } catch (error) {
    toast.error('Error al cargar las categorías')
  } finally {
    loading.value = false
  }
}

const addTag = (newTag: string) => {
  tiposOptions.value.push(newTag)
  form.value.tipo = newTag
}

// Filtros y búsqueda
const filteredCategorias = computed(() => {
  let result = categorias.value
  
  // Solo mostrar activas por defecto en la tabla principal
  result = result.filter((c: Category) => c.estado === 'activo')
  
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      (c: Category) =>
        c.nombre.toLowerCase().includes(search) ||
        (c.codigo && c.codigo.toLowerCase().includes(search)) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(search))
    )
  }
  if (filters.value.tipo) {
    result = result.filter((c: Category) => c.tipo === filters.value.tipo)
  }
  return result
})

// Paginación
const totalPages = computed(() =>
  Math.ceil(filteredCategorias.value.length / itemsPerPage.value)
)
const paginatedCategorias = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredCategorias.value.slice(start, start + itemsPerPage.value)
})
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const inactiveSearch = ref('')
const filteredInactiveCategories = computed(() => {
  const list = categorias.value.filter((c: Category) => c.estado === 'inactivo')
  if (!inactiveSearch.value || !inactiveSearch.value.trim()) return list
  const q = inactiveSearch.value.trim().toLowerCase()
  return list.filter((c: Category) =>
    c.nombre.toLowerCase().includes(q) ||
    (c.codigo && c.codigo.toLowerCase().includes(q)) ||
    (c.descripcion && c.descripcion.toLowerCase().includes(q))
  )
})

// Clases para badges y colores
const getTipoClass = (tipo: string): string => {
  const map: Record<string, string> = {
    tecnologia: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    mobiliario: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    equipos: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    vehiculos: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    herramientas: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return map[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const getCategoriaColor = (tipo: string): string => {
  const map: Record<string, string> = {
    tecnologia: 'bg-blue-500',
    mobiliario: 'bg-green-500',
    equipos: 'bg-purple-500',
    vehiculos: 'bg-yellow-500',
    herramientas: 'bg-red-500',
  }
  return map[tipo] || 'bg-gray-500'
}

const getEstadoClass = (estado: string): string => {
  const map: Record<string, string> = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
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
  filters.value = { search: '', tipo: '' }
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

const viewCategoria = (categoria: Category) => {
  selectedCategoria.value = categoria
  showViewModal.value = true
}

const editCategoria = (categoria: Category) => {
  form.value = {
    id: categoria.id,
    nombre: categoria.nombre,
    codigo: categoria.codigo || '',
    tipo: categoria.tipo || '',
    descripcion: categoria.descripcion || '',
    estado: categoria.estado || 'activo',
    observaciones: categoria.observaciones || '',
  }
  showEditModal.value = true
}

const toggleCategoriaStatus = async (categoria: Category) => {
  try {
    const newStatus = categoria.estado === 'activo' ? 'inactivo' : 'activo'
    const bienesCount = (categoria as any).bienesAsociados || 0
    
    // Si intenta desactivar y hay bienes asociados, mostrar error
    if (newStatus === 'inactivo' && bienesCount > 0) {
      toast.error(`No se puede desactivar la categoría: hay ${bienesCount} bien(es) asociado(s)`)
      return
    }
    
    const response = await apiClient.put(`/categorias/${categoria.id}`, {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      activo: newStatus === 'activo',
    })

    const data = response
    if (data.success) {
      const index = categorias.value.findIndex((c: Category) => c.id === categoria.id)
      if (index !== -1) {
        categorias.value[index].estado = newStatus
      }
      toast.success(`Categoría ${newStatus === 'activo' ? 'activada' : 'desactivada'} correctamente`)
    } else {
      throw new Error(data.message || 'Error al cambiar estado')
    }
  } catch (error) {
    toast.error('Error al cambiar el estado de la categoría')
  }
}

const getToggleCategoriaTitle = (categoria: Category): string => {
  const bienesCount = (categoria as any).bienesAsociados || 0
  if (categoria.estado === 'activo') {
    return bienesCount > 0 
      ? `No se puede desactivar: ${bienesCount} bien(es) asociado(s)` 
      : 'Desactivar categoría'
  }
  return 'Activar categoría'
}

const deleteCategoria = (id: number) => {
  categoriaToBDelete.value = id
  deleteErrorMessage.value = ''
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!categoriaToBDelete.value) return
  
  try {
    const response = await apiClient.delete(`/categorias/${categoriaToBDelete.value}`)
    const data = response
    if (data.success) {
      toast.success('Categoría eliminada correctamente')
      // Recargar todas las categorías (activas e inactivas)
      await loadAllCategories()
      closeDeleteConfirm()
    } else {
      // Mostrar alerta como toast
      toast.error(data.message || 'Error al eliminar la categoría')
      closeDeleteConfirm()
    }
  } catch (error: any) {
    // Mostrar alerta como toast
    const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar la categoría'
    toast.error(errorMessage)
    closeDeleteConfirm()
  }
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  deleteErrorMessage.value = ''
  categoriaToBDelete.value = null
}

const saveCategoria = async () => {
  try {
    // Validación cliente: nombre requerido
    if (!form.value.nombre || !form.value.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    // Validación cliente: evitar duplicados (case-insensitive)
    const nombreClean = form.value.nombre.trim().toLowerCase()
    const duplicate = categorias.value.find((c: Category) => c.nombre?.trim().toLowerCase() === nombreClean)
    if (duplicate && !(showEditModal.value && form.value.id === duplicate.id)) {
      toast.error('Ya existe una categoría con ese nombre')
      return
    }

    const payload = {
      nombre: form.value.nombre,
      codigo: form.value.codigo,
      tipo: form.value.tipo,
      descripcion: form.value.descripcion,
      observaciones: form.value.observaciones,
      activo: form.value.estado === 'activo',
    }

    let response
    if (showEditModal.value && form.value.id) {
      response = await apiClient.put(`/categorias/${form.value.id}`, payload)
    } else {
      response = await apiClient.post('/categorias', payload)
    }

    const data = response
    if (data.success) {
      if (showEditModal.value) {
        const index = categorias.value.findIndex((c: Category) => c.id === form.value.id)
        if (index !== -1) {
          // Recargar datos para obtener información actualizada
          await loadCategorias()
        }
        toast.success('Categoría actualizada correctamente')
      } else {
        // Recargar datos para obtener la nueva categoría
        await loadCategorias()
        toast.success('Categoría creada correctamente')
      }
      closeModal()
    } else {
      // Mostrar mensaje específico si el backend indica duplicado
      throw new Error(data.message || 'Error al guardar categoría')
    }
  } catch (error: any) {
    console.error('Error saving categoria:', error)
    const serverMessage = error.response?.data?.message || error.message
    toast.error(serverMessage || 'Error al guardar la categoría')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  form.value = {
    id: null,
    nombre: '',
    codigo: '',
    tipo: '',
    descripcion: '',
    estado: '',
    observaciones: '',
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedCategoria.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-EC', {
    timeZone: 'America/Guayaquil'
  })
}

const reactivateCategoria = async (categoria: Category) => {
  try {
    const response = await apiClient.put(`/categorias/${categoria.id}`, {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      activo: true,
    })

    const data = response
    if (data.success) {
      toast.success(`Categoría "${categoria.nombre}" reactivada correctamente`)
      // Recargar todas las categorías para actualizar la lista
      await loadAllCategories()
    } else {
      throw new Error(data.message || 'Error al reactivar categoría')
    }
  } catch (error: any) {
    console.error('Error reactivating categoria:', error)
    toast.error(error.message || 'Error al reactivar la categoría')
  }
}

const confirmPermanentDelete = async (categoria: Category) => {
  const ok = await confirm({
    title: 'Eliminar categoría definitivamente',
    message: `¿Eliminar definitivamente la categoría "${categoria.nombre}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    destructive: true,
  })

  if (!ok) return

  deletingId.value = categoria.id
  try {
    const resp = await apiClient.delete(`/categorias/${categoria.id}?force=true`)
    if (resp.success) {
      toast.success('Categoría eliminada definitivamente')
      await loadAllCategories()
    } else {
      throw new Error(resp.message || 'Error al eliminar categoría')
    }
  } catch (err: any) {
    console.error('Error deleting category permanently:', err)
    const msg = err.response?.data?.message || err.message || 'Error al eliminar categoría'
    toast.error(msg)
  } finally {
    deletingId.value = null
  }
}

const viewBienesCategoria = async (categoria: Category) => {
  try {
    selectedCategoriaParaBienes.value = categoria
    const response = await apiClient.get(`/bienes?categoria=${categoria.id}`)
    const data = response
    if (data.success) {
      // Normalizar responsable_completo igual que en la lista de bienes
      const items = Array.isArray(data.data) ? data.data : (data.data?.data || [])
      bienesCategoria.value = items.map((b: any) => ({
        ...b,
        responsable_completo: b.responsable ? (b.responsable.nombre || '').trim() : (b.responsable_completo || null)
      }))
      showBienesModal.value = true
    } else {
      toast.error('Error al cargar los bienes de la categoría')
    }
  } catch (error: any) {
    console.error('Error loading bienes:', error)
    toast.error('Error al cargar los bienes')
  }
}

// Control de acceso por rol al cargar
onMounted(async () => {
  // Cargar categorías activas e inactivas para todos los usuarios
  await loadAllCategories()
})
</script>
