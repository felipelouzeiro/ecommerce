export const getAuthToken = (): string => {
  if (typeof window === 'undefined') return ''
  
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token || ''
    }
    return ''
  } catch {
    return ''
  }
}
