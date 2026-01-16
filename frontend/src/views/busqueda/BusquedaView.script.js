
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/client'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'BusquedaView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const toast = useToast()
    const authStore = useAuthStore()

    const isAdmin = computed(() => authStore.isAdmin)

    const query = ref(String(route.query.q || ''))
    const activeTab = ref('bienes')
    const loading = ref(false)

    const results = ref({
      bienes: [],
      ubicaciones: [],
      usuarios: [],
    })

    const hasQuery = computed(() => query.value.trim().length > 0)
    const totalResults = computed(
      () =>
        (results.value.bienes?.length || 0) +
        (results.value.ubicaciones?.length || 0) +
        (results.value.usuarios?.length || 0)
    )

    const tabClass = (tab) => {
      const base = 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
      const active = 'bg-blue-600 text-white'
      return activeTab.value === tab ? active : base
    }

    const runSearch = async () => {
      const q = query.value.trim()

      // Persistir en la URL
      try {
        await router.replace({ name: 'Busqueda', query: q ? { q } : {} })
      } catch {
        // ignore
      }

      if (!q) {
        results.value = { bienes: [], ubicaciones: [], usuarios: [] }
        return
      }

      loading.value = true
      try {
        const response = await apiClient.get(
          `/search?q=${encodeURIComponent(q)}&limit=50`
        )

        if (!response.success) {
          throw new Error(response.message || 'Error en búsqueda')
        }

        results.value = {
          bienes: response.data?.bienes || [],
          ubicaciones: response.data?.ubicaciones || [],
          usuarios: isAdmin.value ? response.data?.usuarios || [] : [],
        }

        if (!isAdmin.value && activeTab.value === 'usuarios') {
          activeTab.value = 'bienes'
        }
      } catch (error) {
        console.error('Search error:', error)
        toast.error('Error en la búsqueda')
      } finally {
        loading.value = false
      }
    }

    const openBien = (bien) => {
      if (!bien?.id) return
      router.push({ name: 'BienDetail', params: { id: bien.id } })
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

    return {
      isAdmin,
      query,
      activeTab,
      loading,
      results,
      hasQuery,
      totalResults,
      tabClass,
      runSearch,
      openBien,
    }
  },
}

