import { useEffect, useState } from 'react'
import { api } from '@/services/api.js'
import './DesignGallery.scss'

const DesignGallery = ({ subcategory }) => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data } = await api.get(`/design?subcategory=${subcategory}`)
        if (!cancelled) setProjects(data ?? [])
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
  }, [subcategory])

  if (loading) return <p className="design-gallery__status">Cargando…</p>
  if (error) return <p className="design-gallery__status">No se pudieron cargar los proyectos.</p>
  if (projects.length === 0) {
    return <p className="design-gallery__status">No hay proyectos en esta categoría.</p>
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
