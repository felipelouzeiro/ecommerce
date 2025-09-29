'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { items } = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const cartItemsCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            Loja Online
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-indigo-600 transition-colors">
              Produtos
            </Link>
            
            {user ? (
              <>
                {user.role === 'SELLER' && (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/products/new" className="text-gray-700 hover:text-indigo-600 transition-colors">
                      Novo Produto
                    </Link>
                  </>
                )}
                
                {user.role === 'CLIENT' && (
                  <>
                    <Link href="/favorites" className="text-gray-700 hover:text-indigo-600 transition-colors">
                      Favoritos
                    </Link>
                    <Link href="/orders" className="text-gray-700 hover:text-indigo-600 transition-colors">
                      Pedidos
                    </Link>
                    <Link href="/cart" className="relative text-gray-700 hover:text-indigo-600 transition-colors">
                      Carrinho
                      {cartItemsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartItemsCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Olá, {user.name}</span>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-indigo-600 transition-colors">
                  Entrar
                </Link>
                <Link 
                  href="/register" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </nav>

          {/* Menu Mobile */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menu Mobile Aberto */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-primary-600">
                Produtos
              </Link>
              
              {user ? (
                <>
                  {user.role === 'SELLER' && (
                    <>
                      <Link href="/dashboard" className="text-gray-700 hover:text-primary-600">
                        Dashboard
                      </Link>
                      <Link href="/products/new" className="text-gray-700 hover:text-primary-600">
                        Novo Produto
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'CLIENT' && (
                    <>
                      <Link href="/favorites" className="text-gray-700 hover:text-primary-600">
                        Favoritos
                      </Link>
                      <Link href="/orders" className="text-gray-700 hover:text-primary-600">
                        Pedidos
                      </Link>
                    </>
                  )}

                  <Link href="/cart" className="text-gray-700 hover:text-primary-600">
                    Carrinho ({cartItemsCount})
                  </Link>

                  <div className="pt-4 border-t">
                    <span className="text-gray-700">Olá, {user.name}</span>
                    <button
                      onClick={logout}
                      className="block mt-2 text-gray-700 hover:text-primary-600"
                    >
                      Sair
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/login" className="text-gray-700 hover:text-primary-600">
                    Entrar
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-center"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
