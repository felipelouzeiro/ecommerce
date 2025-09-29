'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import { getAuthToken } from '@/utils/storage'

interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string
  publishedAt: string
  seller: {
    name: string
  }
}

export default function ProductsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'SELLER') {
      router.push('/')
      return
    }
    fetchProducts()
  }, [user, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products/seller/products', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      if (response.ok) {
        toast.success('Produto excluído com sucesso!')
        fetchProducts()
      } else {
        toast.error('Erro ao excluir produto')
      }
    } catch (error) {
      toast.error('Erro de conexão')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Meus Produtos
            </h1>
            <p className="text-gray-600">
              Gerencie seus produtos e acompanhe as vendas
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push('/products/new')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              + Novo Produto
            </button>
            <button
              onClick={() => router.push('/products/upload')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              📁 Upload CSV
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece vendendo criando seu primeiro produto
            </p>
            <button
              onClick={() => router.push('/products/new')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Criar Primeiro Produto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-indigo-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(product.price)}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {new Date(product.publishedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/products/edit/${product.id}`)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
