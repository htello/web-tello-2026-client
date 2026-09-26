import { Link } from 'react-router-dom'
import { api } from '@/services/api.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { getTechnicalDetails } from '@/utils/getTechnicalDetails.js'
import { isNotFound } from '@/constants/businessRules.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import ProtectedArtworkImage from '@/components/ProtectedArtworkImage.jsx'
import './PaintingDetail.scss'

const PaintingDetail = ({ paintingId }) => {
  const { data: painting, loading, error } = useAsyncData(
    async (signal) => {
      const res = await api.get(`/paintings/${paintingId}`, { signal })
      return res.data
    },
    [paintingId],
  )

  if (loading) return <LoadingState />
  if (isNotFound(error)) return <EmptyState message="No encontrada" />
  if (error) return <ErrorState message="No se pudo cargar la pintura." />

  const details = getTechnicalDetails(painting)
  const collectionId = painting.collection?.id

  return (
    <article className="painting-detail">
      <ProtectedArtworkImage
        className="painting-detail__image"
        src={painting.imageUrl}
        alt={painting.title}
      />
      <h1 className="painting-detail__title">{painting.title}</h1>
      {details.length > 0 && (
        <dl className="painting-detail__details">
          {details.map(({ label, value }) => (
            <div key={label} className="painting-detail__detail">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {collectionId && (
        <Link className="painting-detail__back" to={`/painting/collections/${collectionId}`}>
          Volver a la colección
        </Link>
      )}
    </article>
  )
}

export default PaintingDetail
