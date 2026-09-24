import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api.js'
import { getTechnicalDetails } from '@/utils/getTechnicalDetails.js'
import { isNotFound } from '@/constants/businessRules.js'
import LoadingState from '@/components/LoadingState.jsx'
import ErrorState from '@/components/ErrorState.jsx'
import EmptyState from '@/components/EmptyState.jsx'
import './PaintingDetail.scss'

const PaintingDetail = ({ paintingId }) => {
  const [painting, setPainting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data } = await api.get(`/paintings/${paintingId}`)
        if (!cancelled) setPainting(data)
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
  }, [paintingId])

  if (loading) return <LoadingState />

  const notFound = error && isNotFound(error)
  if (notFound) return <EmptyState message="No encontrada" />
  if (error) return <ErrorState message="No se pudo cargar la pintura." />

  const details = getTechnicalDetails(painting)
  const collectionId = painting.collection?.id

  return (
    <article className="painting-detail">
      <img
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
