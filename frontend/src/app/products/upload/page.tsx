'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Header from '@/components/Header'
import { API_URL } from '@/config/api'

export default function UploadProductsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
      } else {
        toast.error('Por favor, selecione um arquivo CSV')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Selecione um arquivo CSV')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('csv', file)

    try {
      const response = await fetch(`${API_URL}/api/products/upload-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state.token : ''}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        router.push('/products')
      } else {
        toast.error(data.message || 'Erro ao fazer upload')
      }
    } catch (error) {
      toast.error('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'SELLER') {
    router.push('/')
    return null
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
              Upload de Produtos
            </h1>
            <p className="text-gray-600">
              Faça upload de múltiplos produtos via arquivo CSV
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="csv" className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo CSV *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    id="csv"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="csv" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600 mb-2">
                      Clique para selecionar um arquivo CSV
                    </p>
                    <p className="text-xs text-gray-500">
                      ou arraste e solte aqui
                    </p>
                  </label>
                </div>
                {file && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Arquivo selecionado: {file.name}
                    </p>
                  </div>
                )}
              </div>

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
                  disabled={loading || !file}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Fazendo Upload...' : 'Fazer Upload'}
                </button>
              </div>
            </form>
          </div>

          {/* Instruções */}
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              📋 Formato do Arquivo CSV
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>O arquivo CSV deve ter as seguintes colunas (na primeira linha):</p>
              <div className="bg-white rounded-lg p-4 mt-3">
                <code className="text-sm">
                  nome,preco,descricao,url_imagem
                </code>
              </div>
              <p className="mt-3">Exemplo de linha:</p>
              <div className="bg-white rounded-lg p-4">
                <code className="text-sm">
                  Smartphone Samsung,2999.90,Smartphone premium com câmera de 50MP,https://exemplo.com/img.jpg
                </code>
              </div>
            </div>
          </div>

          {/* Download do template */}
          <div className="mt-6 bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              📥 Template de Exemplo
            </h3>
            <p className="text-sm text-green-800 mb-4">
              Baixe nosso template com exemplos para facilitar o preenchimento:
            </p>
            <a
              href="/produtos_exemplo.csv"
              download="produtos_exemplo.csv"
              className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Baixar Template
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
