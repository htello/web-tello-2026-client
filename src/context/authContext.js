import { createContext } from 'react'

/**
 * Contexto de autenticación admin. Se consume con el hook `useAuth`.
 * @type {import('react').Context<{ user: object | null, token: string | null, isAuthenticated: boolean, isAdmin: boolean, isLoading: boolean, login: (email: string, password: string) => Promise<object>, logout: () => void } | null>}
 */
export const AuthContext = createContext(null)
