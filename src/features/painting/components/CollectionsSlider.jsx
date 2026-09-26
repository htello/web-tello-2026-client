import { Link } from 'react-router-dom'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import { SECTION_MIN_IMAGES } from '@/constants/businessRules.js'
import GallerySkeleton from '@/components/GallerySkeleton.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import ProtectedArtworkImage from '@/components/ProtectedArtworkImage.jsx'
import './CollectionsSlider.scss'

const CollectionsSlider = () => {
  const { data, loading, error } = useAsyncData(async (signal) => {
    const collectionsRes = await api.get('/collections', { signal })
    const collections = sortByPosition(collectionsRes.data ?? [])

    const paintingsByCollection = {}
    await Promise.all(
      collections.map(async (collection) => {
        const res = await api.get(`/collections/${collection.id}`, { signal })
        paintingsByCollection[collection.id] = res.data.paintings ?? []
      }),
    )

    return { collections, paintingsByCollection }
  })

  if (loading) return <GallerySkeleton count={3} />
  if (error) return <ErrorState message="No se pudieron cargar las colecciones." />

  const { collections, paintingsByCollection } = data

  if (collections.length === 0) {
    return <EmptyState message="No hay colecciones disponibles." />
  }

  return (
    <div className="collection-slider">
      {collections.map((collection, sectionIndex) => {
        const paintings = paintingsByCollection[collection.id] ?? []
        const featured = paintings.filter((painting) => painting.isFeatured)
        const rest = paintings.filter((painting) => !painting.isFeatured)
        let images
        if (featured.length > 0 || rest.length > 0) {
          images = [...featured, ...rest].slice(0, SECTION_MIN_IMAGES)
        } else {
          images = [{ title: collection.title, imageUrl: collection.coverImage }]
        }

        return (
          <section key={collection.id} className="collection-slider__item">
            <h2 className="collection-slider__title">
              <Link to={`/painting/collections/${collection.id}`}>{collection.title}</Link>
            </h2>
            <div className="collection-slider__slider" aria-label={`Obras de ${collection.title}`}>
              {images.map((painting, imageIndex) => {
                const isPriority = sectionIndex === 0 && imageIndex === 0
                return (
                  <ProtectedArtworkImage
                    key={painting.id ?? `cover-${collection.id}`}
                    className="collection-slider__image"
                    src={painting.imageUrl}
                    alt={painting.title}
                    loading={isPriority ? 'eager' : 'lazy'}
                    fetchPriority={isPriority ? 'high' : undefined}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default CollectionsSlider
