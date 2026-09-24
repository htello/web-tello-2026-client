import { useEffect, useState } from 'react'
import { api } from '@/services/api.js'
import { usePortfolioContext } from '@/context/PortfolioContext.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import CollectionCard from './CollectionCard.jsx'
import './CollectionsSlider.scss'

const CollectionsSlider = () => {
  const {
    collections,
    loading: collectionsLoading,
    error: collectionsError,
  } = usePortfolioContext()
  const [paintingsByCollection, setPaintingsByCollection] = useState(null)
  const [errorPaintings, setErrorPaintings] = useState(null)

  useEffect(() => {
    if (collections.length === 0) return undefined

    let cancelled = false

    async function load() {
      try {
        const byCollection = {}
        await Promise.all(
          sortByPosition(collections).map(async (collection) => {
            const res = await api.get(`/collections/${collection.id}`)
            byCollection[collection.id] = res.data.paintings ?? []
          }),
        )
        if (!cancelled) setPaintingsByCollection(byCollection)
      } catch (err) {
        if (!cancelled) setErrorPaintings(err)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [collections])

  if (collectionsLoading) return <LoadingState />
  if (collectionsError) return <ErrorState message="No se pudieron cargar las colecciones." />
  if (collections.length === 0) {
    return <EmptyState message="No hay colecciones disponibles." />
  }
  if (paintingsByCollection === null) return <LoadingState />
  if (errorPaintings) return <ErrorState message="No se pudieron cargar las colecciones." />

  return (
    <div className="collection-slider">
      {sortByPosition(collections).map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          paintings={paintingsByCollection[collection.id] ?? []}
        />
      ))}
    </div>
  )
}

export default CollectionsSlider
