import { useToast } from 'vue-toastification'
import { useUIStore } from '@/stores/ui'

export function useErrorHandler() {
  const toast = useToast()
  const uiStore = useUIStore()

  const handleError = (error: any, context: string = 'Operación') => {
    console.error(`Error en ${context}:`, error)
    
    // Ensure loading is turned off
    uiStore.setLoading(false)

    // Show user-friendly error message
    const message = error?.message || error?.data?.message || `Error en ${context}`
    toast.error(message)

    // Return false to indicate failure
    return false
  }

  const handleSuccess = (message: string = 'Operación exitosa') => {
    toast.success(message)
    return true
  }

  return {
    handleError,
    handleSuccess
  }
}