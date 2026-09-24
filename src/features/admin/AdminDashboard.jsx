import { Link } from 'react-router-dom'
import ErrorState from '@/components/ErrorState.jsx'
import LoadingState from '@/components/LoadingState.jsx'
import { useAuth } from '@/hooks/useAuth.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { adminApi } from '@/services/adminApi.js'
import './AdminDashboard.scss'

/** Tarjetas del dashboard: recuento por entidad y acceso directo. */
const CARDS = [
  { resource: 'collections', label: 'Colecciones', to: '/admin/collections' },
  { resource: 'paintings', label: 'Pinturas', to: '/admin/paintings' },
  { resource: 'exhibitions', label: 'Exhibiciones', to: '/admin/exhibitions' },
  { resource: 'design', label: 'Diseño', to: '/admin/design' },
  { resource: 'illustrations', label: 'Ilustración', to: '/admin/illustrations' },
]

/**
 * Dashboard del panel admin: bienvenida con el nombre del admin y tarjetas
 * con el recuento por entidad consumiendo GET /admin/{recurso}.
 */
const AdminDashboard = () => {
  const { user } = useAuth()
  const { data, loading, error } = useAsyncData(async (signal) => {
    const results = await Promise.all(
      CARDS.map(({ resource }) => adminApi.list(resource, { signal })),
    )
    return results.map((result, index) => ({
      ...CARDS[index],
      count: result.data.length,
    }))
  })

  return (
    <section className="admin-dashboard">
      <h1 className="admin-dashboard__title">Panel de administración</h1>
      <p className="admin-dashboard__welcome">Hola, {user?.name ?? user?.email}</p>

      {loading && <LoadingState message="Cargando recuentos…" />}
      {error && (
        <ErrorState message={error.message ?? 'No se pudieron cargar los recuentos.'} />
      )}
      {data && (
        <ul className="admin-dashboard__cards">
          {data.map((card) => (
            <li key={card.resource} className="admin-dashboard__card-item">
              <Link to={card.to} className="admin-dashboard__card">
                <h2 className="admin-dashboard__card-title">{card.label}</h2>
                <p className="admin-dashboard__card-count">
                  {card.count} {card.count === 1 ? 'elemento' : 'elementos'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AdminDashboard
