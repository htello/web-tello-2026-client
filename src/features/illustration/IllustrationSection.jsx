import { useState } from 'react'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import { ARTIST_NAME } from '@/constants/businessRules.js'
import GallerySkeleton from '@/components/GallerySkeleton.jsx'
import SeoMeta from '@/components/SeoMeta.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import MasonryGrid from '@/components/MasonryGrid.jsx'
import IllustrationCard from './components/IllustrationCard.jsx'
import Lightbox from '@/features/painting/components/Lightbox.jsx'
import './IllustrationSection.scss'

const GROUP_LABEL = 'Ilustración'

const IllustrationSection = () => {
  const [selected, setSelected] = useState(null)
  const { data: illustrations, loading, error } = useAsyncData(async (signal) => {
    const res = await api.get('/illustrations', { signal })
    return sortByPosition(res.data ?? [])
  })

  if (loading) return <GallerySkeleton />
  if (error) return <ErrorState message="No se pudieron cargar las ilustraciones." />
  if (illustrations.length === 0) {
    return <EmptyState message="No hay ilustraciones disponibles." />
  }

  return (
    <section className="illustration-section">
      <SeoMeta title={`Ilustración — ${ARTIST_NAME}`} path="/illustration" />
      <h1 className="illustration-section__heading">{GROUP_LABEL}</h1>
      <div className="illustration-section__layout">
        <nav className="illustration-section__sidebar" aria-label="Lista de categorías de ilustración">
          <ul className="illustration-section__items">
            <li>
              <button
                type="button"
                className="illustration-section__item illustration-section__item--active"
                aria-current="true"
              >
                {GROUP_LABEL}
              </button>
            </li>
          </ul>
        </nav>
        <article className="illustration-section__detail">
          <h2 className="illustration-section__title">{GROUP_LABEL}</h2>
          <MasonryGrid label="Galería de ilustraciones">
            {illustrations.map((illustration) => (
              <IllustrationCard
                key={illustration.id}
                illustration={illustration}
                onOpen={() => setSelected(illustration)}
              />
            ))}
          </MasonryGrid>
          <Lightbox
            isOpen={selected !== null}
            image={selected ? { src: selected.imageUrl, alt: selected.title } : null}
            onClose={() => setSelected(null)}
          />
        </article>
      </div>
    </section>
  )
}

export default IllustrationSection
