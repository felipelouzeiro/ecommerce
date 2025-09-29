import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    imageUrl: string
  }
  quantity: number
}

// Função para obter a chave de armazenamento baseada no usuário
const getCartStorageKey = () => {
  if (typeof window === 'undefined') return 'cart-storage'
  
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      const userId = parsed.state?.user?.id
      return userId ? `cart-storage-${userId}` : 'cart-storage'
    }
  } catch {
    // Ignore errors during SSR
  }
  return 'cart-storage'
}

interface CartState {
  items: CartItem[]
  addItem: (product: any, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemsCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: any, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          }
          
          return {
            items: [...state.items, {
              id: `${product.id}-${Date.now()}`,
              product,
              quantity
            }]
          }
        })
      },
      
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      },
      
      getItemsCount: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      }
    }),
    {
      name: getCartStorageKey(),
    }
  )
)
