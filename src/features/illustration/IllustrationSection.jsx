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
import MasterDetail from '@/components/MasterDetail.jsx'
import SectionHeader from '@/components/SectionHeader.jsx'
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
      <SectionHeader title={GROUP_LABEL} />
      <MasterDetail
        items={[{ id: 'general', title: GROUP_LABEL }]}
        selectedId="general"
        onSelect={() => {}}
        label="Lista de categorías de ilustración"
      >
        <h2 className="master-detail__title">{GROUP_LABEL}</h2>
        <MasonryGrid label="Galería de ilustraciones">
          {illustrations.map((illustration) => (
            <IllustrationCard
              key={illustration.id}
              illustration={illustration}
              headingLevel={3}
              onOpen={() => setSelected(illustration)}
            />
          ))}
        </MasonryGrid>
        <Lightbox
          isOpen={selected !== null}
          image={selected ? { src: selected.imageUrl, alt: selected.title } : null}
          onClose={() => setSelected(null)}
        />
      </MasterDetail>
    </section>
  )
}

export default IllustrationSection
