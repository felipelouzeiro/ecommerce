// Detectar se está rodando localmente ou no Vercel
const getApiUrl = () => {
  // Se a variável de ambiente estiver definida, usar ela
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Detectar ambiente baseado no hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001'
    }
  }
  
  // Fallback para produção
  return 'https://seu-backend.onrender.com'
}

export const API_URL = getApiUrl()
