import { usePortfolioContext } from '@/context/PortfolioContext.js'
import './BiographySection.scss'

const BiographySection = () => {
  const { biography, loading, error } = usePortfolioContext()

  if (loading) return <p className="biography__status">Cargando…</p>
  if (error) return <p className="biography__status">No se pudo cargar la biografía.</p>
  if (!biography) return <p className="biography__status">Sin biografía.</p>

  return (
    <section className="biography">
      <h2 className="biography__title">Biografía</h2>
      <p className="biography__content">{biography.content}</p>
      {biography.imageUrl && (
        <img
          className="biography__image"
          src={biography.imageUrl}
          alt="Fotografía de Antonio Tello"
        />
      )}
    </section>
  )
}

export default BiographySection
