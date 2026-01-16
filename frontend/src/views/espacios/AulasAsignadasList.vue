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
            <button
              @click="exportar('excel')"
              class="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
              :disabled="loading"
            >
              <i class="bx bx-spreadsheet mr-2"></i>
              Excel
            </button>
            <button
              @click="exportar('pdf')"
              class="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition-colors"
              :disabled="loading"
            >
              <i class="bx bxs-file-pdf mr-2"></i>
              PDF
            </button>
            <button
              v-if="isAdmin"
              @click="openCreateModal"
              class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
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
            <select
              v-model="filters.periodo_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos</option>
              <option v-for="p in periodos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>

          <div v-if="isAdmin">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custodio
            </label>
            <select
              v-model="filters.usuario_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
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
            <input
              v-model="filters.search"
              type="text"
              placeholder="Aula, edificio o custodio..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button
            @click="clearFilters"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
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
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Aula
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Edificio
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Capacidad
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Bienes
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Custodio
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Periodo
                </th>
                <th
                  v-if="isAdmin"
                  class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="loading">
                <td :colspan="isAdmin ? 7 : 6" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  Cargando...
                </td>
              </tr>
              <tr v-else-if="filteredAsignaciones.length === 0">
                <td :colspan="isAdmin ? 7 : 6" class="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                  No hay asignaciones registradas
                </td>
              </tr>
              <tr v-for="a in filteredAsignaciones" :key="a.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">
                  <div class="font-medium">{{ a.ubicacion?.nombre }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ a.ubicacion?.aula ? `Aula: ${a.ubicacion.aula}` : '' }}
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
                  {{ a.ubicacion?.bienesAsignados ?? 0 }}
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
                  <button
                    @click="openEditModal(a)"
                    class="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md mr-2"
                  >
                    <i class="bx bx-edit-alt mr-1"></i>
                    Editar
                  </button>
                  <button
                    @click="deleteAsignacion(a)"
                    class="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    <i class="bx bx-trash mr-1"></i>
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
            <select
              v-model="form.ubicacion_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona un aula</option>
              <option v-for="a in aulas" :key="a.id" :value="a.id">
                {{ a.nombre }}{{ a.aula ? ` (${a.aula})` : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custodio</label>
            <select
              v-model="form.usuario_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona un custodio</option>
              <option v-for="u in usuarios" :key="u.id" :value="u.id">
                {{ `${u.nombre} ${u.apellido || ''}`.trim() }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Periodo</label>
            <select
              v-model="form.periodo_id"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">Selecciona un periodo</option>
              <option v-for="p in periodos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones</label>
            <textarea
              v-model="form.observaciones"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Cancelar
          </button>
          <button
            @click="saveAsignacion"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            :disabled="saving"
          >
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AulasAsignadasList.script.js"></script>

<style scoped src="./AulasAsignadasList.style.scoped.css"></style>

