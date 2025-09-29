import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'CLIENT' | 'SELLER'
}

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      login: (user: User, token: string) => {
        set({ user, token })
      },
      
      logout: () => {
        set({ user: null, token: null })
      },
      
      isAuthenticated: () => {
        const { user, token } = get()
        return !!(user && token)
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)
