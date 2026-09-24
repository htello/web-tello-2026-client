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
  const [activeIndex, setActiveIndex] = useState(0)

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

  if (loading) return <p className="collection-slider__status">Cargando colecciones…</p>
  if (error) {
    return <p className="collection-slider__status">No se pudieron cargar las colecciones.</p>
  }
  if (collections.length === 0) {
    return <p className="collection-slider__status">No hay colecciones disponibles.</p>
  }

  const collection = collections[activeIndex]
  const paintings = paintingsByCollection[collection.id] ?? []

  return (
    <section className="collection-slider">
      <div className="collection-slider__controls">
        <button
          type="button"
          className="collection-slider__nav"
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          disabled={activeIndex === 0}
          aria-label="Colección anterior"
        >
          ‹
        </button>
        <button
          type="button"
          className="collection-slider__nav"
          onClick={() => setActiveIndex((i) => Math.min(collections.length - 1, i + 1))}
          disabled={activeIndex === collections.length - 1}
          aria-label="Colección siguiente"
        >
          ›
        </button>
      </div>

      <CollectionCard collection={collection} paintings={paintings} />
    </section>
  )
}

export default CollectionsSlider
