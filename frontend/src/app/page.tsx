'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import ProductGrid from '@/components/ProductGrid'
import SearchBar from '@/components/SearchBar'
import FilterSidebar from '@/components/FilterSidebar'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: ''
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar de filtros */}
          <aside className="w-72">
            <FilterSidebar 
              filters={filters} 
              setFilters={setFilters} 
            />
          </aside>

          {/* Conteúdo principal */}
          <div className="flex-1">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Produtos
                  </h1>
                  <p className="text-gray-600">
                    Encontre os melhores produtos para você
                  </p>
                </div>
              </div>
              
              <div className="max-w-md">
                <SearchBar 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </div>
            </div>

            <ProductGrid 
              searchTerm={searchTerm}
              filters={filters}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
