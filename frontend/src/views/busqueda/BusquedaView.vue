<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Búsqueda</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Consulta bienes, ubicaciones y (si eres admin) usuarios desde un solo lugar.
            </p>
          </div>

          <form @submit.prevent="runSearch" class="w-full sm:w-auto">
            <div class="flex gap-2">
              <div class="relative flex-1 min-w-[220px]">
                <i class="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  v-model="query"
                  type="text"
                  placeholder="Buscar por código, nombre, custodio, ubicación..."
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="loading"
                />
              </div>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                :disabled="loading"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- Tabs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="tabClass('bienes')"
            @click="activeTab = 'bienes'"
          >
            Bienes <span class="ml-1 text-xs opacity-75">({{ results.bienes.length }})</span>
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="tabClass('ubicaciones')"
            @click="activeTab = 'ubicaciones'"
          >
            Ubicaciones <span class="ml-1 text-xs opacity-75">({{ results.ubicaciones.length }})</span>
          </button>
          <button
            v-if="isAdmin"
            type="button"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="tabClass('usuarios')"
            @click="activeTab = 'usuarios'"
          >
            Usuarios <span class="ml-1 text-xs opacity-75">({{ results.usuarios.length }})</span>
          </button>
        </div>

        <div v-if="!hasQuery" class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Ingresa un término y presiona “Buscar”.
        </div>
        <div v-else-if="loading" class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Buscando...
        </div>
        <div v-else-if="totalResults === 0" class="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Sin resultados para “{{ query.trim() }}”.
        </div>
      </div>

      <!-- Results -->
      <div v-if="hasQuery && !loading && totalResults > 0" class="space-y-6">
        <!-- Bienes -->
        <div v-if="activeTab === 'bienes'" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Bienes</h2>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ results.bienes.length }} resultados
            </div>
          </div>

          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <button
              v-for="b in results.bienes"
              :key="b.id"
              type="button"
              class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
              @click="openBien(b)"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ b.nombre }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {{ b.codigo_institucional }}
                    <span v-if="b.clase_de_bien">· {{ b.clase_de_bien }}</span>
                    <span v-if="b.categoria?.nombre">· {{ b.categoria.nombre }}</span>
                    <span v-if="b.ubicacion?.nombre">· {{ b.ubicacion.nombre }}</span>
                    <span v-if="b.responsable?.nombre">· {{ b.responsable.nombre }} {{ b.responsable.apellido || '' }}</span>
                  </div>
                </div>
                <div class="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  ID {{ b.id }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Ubicaciones -->
        <div
          v-else-if="activeTab === 'ubicaciones'"
          class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Ubicaciones</h2>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ results.ubicaciones.length }} resultados
            </div>
          </div>

          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div v-for="u in results.ubicaciones" :key="u.id" class="px-4 py-3">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ u.nombre }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {{ u.tipo }} · {{ u.edificio || '—' }} <span v-if="u.aula">· {{ u.aula }}</span>
                  </div>
                </div>
                <div class="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  Bienes: {{ u.bienesAsignados ?? 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Usuarios -->
        <div
          v-else-if="activeTab === 'usuarios' && isAdmin"
          class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Usuarios</h2>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ results.usuarios.length }} resultados
            </div>
          </div>

          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div v-for="u in results.usuarios" :key="u.id" class="px-4 py-3">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {{ `${u.nombre || ''} ${u.apellido || ''}`.trim() }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {{ u.email }} <span v-if="u.departamento">· {{ u.departamento }}</span>
                  </div>
                </div>
                <div class="flex-shrink-0 text-xs" :class="u.activo ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ u.activo ? 'Activo' : 'Inactivo' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./BusquedaView.script.js"></script>
<style scoped src="./BusquedaView.style.scoped.css"></style>

