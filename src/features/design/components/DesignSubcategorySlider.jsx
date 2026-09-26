import { Link } from 'react-router-dom'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { ARTIST_NAME, DESIGN_SUBCATEGORIES } from '@/constants/businessRules.js'
import GallerySkeleton from '@/components/GallerySkeleton.jsx'
import SeoMeta from '@/components/SeoMeta.jsx'
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

  if (loading) return <GallerySkeleton count={4} />
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
      <SeoMeta title={`Diseño — ${ARTIST_NAME}`} path="/design" />
      <h1 className="design-subcategory-slider__heading">Diseño</h1>
      {visibleSubcategories.map(({ key, label }, sectionIndex) => {
        const projects = projectsBySubcategory[key] ?? []
        const featured = projects.filter((p) => p.isFeatured)
        const images = featured.length > 0 ? featured : projects.slice(0, 1)

        return (
          <section key={key} className="design-subcategory-slider__item">
            <h2 className="design-subcategory-slider__title">
              <Link to={`/design/${key}`}>{label}</Link>
            </h2>
            <div className="design-subcategory-slider__slider" aria-label={`Proyectos de ${label}`}>
              {images.map((project, imageIndex) => {
                const isPriority = sectionIndex === 0 && imageIndex === 0
                return (
                  <img
                    key={project.id}
                    className="design-subcategory-slider__image"
                    src={project.imageUrl}
                    alt={project.title}
                    loading={isPriority ? 'eager' : 'lazy'}
                    fetchPriority={isPriority ? 'high' : undefined}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default DesignSubcategorySlider
