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
import MasterDetail from '@/components/MasterDetail.jsx'
import SectionHeader from '@/components/SectionHeader.jsx'
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

  const header = <SectionHeader title="Pintura" action={<ExhibitionLink />} />

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
      <MasterDetail
        items={collections.map((collection) => ({ id: collection.id, title: collection.title }))}
        selectedId={selected.id}
        onSelect={setSelectedId}
        label="Lista de colecciones"
      >
        <h2 className="master-detail__title">{selected.title}</h2>
        {selected.description && (
          <p className="painting-section__description">{selected.description}</p>
        )}
        {paintings.length === 0 ? (
          <EmptyState message="No hay obras en esta colección." />
        ) : (
          <MasonryGrid label={`Obras de ${selected.title}`}>
            {paintings.map((painting) => (
              <PaintingCard
                key={painting.id}
                painting={painting}
                headingLevel={3}
                onOpen={() => handleOpen(painting)}
              />
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
      </MasterDetail>
    </section>
  )
}

export default PaintingSection
