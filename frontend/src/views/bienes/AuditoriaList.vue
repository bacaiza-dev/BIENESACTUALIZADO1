<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Auditoría del Sistema</h1>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Consulta los registros de auditoría de accesos, bienes, ubicaciones y usuarios
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filtros -->
      <div class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 mb-6">
        <div class="p-6 flex flex-col sm:flex-row gap-4">
          <div class="sm:w-48">
            <select v-model="tipoAuditoria"
              class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
              <option value="">Todos los tipos</option>
              <option value="accesos">Accesos</option>
              <option value="bienes">Bienes</option>
              <option value="ubicaciones">Ubicaciones</option>
              <option value="usuarios">Usuarios</option>
            </select>
          </div>
          <div class="flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input v-model="searchQuery" type="text" placeholder="Buscar en auditoría..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200" />
            </div>
          </div>
          <button @click="loadAuditoria"
            class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>
      <!-- Tabla de auditoría -->
      <div
        class="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acción
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Detalles
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="registro in filteredAuditoria" :key="registro.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    {{ registro.tipo }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-gray-200">{{ registro.accion }}</td>
                <td class="px-6 py-4 text-gray-900 dark:text-gray-200">{{ registro.usuario_nombre || registro.usuario || 'N/A' }}</td>
                <td class="px-6 py-4 max-w-xs truncate text-gray-900 dark:text-gray-200">
                  <span v-if="registro.detalles">{{ registro.detalles }}</span>
                  <span v-else class="text-gray-400 dark:text-gray-500">Sin detalles</span>
                </td>
                <td class="px-6 py-4 text-gray-900 dark:text-gray-200">{{ formatDate(registro.created_at || registro.fecha) }}</td>
                <td class="px-6 py-4 text-gray-900 dark:text-gray-200">{{ registro.ip_address || registro.ip || 'N/A' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Empty State -->
        <div v-if="filteredAuditoria.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No hay registros de auditoría
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ searchQuery || tipoAuditoria ? 'No se encontraron registros con los filtros aplicados.' : 'No hay registros de auditoría en el sistema.' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/api/client'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

const auditoria = ref<any[]>([])
const tipoAuditoria = ref('')
const searchQuery = ref('')
const loading = ref(false)

const loadAuditoria = async () => {
  loading.value = true
  try {
    // Attempt to fetch real logs
    const response = await apiClient.get('/logs')
    const data = response

    if (data.success && Array.isArray(data.data)) {
      auditoria.value = data.data
    } else {
      // Fallback or empty if structure differs
      auditoria.value = []
    }
  } catch (error) {
    console.warn('Error loading logs (optional feature):', error)
    toast.info('No se pudieron cargar los registros de auditoría (Backend pendiente)')
    auditoria.value = []
  } finally {
    loading.value = false
  }
}

const filteredAuditoria = computed(() => {
  let filtered = auditoria.value
  if (tipoAuditoria.value) {
    filtered = filtered.filter((r: any) => r.tipo === tipoAuditoria.value)
  }
  if (searchQuery.value) {
    filtered = filtered.filter(
      (r: any) =>
        (r.accion && r.accion.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (r.usuario && r.usuario.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (r.detalles && r.detalles.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
  }
  return filtered
})

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('es-EC', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadAuditoria()
})
</script>
