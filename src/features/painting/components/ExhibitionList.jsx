import { useState } from 'react'
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
  const [selectedId, setSelectedId] = useState(null)
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

  const selected = sorted.find((exhibition) => exhibition.id === selectedId) ?? sorted[0]
  const images = selected.images ?? []

  return (
    <section className="exhibition-list">
      <SeoMeta title={`Exposiciones — ${ARTIST_NAME}`} path="/painting/exhibitions" />
      <h1 className="exhibition-list__heading">Exposiciones</h1>
      <div className="exhibition-list__layout">
        <nav className="exhibition-list__sidebar" aria-label="Lista de exposiciones">
          <ul className="exhibition-list__items">
            {sorted.map((exhibition) => (
              <li key={exhibition.id}>
                <button
                  type="button"
                  className={
                    exhibition.id === selected.id
                      ? 'exhibition-list__item exhibition-list__item--active'
                      : 'exhibition-list__item'
                  }
                  aria-current={exhibition.id === selected.id ? 'true' : undefined}
                  onClick={() => setSelectedId(exhibition.id)}
                >
                  {exhibition.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <article className="exhibition-list__detail">
          <h2 className="exhibition-list__title">{selected.title}</h2>
          <p className="exhibition-list__date">
            {formatDateRange(selected.date, selected.endDate)}
          </p>
          <p className="exhibition-list__location">{selected.location}</p>
          {images.length > 0 && (
            <div
              className="exhibition-list__grid"
              role="group"
              aria-label={`Imágenes de ${selected.title}`}
            >
              {images.map((image, imageIndex) => {
                const isPriority = imageIndex === 0
                return (
                  <ProtectedArtworkImage
                    key={image.id ?? `img-${selected.id}-${imageIndex}`}
                    className="exhibition-list__image"
                    src={image.thumbnail ?? image.url}
                    alt={selected.title}
                    loading={isPriority ? 'eager' : 'lazy'}
                    fetchPriority={isPriority ? 'high' : undefined}
                  />
                )
              })}
            </div>
          )}
          {selected.description && (
            <p className="exhibition-list__description">{selected.description}</p>
          )}
        </article>
      </div>
    </section>
  )
}

export default ExhibitionList
