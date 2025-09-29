'use client'

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { useCartStore } from '@/store/cartStore'

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

interface ProductGridProps {
  searchTerm: string
  filters: {
    minPrice: string
    maxPrice: string
  }
}

export default function ProductGrid({ searchTerm, filters }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })
  
  const { addItem } = useCartStore()

  const fetchProducts = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice })
      })

      const response = await fetch(`http://localhost:3001/api/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(1)
  }, [searchTerm, filters])

  const handleAddToCart = (product: Product) => {
    addItem(product)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-6 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum produto encontrado</p>
        </div>
      )}

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => fetchProducts(i + 1)}
                className={`px-3 py-2 rounded-lg ${
                  pagination.page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
