import { useAuth } from '@/hooks/useAuth.js'
import './AdminPanel.scss'

/**
 * Placeholder del panel admin; la Fase 10 implementa la gestión completa.
 */
const AdminPanel = () => {
  const { user, logout } = useAuth()

  return (
    <main className="admin-panel">
      <h1 className="admin-panel__title">Panel de administración</h1>
      <p className="admin-panel__welcome">Hola, {user?.name ?? user?.email}</p>
      <button type="button" className="admin-panel__logout" onClick={logout}>
        Cerrar sesión
      </button>
    </main>
  )
}

export default AdminPanel
