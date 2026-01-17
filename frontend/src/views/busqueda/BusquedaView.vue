<template>
  <div class="bg-gray-50 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Búsqueda Global</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Busca en toda la base de datos: bienes, ubicaciones, usuarios, documentos, alertas, mantenimientos y más.
            </p>
          </div>

          <form @submit.prevent="runSearch" class="w-full sm:w-auto">
            <div class="flex gap-2">
              <div class="relative flex-1 min-w-[280px]">
                <i class="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input v-model="query" type="text" placeholder="Buscar en todo el sistema..."
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="loading" />
              </div>
              <button type="submit"
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                :disabled="loading">
                <i class="bx bx-search-alt mr-1"></i>
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Estado de búsqueda -->
      <div v-if="!hasQuery" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <i class="bx bx-search-alt text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          Ingresa un término de búsqueda para encontrar resultados en todo el sistema.
        </p>
      </div>

      <div v-else-if="loading" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Buscando en toda la base de datos...</p>
      </div>

      <div v-else-if="results.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <i class="bx bx-x-circle text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          No se encontraron resultados para "<strong>{{ searchTerm }}</strong>"
        </p>
      </div>

      <!-- Tabla de resultados unificada -->
      <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            <i class="bx bx-list-ul mr-2"></i>
            Resultados de búsqueda
          </h2>
          <span
            class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
            {{ results.length }} resultados para "{{ searchTerm }}"
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                  Tipo
                </th>
                <th scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Título
                </th>
                <th scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Descripción
                </th>
                <th scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="item in results" :key="`${item.tipo}-${item.id}`"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                @click="openItem(item)">
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="getTipoBadgeClass(item.tipo)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                    <i :class="getTipoIcon(item.tipo)" class="mr-1"></i>
                    {{ item.tipo }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.titulo }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
                    {{ item.descripcion }}
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(item.fecha) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const query = ref(String(route.query.q || ''))
const loading = ref(false)
const results = ref([])
const searchTerm = ref('')

const hasQuery = computed(() => query.value.trim().length > 0)

const runSearch = async () => {
  const q = query.value.trim()
  searchTerm.value = q

  // Persistir en la URL
  try {
    await router.replace({ name: 'Busqueda', query: q ? { q } : {} })
  } catch {
    // ignore
  }

  if (!q) {
    results.value = []
    return
  }

  loading.value = true
  try {
    const response = await apiClient.get(`/search?q=${encodeURIComponent(q)}&limit=100`)

    if (!response.success) {
      throw new Error(response.message || 'Error en búsqueda')
    }

    results.value = response.data?.resultados || []
  } catch (error) {
    console.error('Search error:', error)
    toast.error('Error en la búsqueda')
    results.value = []
  } finally {
    loading.value = false
  }
}

const getTipoBadgeClass = (tipo) => {
  const classes = {
    'Bien': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'Ubicación': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'Usuario': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    'Categoría': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    'Mantenimiento': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
    'Alerta': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    'Documento': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    'Período': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
    'Departamento': 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200',
    'Rol': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
    'Aula Asignada': 'bg-lime-100 dark:bg-lime-900 text-lime-800 dark:text-lime-200',
  }
  return classes[tipo] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
}

const getTipoIcon = (tipo) => {
  const icons = {
    'Bien': 'bx bx-box',
    'Ubicación': 'bx bx-map-pin',
    'Usuario': 'bx bx-user',
    'Categoría': 'bx bx-category',
    'Mantenimiento': 'bx bx-wrench',
    'Alerta': 'bx bx-bell',
    'Documento': 'bx bx-file',
    'Período': 'bx bx-calendar',
    'Departamento': 'bx bx-building',
    'Rol': 'bx bx-shield',
    'Aula Asignada': 'bx bx-chalkboard',
  }
  return icons[tipo] || 'bx bx-info-circle'
}

const formatDate = (date) => {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return '—'
  }
}

const openItem = (item) => {
  // Navegar según el tipo
  switch (item.tipo) {
    case 'Bien':
      router.push({ name: 'BienDetail', params: { id: item.id } })
      break
    case 'Ubicación':
      router.push({ name: 'Ubicaciones' })
      break
    case 'Usuario':
      router.push({ name: 'Usuarios' })
      break
    case 'Mantenimiento':
      router.push({ name: 'Mantenimientos' })
      break
    case 'Alerta':
      router.push({ name: 'Alertas' })
      break
    case 'Categoría':
      router.push({ name: 'Categorias' })
      break
    case 'Período':
      router.push({ name: 'PeriodosAcademicos' })
      break
    case 'Aula Asignada':
      router.push({ name: 'AulasAsignadas' })
      break
    default:
      toast.info(`Item seleccionado: ${item.titulo}`)
  }
}

watch(
  () => route.query.q,
  (value) => {
    const next = String(value || '')
    if (next !== query.value) {
      query.value = next
      if (next.trim()) runSearch()
    }
  }
)

onMounted(() => {
  if (query.value.trim()) {
    runSearch()
  }
})
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
