import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, setAuthToken, setUnauthorizedHandler } from '@/services/api.js'
import { addBreadcrumb, clearUserContext, setUserContext } from '@/infrastructure/sentry.js'
import { AuthContext } from './authContext.js'

const SESSION_KEY = 'admin_session'

/**
 * Lee la sesión persistida en sessionStorage (nunca localStorage).
 * @returns {{ token: string, user: object } | null}
 */
function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Proveedor de autenticación admin: token en memoria + sessionStorage.
 * @param {{ children: import('react').ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readSession)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setAuthToken(session?.token ?? null)
    if (session?.user) setUserContext(session.user)
    else clearUserContext()
  }, [session])

  /**
   * POST /auth/login; persiste token+user y devuelve el usuario.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} usuario autenticado
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const nextSession = { token: data.token, user: data.user }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
      setAuthToken(data.token)
      setSession(nextSession)
      addBreadcrumb({ category: 'auth', message: 'auth:login:success' })
      return data.user
    } finally {
      setIsLoading(false)
    }
  }, [])

  /** Limpia la sesión por completo (memoria y sessionStorage). */
  const logout = useCallback(() => {
    addBreadcrumb({ category: 'auth', message: 'auth:logout' })
    sessionStorage.removeItem(SESSION_KEY)
    setAuthToken(null)
    setSession(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    return () => setUnauthorizedHandler(null)
  }, [logout])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      isAdmin: session?.user?.role === 'ADMIN',
      isLoading,
      login,
      logout,
    }),
    [session, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
