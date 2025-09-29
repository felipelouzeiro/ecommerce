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
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: ''
  })

  useEffect(() => {
    if (!user || user.role !== 'SELLER') {
      router.push('/')
      return
    }
    fetchProduct()
  }, [user, router, params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
        setFormData({
          name: data.product.name,
          price: data.product.price.toString(),
          description: data.product.description,
          imageUrl: data.product.imageUrl
        })
      } else {
        toast.error('Produto não encontrado')
        router.push('/products')
      }
    } catch (error) {
      toast.error('Erro ao carregar produto')
      router.push('/products')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`http://localhost:3001/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Produto atualizado com sucesso!')
        router.push('/products')
      } else {
        toast.error(data.message || 'Erro ao atualizar produto')
      }
    } catch (error) {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseInt(numbers) / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const parseCurrency = (value: string) => {
    return value.replace(/\D/g, '')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'price') {
      const numericValue = parseCurrency(value)
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Editar Produto
            </h1>
            <p className="text-gray-600">
              Atualize as informações do seu produto
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ex: Smartphone Samsung Galaxy S23"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Preço *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    R$
                  </span>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    required
                    value={formData.price ? formatCurrency(formData.price) : ''}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Descreva as características e benefícios do produto..."
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  URL da Imagem *
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  required
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Cole aqui o link da imagem do produto
                </p>
              </div>

              {/* Preview da imagem */}
              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview da Imagem
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
