<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Aulas asignadas a custodios
            </h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Filtra por periodo y exporta el listado en Excel o PDF.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button @click="exportar('excel')"
              class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
              :disabled="loading">
              <i class="bx bx-spreadsheet mr-2"></i>
              Excel
            </button>
            <button @click="exportar('pdf')"
              class="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
              :disabled="loading">
              <i class="bx bxs-file-pdf mr-2"></i>
              PDF
            </button>
            <button v-if="isAdmin" @click="openCreateModal"
              class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              <i class="bx bx-plus mr-2"></i>
              Nueva asignación
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Periodo académico
            </label>
            <select v-model="filters.periodo_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Todos</option>
              <option v-for="p in periodos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select v-model="filters.activo"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="todos">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div v-if="isAdmin">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custodio
            </label>
            <select v-model="filters.usuario_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Todos</option>
              <option v-for="u in usuarios" :key="u.id" :value="u.id">
                {{ `${u.nombre} ${u.apellido || ''}`.trim() }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <input v-model="filters.search" type="text" placeholder="Aula, edificio o custodio..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button @click="clearFilters"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Asignaciones</h2>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ filteredAsignaciones.length }} registros
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aula
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Observaciones
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Edificio
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Capacidad
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bienes
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Custodio
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Periodo
                </th>
                <th v-if="isAdmin"
                  class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td :colspan="isAdmin ? 9 : 8" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Cargando...
                </td>
              </tr>
              <tr v-else-if="filteredAsignaciones.length === 0">
                <td :colspan="isAdmin ? 9 : 8" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  No hay asignaciones registradas
                </td>
              </tr>
              <tr v-for="a in paginatedAsignaciones" :key="a.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-gray-white">
                  <div class="font-medium">{{ a.ubicacion?.nombre }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ a.ubicacion?.aula ? `Aula: ${a.ubicacion.aula}` : '' }}
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  <button @click="isAdmin ? toggleStatus(a) : null" 
                    :class="[
                      a.activo ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200',
                      isAdmin ? 'cursor-pointer' : 'cursor-default'
                    ]"
                    class="px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1"
                    :title="isAdmin ? 'Clic para cambiar estado' : ''">
                    <i :class="a.activo ? 'bx bx-check' : 'bx bx-x'"></i>
                    {{ a.activo ? 'Activo' : 'Inactivo' }}
                  </button>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  <div :title="a.observaciones || ''" class="truncate max-w-[150px]">
                    {{ a.observaciones || '—' }}
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  <div>{{ a.ubicacion?.edificio || '—' }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ a.ubicacion?.piso ? `Piso: ${a.ubicacion.piso}` : '' }}
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {{ a.ubicacion?.capacidad ?? 0 }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  {{ a.bienes_count }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  <div class="font-medium">
                    {{ `${a.custodio?.nombre || ''} ${a.custodio?.apellido || ''}`.trim() || '—' }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ a.custodio?.email || '' }}
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                  <div class="font-medium">{{ a.periodo?.nombre || '—' }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    <span v-if="a.periodo?.fecha_inicio && a.periodo?.fecha_fin">
                      {{ a.periodo.fecha_inicio }} → {{ a.periodo.fecha_fin }}
                    </span>
                  </div>
                </td>
                <td v-if="isAdmin" class="px-4 py-3 text-right text-sm">
                  <button @click="openViewModal(a)"
                    class="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md mr-2"
                    title="Ver detalles">
                    <i class="bx bx-show mr-1"></i>
                  </button>
                  <button @click="openEditModal(a)"
                    class="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md mr-2"
                    title="Editar asignación">
                    <i class="bx bx-edit-alt mr-1"></i>
                  </button>
                  <button @click="openAssignAssetModal(a)"
                    class="inline-flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md mr-2"
                    title="Asignar bienes">
                    <i class="bx bx-package mr-1"></i>
                  </button>
                  <button @click="deleteAsignacion(a)"
                    class="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md"
                    title="Eliminar asignación">
                    <i class="bx bx-trash mr-1"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div
        class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-b-lg shadow">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="prevPage" :disabled="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
            Anterior
          </button>
          <button @click="nextPage" :disabled="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
            Siguiente
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Mostrando
              <span class="font-medium">{{ (currentPage - 1) * 10 + 1 }}</span>
              a
              <span class="font-medium">{{ Math.min(currentPage * 10, filteredAsignaciones.length) }}</span>
              de
              <span class="font-medium">{{ filteredAsignaciones.length }}</span>
              resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button @click="prevPage" :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                <span class="sr-only">Anterior</span>
                <i class="bx bx-chevron-left text-xl"></i>
              </button>
              <span
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200">
                Página {{ currentPage }} de {{ totalPages }}
              </span>
              <button @click="nextPage" :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                <span class="sr-only">Siguiente</span>
                <i class="bx bx-chevron-right text-xl"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal create/edit (Admin) -->
    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <div class="modal-panel" @click.stop>
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isEditing ? 'Editar asignación' : 'Nueva asignación' }}
          </h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>

        <div class="p-5 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aula</label>
            <select v-model="form.ubicacion_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Selecciona un aula</option>
              <option v-for="a in aulas" :key="a.id" :value="a.id">
                {{ a.nombre }}{{ a.aula ? ` (${a.aula})` : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custodio</label>
            <select v-model="form.usuario_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Selecciona un custodio</option>
              <option v-for="u in usuarios" :key="u.id" :value="u.id">
                {{ `${u.nombre} ${u.apellido || ''}`.trim() }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periodo</label>
            <select v-model="form.periodo_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Selecciona un periodo</option>
              <option v-for="p in periodos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
            <textarea v-model="form.observaciones" rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Opcional" />
          </div>
        </div>

        <div class="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button @click="closeModal"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white">
            Cancelar
          </button>
          <button @click="saveAsignacion"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
    <!-- Modal Asset Assignment -->
    <div v-if="showAssignAssetModal" class="modal-backdrop" @click="showAssignAssetModal = false">
      <div class="modal-panel max-w-2xl w-full" @click.stop>
        <div
          class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Asignar Bien a {{ selectedUbicacionForAssignment?.nombre }}
          </h3>
          <button @click="showAssignAssetModal = false"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>

        <div class="p-0">
          <!-- Tabs -->
          <div class="flex border-b border-gray-200 dark:border-gray-700">
            <button @click="activeAssignTab = 'search'"
              :class="activeAssignTab === 'search' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
              class="flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors">
              Buscar Existente
            </button>
            <button @click="activeAssignTab = 'create'"
              :class="activeAssignTab === 'create' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
              class="flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors">
              Crear Nuevos (Lote)
            </button>
          </div>

          <!-- Search Content -->
          <div v-if="activeAssignTab === 'search'" class="p-5">
            <div class="mb-4">
              <input v-model="assetSearch" type="text" placeholder="Buscar por nombre, código o marca..."
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
            </div>

            <div class="overflow-y-auto max-h-96 border rounded-lg dark:border-gray-700">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bien
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Marca
                    </th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Acción</th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-for="bien in availableBienes" :key="bien.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      <div class="font-medium">{{ bien.nombre }}</div>
                      <div class="text-xs text-gray-500">{{ bien.codigo_institucional }}</div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{{ bien.marca }}</td>
                    <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div :title="bien.observaciones || ''" class="truncate max-w-[100px]">
                        {{ bien.observaciones || '—' }}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <span :class="bien.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        class="px-2 py-1 text-xs rounded-full">
                        {{ bien.activo ? 'Activo' : 'Inactivo' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {{ new Date(bien.created_at).toLocaleDateString() }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {{ new Date(bien.updated_at).toLocaleDateString() }}
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button @click="assignAsset(bien)" :disabled="assigningAsset"
                        class="text-blue-600 hover:text-blue-800 font-medium text-sm disabled:opacity-50">
                        {{ assigningAsset ? 'Asignando...' : 'Asignar' }}
                      </button>
                    </td>
                  </tr>
                  <tr v-if="availableBienes.length === 0">
                    <td colspan="3" class="px-4 py-4 text-center text-sm text-gray-500">
                      {{ assetSearch ? 'No se encontraron bienes coincidentes' : 'No hay bienes disponibles' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Create Content -->
          <div v-else class="p-5 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Basic Info -->
              <div class="md:col-span-2">
                <h4
                  class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 border-b pb-1 dark:border-gray-700">
                  Información General</h4>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Base *</label>
                <input v-model="batchForm.nombre" type="text" placeholder="Ej. Silla Universitaria"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cantidad *</label>
                <input v-model.number="batchForm.cantidad" type="number" min="1" max="100"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría *</label>
                <select v-model="batchForm.categoria_id"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Seleccione...</option>
                  <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de
                  Adquisición</label>
                <input v-model="batchForm.fecha_adquisicion" type="date"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clase de Bien</label>
                <input v-model="batchForm.clase_de_bien" type="text" placeholder="Ej. Mobiliario"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              </div>

              <!-- Assignment Info -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                <VueMultiselect v-model="batchForm.estado" :options="estadosOpciones" :taggable="true"
                  @tag="addEstadoTag" tag-placeholder="Presiona Enter para crear" placeholder="Buscar o crear estado"
                  select-label="" deselect-label="" selected-label="Seleccionado" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periodo</label>
                <!-- Assuming 'periodos' is available in context, passed from parent or injected -->
                <select v-model="batchForm.periodo_id"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Actual</option>
                  <option v-for="p in periodos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
                </select>
              </div>

              <!-- Physical Details -->
              <div class="md:col-span-2 mt-2">
                <h4
                  class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 border-b pb-1 dark:border-gray-700">
                  Características Físicas</h4>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Marca</label>
                <input v-model="batchForm.marca" type="text" placeholder="Ej. IKEA"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
                <input v-model="batchForm.modelo" type="text"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <input v-model="batchForm.color" type="text"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Material</label>
                <input v-model="batchForm.material" type="text"
                  class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              </div>

              <!-- Codes Section -->
              <div class="md:col-span-2 mt-2">
                <div class="flex items-center justify-between border-b pb-1 mb-2 dark:border-gray-700">
                  <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Generación de Códigos</h4>
                  <div class="flex items-center">
                    <input id="auto-codes" type="checkbox" v-model="batchForm.auto_generate_codes"
                      class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                    <label for="auto-codes"
                      class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Automático</label>
                  </div>
                </div>
              </div>

              <!-- Manual Codes -->
              <template v-if="!batchForm.auto_generate_codes">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prefijo Institucional
                    *</label>
                  <input v-model="batchForm.codigo_prefix" type="text" placeholder="Ej. B-SILLA"
                    class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inicio Serie *</label>
                  <input v-model.number="batchForm.codigo_start" type="number" min="1"
                    class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>
              </template>

              <!-- Senescyt Codes -->
              <div class="md:col-span-2">
                <div class="flex items-center mb-2">
                  <input id="gen-senescyt" type="checkbox" v-model="batchForm.generate_senescyt"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                  <label for="gen-senescyt" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Incluir
                    Código
                    Senescyt</label>
                </div>
              </div>
              <template v-if="batchForm.generate_senescyt">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prefijo Senescyt
                    *</label>
                  <input v-model="batchForm.codigo_senescyt_prefix" type="text" placeholder="Ej. S-MOBI"
                    class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inicio Serie *</label>
                  <input v-model.number="batchForm.codigo_senescyt_start" type="number" min="1"
                    class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                </div>
              </template>

            </div>

            <!-- Other -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <input v-model="batchForm.descripcion" type="text"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            </div>
            <div class="mt-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
              <textarea v-model="batchForm.observaciones" rows="2"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>

            <div class="mt-6 flex justify-end">
              <button @click="createBatchAssets" :disabled="assigningAsset"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 flex items-center">
                <i v-if="assigningAsset" class="bx bx-loader-alt bx-spin mr-2"></i>
                Generar y Asignar {{ batchForm.cantidad }} bienes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- View Details Modal -->
    <div v-if="showViewModal" class="modal-backdrop" @click="closeViewModal">
      <div class="modal-panel max-w-4xl" @click.stop>
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Detalles de la Asignación</h3>
          <button @click="closeViewModal" class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <span class="sr-only">Cerrar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Info Column -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Ubicación</label>
                <div class="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {{ selectedAssignment?.ubicacion?.nombre }}
                  <span class="text-sm text-gray-500 font-normal">({{ selectedAssignment?.ubicacion?.tipo }})</span>
                </div>
                <div class="text-sm text-gray-500 mt-1">
                  Edificio: {{ selectedAssignment?.ubicacion?.edificio || '—' }} |
                  Piso: {{ selectedAssignment?.ubicacion?.piso || '—' }} |
                  Aula: {{ selectedAssignment?.ubicacion?.aula || '—' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Custodio Responsable</label>
                <div class="mt-1 text-base font-medium text-gray-900 dark:text-white">
                  {{ selectedAssignment?.custodio?.nombre }} {{ selectedAssignment?.custodio?.apellido }}
                </div>
                <div class="text-sm text-gray-500">{{ selectedAssignment?.custodio?.email }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Periodo Académico</label>
                <div class="mt-1 text-sm text-gray-900 dark:text-white">
                  {{ selectedAssignment?.periodo?.nombre }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Observaciones</label>
                <div class="mt-1 text-sm text-gray-900 dark:text-white p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {{ selectedAssignment?.observaciones || 'Sin observaciones' }}
                </div>
              </div>
            </div>

            <!-- Metadata Column -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Estado de Asignación</label>
                <div class="mt-1">
                  <span :class="selectedAssignment?.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ selectedAssignment?.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Fechas de Registro</label>
                <div class="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  <div class="flex justify-between border-b pb-1 dark:border-gray-600">
                    <span>Creado el:</span>
                    <span class="font-medium">{{ new Date(selectedAssignment?.created_at).toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between pt-1">
                    <span>Actualizado el:</span>
                    <span class="font-medium">{{ new Date(selectedAssignment?.updated_at).toLocaleString() }}</span>
                  </div>
                </div>
              </div>
              <div class="pt-4">
                <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div class="text-center">
                    <span class="block text-3xl font-bold text-blue-600 dark:text-blue-400">{{ viewModalAssets.length
                    }}</span>
                    <span class="text-sm text-blue-600 dark:text-blue-300">Total Bienes en Aula</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Assets List -->
          <div>
            <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <i class="bx bx-box mr-2"></i> Inventario de Bienes
            </h4>
            <div class="border rounded-lg dark:border-gray-700 overflow-hidden">
              <div class="max-h-60 overflow-y-auto">
                <table v-if="viewModalAssets.length > 0"
                  class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marca/Modelo</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Periodo</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="b in viewModalAssets" :key="b.id">
                      <td class="px-4 py-2 text-xs font-mono text-gray-500">{{ b.codigo_institucional }}</td>
                      <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">{{ b.nombre }}</td>
                      <td class="px-4 py-2 text-sm text-gray-500">
                        {{ b.marca }} {{ b.modelo ? '- ' + b.modelo : '' }}
                      </td>
                      <td class="px-4 py-2 text-xs">
                        <span :class="{
                          'bg-green-100 text-green-800': b.estado === 'ACTIVO' || b.estado === 'BUENO',
                          'bg-yellow-100 text-yellow-800': b.estado === 'EN MANTENIMIENTO' || b.estado === 'REGULAR',
                          'bg-red-100 text-red-800': b.estado === 'DAÑADO' || b.estado === 'BAJA'
                        }" class="px-2 py-0.5 rounded-full text-xs font-medium">
                          {{ b.estado }}
                        </span>
                      </td>
                      <td class="px-4 py-2 text-xs text-gray-500">
                        {{ b.periodo_id ? 'Actual' : 'N/A' }}
                      </td>
                      <td class="px-4 py-2 text-right">
                        <button @click="editAssetRedirect(b)" class="text-blue-600 hover:text-blue-800 mr-2"
                          title="Ir a editar">
                          <i class="bx bx-link-external"></i>
                        </button>
                        <button @click="removeAssetFromRoom(b)" class="text-red-600 hover:text-red-800"
                          title="Quitar del aula">
                          <i class="bx bx-unlink"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else-if="loadingIds" class="p-8 text-center text-gray-500">
                  <i class="bx bx-loader-alt bx-spin text-2xl mb-2"></i>
                  <p>Cargando bienes...</p>
                </div>
                <div v-else class="p-8 text-center text-gray-500">
                  No hay bienes asignados a esta ubicación.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="px-5 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end rounded-b-lg">
          <button @click="closeViewModal"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirm Assignment with Evidence -->
    <div v-if="showConfirmAssignModal" class="modal-backdrop" @click="showConfirmAssignModal = false">
      <div class="modal-panel max-w-lg w-full" @click.stop>
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Confirmar Asignación
          </h3>
          <button @click="showConfirmAssignModal = false"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
            <i class="bx bx-x text-2xl"></i>
          </button>
        </div>
        <div class="p-5 space-y-4">
          <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            Estás a punto de asignar el bien <strong>{{ pendingAssignAsset?.nombre }}</strong> ({{
              pendingAssignAsset?.codigo_institucional }}) a <strong>{{ selectedUbicacionForAssignment?.nombre
              }}</strong>.
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observaciones
            </label>
            <textarea v-model="confirmAssignData.observaciones" rows="3"
              class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Estado del bien, condiciones de entrega, etc."></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Evidencia (Opcional)
            </label>
            <div
              class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer relative">
              <input type="file" @change="e => confirmAssignData.file = e.target.files[0]"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf" />
              <div class="space-y-1 text-center">
                <i class="bx bx-cloud-upload text-3xl text-gray-400"></i>
                <div class="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <span class="font-medium text-blue-600 hover:text-blue-500">Sube un archivo</span>
                  <p class="pl-1">o arrástralo aquí</p>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ confirmAssignData.file ? confirmAssignData.file.name : 'PNG, JPG, PDF hasta 10MB' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button @click="showConfirmAssignModal = false"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-700 dark:text-white">
            Cancelar
          </button>
          <button @click="confirmAssignment" :disabled="assigningAsset"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center">
            <i v-if="assigningAsset" class="bx bx-loader-alt bx-spin mr-2"></i>
            Confirmar Asignación
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AulasAsignadasList.script.js"></script>

<style scoped src="./AulasAsignadasList.style.scoped.css"></style>
