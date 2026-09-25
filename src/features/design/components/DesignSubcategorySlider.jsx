import { Link } from 'react-router-dom'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { DESIGN_SUBCATEGORIES } from '@/constants/businessRules.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import './DesignSubcategorySlider.scss'

const DesignSubcategorySlider = () => {
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

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No se pudieron cargar los proyectos." />

  // Solo se muestran las subcategorías con proyectos publicados.
  const visibleSubcategories = DESIGN_SUBCATEGORIES.filter(
    ({ key }) => (projectsBySubcategory[key] ?? []).length > 0,
  )

  if (visibleSubcategories.length === 0) {
    return <EmptyState message="No hay proyectos de diseño disponibles." />
  }

  return (
    <div className="design-subcategory-slider">
      {visibleSubcategories.map(({ key, label }) => {
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
