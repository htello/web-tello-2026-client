import { useState } from 'react'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { addBreadcrumb } from '@/infrastructure/sentry.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import { ARTIST_NAME } from '@/constants/businessRules.js'
import GallerySkeleton from '@/components/GallerySkeleton.jsx'
import SeoMeta from '@/components/SeoMeta.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import MasonryGrid from '@/components/MasonryGrid.jsx'
import ExhibitionLink from './components/ExhibitionLink.jsx'
import PaintingCard from './components/PaintingCard.jsx'
import Lightbox from './components/Lightbox.jsx'
import './PaintingSection.scss'

const PaintingSection = () => {
  const [selectedId, setSelectedId] = useState(null)
  const [selectedPainting, setSelectedPainting] = useState(null)
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

  const header = (
    <div className="painting-section__header">
      <h1 className="painting-section__heading">Pintura</h1>
      <ExhibitionLink />
    </div>
  )

  if (collections.length === 0) {
    return (
      <section className="painting-section">
        <SeoMeta title={`Pintura — ${ARTIST_NAME}`} path="/painting" />
        {header}
        <EmptyState message="No hay colecciones disponibles." />
      </section>
    )
  }

  const selected = collections.find((collection) => collection.id === selectedId) ?? collections[0]
  const paintings = sortByPosition(paintingsByCollection[selected.id] ?? [])

  const handleOpen = (painting) => {
    addBreadcrumb({ category: 'ui', message: 'painting:open', data: { paintingId: painting.id } })
    setSelectedPainting(painting)
  }

  return (
    <section className="painting-section">
      <SeoMeta title={`Pintura — ${ARTIST_NAME}`} path="/painting" />
      {header}
      <div className="painting-section__layout">
        <nav className="painting-section__sidebar" aria-label="Lista de colecciones">
          <ul className="painting-section__items">
            {collections.map((collection) => (
              <li key={collection.id}>
                <button
                  type="button"
                  className={
                    collection.id === selected.id
                      ? 'painting-section__item painting-section__item--active'
                      : 'painting-section__item'
                  }
                  aria-current={collection.id === selected.id ? 'true' : undefined}
                  onClick={() => setSelectedId(collection.id)}
                >
                  {collection.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <article className="painting-section__detail">
          <h2 className="painting-section__title">{selected.title}</h2>
          {paintings.length === 0 ? (
            <EmptyState message="No hay obras en esta colección." />
          ) : (
            <MasonryGrid label={`Obras de ${selected.title}`}>
              {paintings.map((painting) => (
                <PaintingCard key={painting.id} painting={painting} onOpen={() => handleOpen(painting)} />
              ))}
            </MasonryGrid>
          )}
          <Lightbox
            isOpen={selectedPainting !== null}
            image={
              selectedPainting
                ? { src: selectedPainting.imageUrl, alt: selectedPainting.title }
                : null
            }
            onClose={() => setSelectedPainting(null)}
          />
        </article>
      </div>
    </section>
  )
}

export default PaintingSection
