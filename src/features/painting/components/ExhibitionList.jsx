import { useEffect, useState } from 'react'
import { api } from '@/services/api.js'
import { formatDate } from '@/utils/formatDate.js'
import { sortByPosition } from '@/utils/sortByPosition.js'
import './ExhibitionList.scss'

const ExhibitionList = () => {
  const [exhibitions, setExhibitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data } = await api.get('/exhibitions')
        if (!cancelled) setExhibitions(sortByPosition(data))
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

  if (loading) return <p className="exhibition-list__status">Cargando…</p>
  if (error) {
    return <p className="exhibition-list__status">No se pudieron cargar las exposiciones.</p>
  }
  if (exhibitions.length === 0) {
    return <p className="exhibition-list__status">No hay exposiciones disponibles.</p>
  }

  return (
    <ul className="exhibition-list">
      {exhibitions.map((exhibition) => (
        <li key={exhibition.id} className="exhibition-list__item">
          <h3 className="exhibition-list__title">{exhibition.title}</h3>
          <p className="exhibition-list__date">{formatDate(exhibition.date)}</p>
          <p className="exhibition-list__location">{exhibition.location}</p>
          {exhibition.description && (
            <p className="exhibition-list__description">{exhibition.description}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

export default ExhibitionList
