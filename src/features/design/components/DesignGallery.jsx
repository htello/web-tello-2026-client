import { useState } from 'react'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { ARTIST_NAME, DESIGN_SUBCATEGORIES } from '@/constants/businessRules.js'
import GallerySkeleton from '@/components/GallerySkeleton.jsx'
import SeoMeta from '@/components/SeoMeta.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import ProtectedArtworkImage from '@/components/ProtectedArtworkImage.jsx'
import Lightbox from '@/features/painting/components/Lightbox.jsx'
import './DesignGallery.scss'

const DesignGallery = ({ subcategory }) => {
  const [selected, setSelected] = useState(null)
  const { data: projects, loading, error } = useAsyncData(
    async (signal) => {
      const res = await api.get(`/design?subcategory=${subcategory}`, { signal })
      return res.data ?? []
    },
    [subcategory],
  )

  if (loading) return <GallerySkeleton />
  if (error) return <ErrorState message="No se pudieron cargar los proyectos." />
  if (projects.length === 0) {
    return <EmptyState message="No hay proyectos en esta categoría." />
  }

  const heading =
    DESIGN_SUBCATEGORIES.find((item) => item.key === subcategory)?.label ?? 'Diseño'

  return (
    <section className="design-gallery">
      <SeoMeta title={`${heading} — ${ARTIST_NAME}`} path={`/design/${subcategory}`} />
      <h1 className="design-gallery__heading">{heading}</h1>
      <div className="design-gallery__grid">
        {projects.map((project) => (
          <figure key={project.id} className="design-gallery__item">
            <button
              type="button"
              className="design-gallery__button"
              onClick={() => setSelected(project)}
            >
              <ProtectedArtworkImage
                className="design-gallery__image"
                src={project.imageUrl}
                alt={project.title}
              />
            </button>
            <figcaption className="design-gallery__title">{project.title}</figcaption>
            {project.description && (
              <p className="design-gallery__description">{project.description}</p>
            )}
          </figure>
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

export default DesignGallery
