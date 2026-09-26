import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import GallerySkeleton from '@/components/GallerySkeleton.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import CollectionCard from './CollectionCard.jsx'
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
      <h2 className="collection-slider__title">Colecciones</h2>
      {collections.map((collection, index) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          paintings={paintingsByCollection[collection.id] ?? []}
          priority={index === 0}
        />
      ))}
    </div>
  )
}

export default CollectionsSlider
