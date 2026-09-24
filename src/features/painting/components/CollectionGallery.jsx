import { useState } from 'react'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import PaintingCard from './PaintingCard.jsx'
import Lightbox from './Lightbox.jsx'
import './CollectionGallery.scss'

const CollectionGallery = ({ collectionId }) => {
  const [selectedPainting, setSelectedPainting] = useState(null)
  const { data: collection, loading, error } = useAsyncData(
    async (signal) => {
      const res = await api.get(`/collections/${collectionId}`, { signal })
      return res.data
    },
    [collectionId],
  )

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No se pudo cargar la colección." />

  const paintings = sortByPosition(collection.paintings ?? [])

  if (paintings.length === 0) {
    return <EmptyState message="No hay obras en esta colección." />
  }

  return (
    <section className="collection-gallery">
      <h2 className="collection-gallery__title">{collection.title}</h2>
      <div className="collection-gallery__grid">
        {paintings.map((painting) => (
          <PaintingCard
            key={painting.id}
            painting={painting}
            onOpen={() => setSelectedPainting(painting)}
          />
        ))}
      </div>
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
