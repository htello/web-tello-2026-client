import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api.js'
import { DESIGN_SUBCATEGORIES } from '@/constants/businessRules.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import './DesignSubcategorySlider.scss'

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
          DESIGN_SUBCATEGORIES.map(async ({ key }) => {
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

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No se pudieron cargar los proyectos." />

  return (
    <div className="design-subcategory-slider">
      {DESIGN_SUBCATEGORIES.map(({ key, label }) => {
        const projects = projectsBySubcategory[key] ?? []
        const featured = projects.filter((p) => p.isFeatured)
        const images = featured.length > 0 ? featured : projects.slice(0, 1)

        return (
          <section key={key} className="design-subcategory-slider__item">
            <h3 className="design-subcategory-slider__title">
              <Link to={`/design/${key}`}>{label}</Link>
            </h3>
            <div className="design-subcategory-slider__slider" aria-label={`Proyectos de ${label}`}>
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
          </section>
        )
      })}
    </div>
  )
}

export default DesignSubcategorySlider
