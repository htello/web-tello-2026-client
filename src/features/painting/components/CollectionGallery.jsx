import { useState } from 'react'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { addBreadcrumb } from '@/infrastructure/sentry.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import { ARTIST_NAME } from '@/constants/businessRules.js'
import CollectionSkeleton from '@/components/CollectionSkeleton.jsx'
import SeoMeta from '@/components/SeoMeta.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import MasonryGrid from '@/components/MasonryGrid.jsx'
import PaintingCard from './PaintingCard.jsx'
import Lightbox from './Lightbox.jsx'
import './CollectionGallery.scss'

const CollectionGallery = ({ collectionId }) => {
  const [selectedPainting, setSelectedPainting] = useState(null)
  const { data: collection, loading, error } = useAsyncData(
    async (signal) => {
      addBreadcrumb({ category: 'ui', message: 'collection:open', data: { collectionId } })
      const res = await api.get(`/collections/${collectionId}`, { signal })
      return res.data
    },
    [collectionId],
  )

  if (loading) return <CollectionSkeleton />
  if (error) return <ErrorState message="No se pudo cargar la colección." />

  const paintings = sortByPosition(collection.paintings ?? [])

  if (paintings.length === 0) {
    return <EmptyState message="No hay obras en esta colección." />
  }

  return (
    <section className="collection-gallery">
      <SeoMeta
        title={`${collection.title} — ${ARTIST_NAME}`}
        description={collection.description || undefined}
        path={`/painting/collections/${collectionId}`}
        image={collection.coverImage ?? paintings[0]?.imageUrl}
      />
      <h1 className="collection-gallery__title">{collection.title}</h1>
      <MasonryGrid label={`Obras de ${collection.title}`}>
        {paintings.map((painting) => (
          <PaintingCard
            key={painting.id}
            painting={painting}
            onOpen={() => {
              addBreadcrumb({
                category: 'ui',
                message: 'painting:open',
                data: { paintingId: painting.id },
              })
              setSelectedPainting(painting)
            }}
          />
        ))}
      </MasonryGrid>
      <Lightbox
        isOpen={selectedPainting !== null}
        image={
          selectedPainting
            ? { src: selectedPainting.imageUrl, alt: selectedPainting.title }
            : null
        }
        onClose={() => setSelectedPainting(null)}
      />
    </section>
  )
}

export default CollectionGallery
