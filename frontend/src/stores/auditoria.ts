import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuditoriaStore = defineStore('auditoria', () => {
  // Estado: bienes seleccionados por usuario
  const bienesSeleccionados = ref<{ [userId: string]: number[] }>({})

  // Getters
  const getContadorBienes = (userId: string): number => {
    return bienesSeleccionados.value[userId]?.length || 0
  }

  const getBienesSeleccionados = (userId: string): number[] => {
    return bienesSeleccionados.value[userId] || []
  }

  // Actions
  const seleccionarBien = (userId: string, bienId: number) => {
    if (!bienesSeleccionados.value[userId]) {
      bienesSeleccionados.value[userId] = []
    }
    if (!bienesSeleccionados.value[userId].includes(bienId)) {
      bienesSeleccionados.value[userId].push(bienId)
    }
  }

  const deseleccionarBien = (userId: string, bienId: number) => {
    if (bienesSeleccionados.value[userId]) {
      const index = bienesSeleccionados.value[userId].indexOf(bienId)
      if (index > -1) {
        bienesSeleccionados.value[userId].splice(index, 1)
      }
    }
  }

  const toggleSeleccionBien = (userId: string, bienId: number) => {
    if (bienesSeleccionados.value[userId]?.includes(bienId)) {
      deseleccionarBien(userId, bienId)
    } else {
      seleccionarBien(userId, bienId)
    }
  }

  const limpiarSeleccionUsuario = (userId: string) => {
    delete bienesSeleccionados.value[userId]
  }

  const limpiarTodasSelecciones = () => {
    bienesSeleccionados.value = {}
  }

  return {
    // Estado
    bienesSeleccionados,

    // Getters
    getContadorBienes,
    getBienesSeleccionados,

    // Actions
    seleccionarBien,
    deseleccionarBien,
    toggleSeleccionBien,
    limpiarSeleccionUsuario,
    limpiarTodasSelecciones
  }
})