import PaintingCardSkeleton from './PaintingCardSkeleton.jsx'
import './GallerySkeleton.scss'

/**
 * Rejilla de tarjetas skeleton; anuncia la carga una sola vez.
 *
 * @param {{ count?: number }} props número de tarjetas a renderizar
 */
const GallerySkeleton = ({ count = 6 }) => (
  <div className="gallery-skeleton" role="status" aria-label="Cargando galería…">
    <p className="gallery-skeleton__hint" aria-hidden="true">
      Cargando…
    </p>
    {Array.from({ length: count }, (_, index) => (
      <PaintingCardSkeleton key={index} />
    ))}
  </div>
)

export default GallerySkeleton
