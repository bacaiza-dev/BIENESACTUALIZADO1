import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)

  const setUser = (userData: User | null) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
  }

  return {
    user,
    setUser,
    clearUser,
  }
})