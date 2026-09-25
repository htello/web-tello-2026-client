import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { formatDateRange } from '@/utils/formatDate.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import { ARTIST_NAME } from '@/constants/businessRules.js'
import SeoMeta from '@/components/SeoMeta.jsx'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import './ExhibitionList.scss'

const ExhibitionList = () => {
  const { data, loading, error } = useAsyncData(async (signal) => {
    const res = await api.get('/exhibitions', { signal })
    return res.data ?? []
  })

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No se pudieron cargar las exposiciones." />

  const sorted = sortByPosition(data)

  if (sorted.length === 0) {
    return <EmptyState message="No hay exposiciones disponibles." />
  }

  return (
    <section>
      <SeoMeta title={`Exposiciones — ${ARTIST_NAME}`} path="/painting/exhibitions" />
      <h1 className="exhibition-list__heading">Exposiciones</h1>
      <ul className="exhibition-list">
        {sorted.map((exhibition) => (
          <li key={exhibition.id} className="exhibition-list__item">
            <h2 className="exhibition-list__title">{exhibition.title}</h2>
            <p className="exhibition-list__date">
              {formatDateRange(exhibition.date, exhibition.endDate)}
            </p>
            <p className="exhibition-list__location">{exhibition.location}</p>
            {exhibition.description && (
              <p className="exhibition-list__description">{exhibition.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ExhibitionList
