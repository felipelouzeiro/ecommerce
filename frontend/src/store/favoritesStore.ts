import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Favorite {
  id: string
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
  }
  createdAt: string
}

// Função para obter a chave de armazenamento baseada no usuário
const getStorageKey = () => {
  if (typeof window === 'undefined') return 'favorites-storage'
  
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage)
      const userId = parsed.state?.user?.id
      return userId ? `favorites-storage-${userId}` : 'favorites-storage'
    } catch {
      return 'favorites-storage'
    }
  }
  return 'favorites-storage'
}

interface FavoritesState {
  favorites: Favorite[]
  addFavorite: (product: any) => void
  removeFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  toggleFavorite: (product: any) => void
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (product: any) => {
        set((state) => {
          const existingFavorite = state.favorites.find(fav => fav.product.id === product.id)
          if (existingFavorite) return state
          
          return {
            favorites: [...state.favorites, {
              id: `${product.id}-${Date.now()}`,
              product,
              createdAt: new Date().toISOString()
            }]
          }
        })
      },
      
      removeFavorite: (productId: string) => {
        set((state) => ({
          favorites: state.favorites.filter(fav => fav.product.id !== productId)
        }))
      },
      
      isFavorite: (productId: string) => {
        const { favorites } = get()
        return favorites.some(fav => fav.product.id === productId)
      },
      
      toggleFavorite: (product: any) => {
        const { isFavorite, addFavorite, removeFavorite } = get()
        
        if (isFavorite(product.id)) {
          removeFavorite(product.id)
        } else {
          addFavorite(product)
        }
      },
      
      clearFavorites: () => {
        set({ favorites: [] })
      }
    }),
    {
      name: getStorageKey(),
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
)
