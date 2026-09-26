import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { ARTIST_NAME, isNotFound } from '@/constants/businessRules.js'
import SeoMeta from '@/components/SeoMeta.jsx'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import ProtectedArtworkImage from '@/components/ProtectedArtworkImage.jsx'
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

  const cut = biography.content.slice(0, 160)
  const lastSpace = cut.lastIndexOf(' ')
  const trimmed = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()
  const description = biography.content.length <= 160 ? biography.content : `${trimmed}…`

  return (
    <section className="biography">
      <SeoMeta title={`Biografía — ${ARTIST_NAME}`} description={description} path="/biography" />
      <h1 className="biography__title">Biografía</h1>
      <p className="biography__content">{biography.content}</p>
      {biography.imageUrl && (
        <ProtectedArtworkImage
          className="biography__image"
          src={biography.imageUrl}
          alt={`Fotografía de ${ARTIST_NAME}`}
        />
      )}
    </section>
  )
}

export default BiographySection
