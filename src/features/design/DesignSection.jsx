import { useState } from 'react'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { ARTIST_NAME, DESIGN_SUBCATEGORIES } from '@/constants/businessRules.js'
import GallerySkeleton from '@/components/GallerySkeleton.jsx'
import SeoMeta from '@/components/SeoMeta.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import MasonryGrid from '@/components/MasonryGrid.jsx'
import MasterDetail from '@/components/MasterDetail.jsx'
import SectionHeader from '@/components/SectionHeader.jsx'
import ArtworkCard from '@/components/ArtworkCard.jsx'
import Lightbox from '@/features/painting/components/Lightbox.jsx'
import './DesignSection.scss'

const DesignSection = () => {
  const [selectedKey, setSelectedKey] = useState(null)
  const [selected, setSelected] = useState(null)
  const { data: projectsBySubcategory, loading, error } = useAsyncData(async (signal) => {
    const bySubcategory = {}
    await Promise.all(
      DESIGN_SUBCATEGORIES.map(async ({ key }) => {
        const res = await api.get(`/design?subcategory=${key}`, { signal })
        bySubcategory[key] = res.data ?? []
      }),
    )
    return bySubcategory
  })

  if (loading) return <GallerySkeleton count={4} />
  if (error) return <ErrorState message="No se pudieron cargar los proyectos." />

  const visibleSubcategories = DESIGN_SUBCATEGORIES.filter(
    ({ key }) => (projectsBySubcategory[key] ?? []).length > 0,
  )

  if (visibleSubcategories.length === 0) {
    return <EmptyState message="No hay proyectos de diseño disponibles." />
  }

  const current =
    visibleSubcategories.find(({ key }) => key === selectedKey) ?? visibleSubcategories[0]
  const projects = projectsBySubcategory[current.key] ?? []

  return (
    <section className="design-section">
      <SeoMeta title={`Diseño — ${ARTIST_NAME}`} path="/diseno" />
      <SectionHeader title="Diseño" />
      <MasterDetail
        items={visibleSubcategories.map(({ key, label }) => ({ id: key, title: label }))}
        selectedId={current.key}
        onSelect={setSelectedKey}
        label="Lista de categorías de diseño"
      >
        <h2 className="master-detail__title">{current.label}</h2>
        <MasonryGrid label={`Proyectos de ${current.label}`}>
          {projects.map((project) => (
            <ArtworkCard
              key={project.id}
              src={project.imageUrl}
              alt={project.title}
              title={project.title}
              headingLevel={3}
              description={project.description}
              onOpen={() => setSelected(project)}
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

export default DesignSection
