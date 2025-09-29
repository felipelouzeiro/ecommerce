'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useFavoritesStore } from '@/store/favoritesStore'

interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string
  seller: {
    name: string
  }
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { user } = useAuthStore()
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const router = useRouter()

  const handleAddToCart = () => {
    if (!user) {
      router.push('/login')
      return
    }
    onAddToCart(product)
  }

  const handleToggleFavorite = () => {
    if (!user) {
      router.push('/login')
      return
    }
    toggleFavorite(product)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <svg
            className={`w-5 h-5 ${isFavorite(product.id) ? 'text-red-500' : 'text-gray-400'} transition-colors`}
            fill={isFavorite(product.id) ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {product.seller.name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-indigo-600">
            {formatPrice(product.price)}
          </span>
          
          <button
            onClick={handleAddToCart}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
