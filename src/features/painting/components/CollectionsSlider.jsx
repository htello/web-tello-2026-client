import { useEffect, useState } from 'react'
import { api } from '@/services/api.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import CollectionCard from './CollectionCard.jsx'
import './CollectionsSlider.scss'

const CollectionsSlider = () => {
  const [collections, setCollections] = useState([])
  const [paintingsByCollection, setPaintingsByCollection] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data } = await api.get('/collections')
        const sorted = sortByPosition(data)
        if (cancelled) return
        setCollections(sorted)

        const byCollection = {}
        await Promise.all(
          sorted.map(async (collection) => {
            const res = await api.get(`/collections/${collection.id}`)
            byCollection[collection.id] = res.data.paintings ?? []
          }),
        )
        if (cancelled) return
        setPaintingsByCollection(byCollection)
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
  }, [])

  if (loading) return <p className="collection-slider__status">Cargando…</p>
  if (error) {
    return <p className="collection-slider__status">No se pudieron cargar las colecciones.</p>
  }
  if (collections.length === 0) {
    return <p className="collection-slider__status">No hay colecciones disponibles.</p>
  }

  return (
    <div className="collection-slider">
      {collections.map((collection) => (
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
