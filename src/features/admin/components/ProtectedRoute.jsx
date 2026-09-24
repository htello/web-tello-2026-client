import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.js'
import LoadingState from '@/components/LoadingState.jsx'

/**
 * Puerta del panel admin: exige token y rol ADMIN.
 * Muestra carga mientras se restaura la sesión; redirige al login si no.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) return <LoadingState message="Verificando sesión…" />
  if (!isAuthenticated || !isAdmin) return <Navigate to="/admin/login" replace />
  return <Outlet />
}

export default ProtectedRoute
