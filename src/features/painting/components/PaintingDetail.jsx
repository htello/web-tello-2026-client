import { useEffect, useState } from 'react'
import { api } from '@/services/api.js'
import { getTechnicalDetails } from '@/utils/getTechnicalDetails.js'
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

  if (loading) return <p className="painting-detail__status">Cargando…</p>

  const isNotFound = error && (error.status === 404 || error.code === 'NOT_FOUND')
  if (isNotFound) return <p className="painting-detail__status">No encontrada</p>
  if (error) return <p className="painting-detail__status">No se pudo cargar la pintura.</p>

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
        <a className="painting-detail__back" href={`/painting/collections/${collectionId}`}>
          Volver a la colección
        </a>
      )}
    </article>
  )
}

export default PaintingDetail
