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
import MasterDetail from '@/components/MasterDetail.jsx'
import SectionHeader from '@/components/SectionHeader.jsx'
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
      <SeoMeta title={`Exposiciones — ${ARTIST_NAME}`} path="/pintura/exposiciones" />
      <SectionHeader title="Exposiciones" />
      <MasterDetail
        items={sorted.map((exhibition) => ({ id: exhibition.id, title: exhibition.title }))}
        selectedId={selected.id}
        onSelect={setSelectedId}
        label="Lista de exposiciones"
        detailClassName="exhibition-list__detail"
      >
        <h2 className="master-detail__title">{selected.title}</h2>
        <p className="exhibition-list__date">
          {formatDateRange(selected.date, selected.endDate)}
        </p>
        <p className="exhibition-list__location">{selected.location}</p>
        {selected.description && (
          <p className="exhibition-list__description">{selected.description}</p>
        )}
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
      </MasterDetail>
    </section>
  )
}

export default ExhibitionList
