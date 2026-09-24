import { useEffect, useState } from 'react'
import { api } from '@/services/api.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import PaintingCard from './PaintingCard.jsx'
import Lightbox from './Lightbox.jsx'
import './CollectionGallery.scss'

const CollectionGallery = ({ collectionId }) => {
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPainting, setSelectedPainting] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data } = await api.get(`/collections/${collectionId}`)
        if (!cancelled) setCollection(data)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [collectionId])

  if (loading) return <p className="collection-gallery__status">Cargando…</p>
  if (error) return <p className="collection-gallery__status">No se pudo cargar la colección.</p>

  const paintings = sortByPosition(collection.paintings ?? [])

  if (paintings.length === 0) {
    return <p className="collection-gallery__status">No hay obras en esta colección.</p>
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
