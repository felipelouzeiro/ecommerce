'use client'

import { useState } from 'react'

interface FilterSidebarProps {
  filters: {
    minPrice: string
    maxPrice: string
  }
  setFilters: (filters: any) => void
}

export default function FilterSidebar({ filters, setFilters }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const amount = parseInt(numbers) / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const parseCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers ? (parseInt(numbers) / 100).toString() : ''
  }

  const handleFilterChange = (key: string, value: string) => {
    const numericValue = parseCurrency(value)
    const newFilters = {
      ...localFilters,
      [key]: numericValue
    }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    setFilters(localFilters)
  }

  const clearFilters = () => {
    const cleared = { minPrice: '', maxPrice: '' }
    setLocalFilters(cleared)
    setFilters(cleared)
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Limpar
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preço Mínimo
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              R$
            </span>
            <input
              type="text"
              placeholder="0,00"
              value={localFilters.minPrice ? formatCurrency(localFilters.minPrice) : ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preço Máximo
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
              R$
            </span>
            <input
              type="text"
              placeholder="1.000,00"
              value={localFilters.maxPrice ? formatCurrency(localFilters.maxPrice) : ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full pl-8 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={applyFilters}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>
  )
}
