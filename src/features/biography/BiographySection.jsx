import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { ARTIST_NAME, isNotFound } from '@/constants/businessRules.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import './BiographySection.scss'

const BiographySection = () => {
  const { data: biography, loading, error } = useAsyncData(async (signal) => {
    try {
      const res = await api.get('/biography', { signal })
      return res.data
    } catch (err) {
      if (isNotFound(err)) return null
      throw err
    }
  })

  if (loading) return <LoadingState />
  if (error) return <ErrorState message="No se pudo cargar la biografía." />
  if (!biography) return <EmptyState message="Sin biografía." />

  return (
    <section className="biography">
      <h2 className="biography__title">Biografía</h2>
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
