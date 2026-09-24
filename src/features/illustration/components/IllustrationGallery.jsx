import { useEffect, useState } from 'react'
import { api } from '@/services/api.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import IllustrationCard from './IllustrationCard.jsx'
import Lightbox from '@/features/painting/components/Lightbox.jsx'
import './IllustrationGallery.scss'

const IllustrationGallery = () => {
  const [illustrations, setIllustrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data } = await api.get('/illustrations')
        if (!cancelled) setIllustrations(sortByPosition(data ?? []))
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

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No se pudieron cargar las ilustraciones." />
  if (illustrations.length === 0) {
    return <EmptyState message="No hay ilustraciones disponibles." />
  }

  return (
    <section className="illustration-gallery">
      <div className="illustration-gallery__grid">
        {illustrations.map((illustration) => (
          <IllustrationCard
            key={illustration.id}
            illustration={illustration}
            onOpen={() => setSelected(illustration)}
          />
        ))}
      </div>
      <Lightbox
        isOpen={selected !== null}
        image={selected ? { src: selected.imageUrl, alt: selected.title } : null}
        onClose={() => setSelected(null)}
      />
    </section>
  )
}

export default IllustrationGallery
