import { useState } from 'react'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { ARTIST_NAME, DESIGN_SUBCATEGORIES } from '@/constants/businessRules.js'
import GallerySkeleton from '@/components/GallerySkeleton.jsx'
import SeoMeta from '@/components/SeoMeta.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import MasonryGrid from '@/components/MasonryGrid.jsx'
import ProtectedArtworkImage from '@/components/ProtectedArtworkImage.jsx'
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
      <SeoMeta title={`Diseño — ${ARTIST_NAME}`} path="/design" />
      <h1 className="design-section__heading">Diseño</h1>
      <div className="design-section__layout">
        <nav className="design-section__sidebar" aria-label="Lista de categorías de diseño">
          <ul className="design-section__items">
            {visibleSubcategories.map(({ key, label }) => (
              <li key={key}>
                <button
                  type="button"
                  className={
                    key === current.key
                      ? 'design-section__item design-section__item--active'
                      : 'design-section__item'
                  }
                  aria-current={key === current.key ? 'true' : undefined}
                  onClick={() => setSelectedKey(key)}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <article className="design-section__detail">
          <h2 className="design-section__title">{current.label}</h2>
          <MasonryGrid label={`Proyectos de ${current.label}`}>
            {projects.map((project) => (
              <figure key={project.id} className="design-section__figure">
                <button
                  type="button"
                  className="design-section__button"
                  onClick={() => setSelected(project)}
                >
                  <ProtectedArtworkImage
                    className="design-section__image"
                    src={project.imageUrl}
                    alt={project.title}
                  />
                </button>
                <figcaption className="design-section__caption">{project.title}</figcaption>
                {project.description && (
                  <p className="design-section__description">{project.description}</p>
                )}
              </figure>
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

export default DesignSection
