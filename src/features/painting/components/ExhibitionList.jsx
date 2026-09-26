import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { formatDateRange } from '@/utils/formatDate.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import { ARTIST_NAME } from '@/constants/businessRules.js'
import SeoMeta from '@/components/SeoMeta.jsx'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import ProtectedArtworkImage from '@/components/ProtectedArtworkImage.jsx'
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
    <section className="exhibition-list">
      <SeoMeta title={`Exposiciones — ${ARTIST_NAME}`} path="/painting/exhibitions" />
      <h1 className="exhibition-list__heading">Exposiciones</h1>
      {sorted.map((exhibition, sectionIndex) => {
        const images = exhibition.images ?? []
        return (
          <section key={exhibition.id} className="exhibition-list__item">
            <h2 className="exhibition-list__title">{exhibition.title}</h2>
            <p className="exhibition-list__date">
              {formatDateRange(exhibition.date, exhibition.endDate)}
            </p>
            <p className="exhibition-list__location">{exhibition.location}</p>
            {images.length > 0 && (
              <div
                className="exhibition-list__slider"
                aria-label={`Imágenes de ${exhibition.title}`}
              >
                {images.map((image, imageIndex) => {
                  const isPriority = sectionIndex === 0 && imageIndex === 0
                  return (
                    <ProtectedArtworkImage
                      key={image.id ?? `${exhibition.id}-${imageIndex}`}
                      className="exhibition-list__image"
                      src={image.thumbnail ?? image.url}
                      alt={exhibition.title}
                      loading={isPriority ? 'eager' : 'lazy'}
                      fetchPriority={isPriority ? 'high' : undefined}
                    />
                  )
                })}
              </div>
            )}
            {exhibition.description && (
              <p className="exhibition-list__description">{exhibition.description}</p>
            )}
          </section>
        )
      })}
    </section>
  )
}

export default ExhibitionList
