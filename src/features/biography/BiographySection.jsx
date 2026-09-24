import { usePortfolioContext } from '@/context/PortfolioContext.js'
import { ARTIST_NAME } from '@/constants/businessRules.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import SectionHeader from '@/components/SectionHeader.jsx'
import './BiographySection.scss'

const BiographySection = () => {
  const { biography, loading, error } = usePortfolioContext()

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No se pudo cargar la biografía." />
  if (!biography) return <EmptyState message="Sin biografía." />

  return (
    <section className="biography">
      <SectionHeader title="Biografía" />
      <p className="biography__content">{biography.content}</p>
      {biography.imageUrl && (
        <img
          className="biography__image"
          src={biography.imageUrl}
          alt={`Fotografía de ${ARTIST_NAME}`}
        />
      )}
    </section>
  )
}

export default BiographySection
