import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api.js'
import './DesignSubcategorySlider.scss'

const SUBCATEGORIES = [
  { key: 'imagen-corporativa', label: 'Imagen corporativa' },
  { key: 'packaging-expositores', label: 'Packaging y Expositores' },
  { key: 'carteleria', label: 'Cartelería' },
  { key: 'editorial', label: 'Editorial' },
]

const DesignSubcategorySlider = () => {
  const [projectsBySubcategory, setProjectsBySubcategory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const bySubcategory = {}
        await Promise.all(
          SUBCATEGORIES.map(async ({ key }) => {
            const res = await api.get(`/design?subcategory=${key}`)
            bySubcategory[key] = res.data ?? []
          }),
        )
        if (cancelled) return
        setProjectsBySubcategory(bySubcategory)
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

  if (loading) return <p className="design-subcategory-slider__status">Cargando…</p>
  if (error) {
    return <p className="design-subcategory-slider__status">No se pudieron cargar los proyectos.</p>
  }

  return (
    <section className="design-subcategory-slider">
      {SUBCATEGORIES.map(({ key, label }) => {
        const projects = projectsBySubcategory[key] ?? []
        const featured = projects.filter((p) => p.isFeatured)
        const images = featured.length > 0 ? featured : projects.slice(0, 1)

        return (
          <article key={key} className="design-subcategory-slider__item">
            <h3 className="design-subcategory-slider__title">
              <Link to={`/design/${key}`}>{label}</Link>
            </h3>
            <div className="design-subcategory-slider__images">
              {images.map((project) => (
                <img
                  key={project.id}
                  className="design-subcategory-slider__image"
                  src={project.imageUrl}
                  alt={project.title}
                  loading="lazy"
                />
              ))}
            </div>
          </article>
        )
      })}
    </section>
  )
}

export default DesignSubcategorySlider
