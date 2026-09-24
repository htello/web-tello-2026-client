import { useEffect, useState } from 'react'
import { api } from '@/services/api.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
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

  if (loading) return <p className="illustration-gallery__status">Cargando…</p>
  if (error) {
    return <p className="illustration-gallery__status">No se pudieron cargar las ilustraciones.</p>
  }
  if (illustrations.length === 0) {
    return <p className="illustration-gallery__status">No hay ilustraciones disponibles.</p>
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
