import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import './DesignGallery.scss'

const DesignGallery = ({ subcategory }) => {
  const { data: projects, loading, error } = useAsyncData(
    async (signal) => {
      const res = await api.get(`/design?subcategory=${subcategory}`, { signal })
      return res.data ?? []
    },
    [subcategory],
  )

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No se pudieron cargar los proyectos." />
  if (projects.length === 0) {
    return <EmptyState message="No hay proyectos en esta categoría." />
  }

  return (
    <div className="design-gallery__grid">
      {projects.map((project) => (
        <figure key={project.id} className="design-gallery__item">
          <img
            className="design-gallery__image"
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
          />
          <figcaption className="design-gallery__title">{project.title}</figcaption>
          {project.description && (
            <p className="design-gallery__description">{project.description}</p>
          )}
        </figure>
      ))}
    </div>
  )
}

export default DesignGallery
