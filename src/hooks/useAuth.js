import { useContext } from 'react'
import { AuthContext } from '@/context/authContext.js'

/**
 * Estado de autenticación admin (token, user, login, logout).
 * `isLoading` es true mientras la petición de login está en curso.
 * @returns {{ user: object | null, token: string | null, isAuthenticated: boolean, isAdmin: boolean, isLoading: boolean, login: (email: string, password: string) => Promise<object>, logout: () => void }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
