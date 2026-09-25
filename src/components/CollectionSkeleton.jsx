import Skeleton from './Skeleton.jsx'
import PaintingCardSkeleton from './PaintingCardSkeleton.jsx'
import './CollectionSkeleton.scss'

/**
 * Skeleton de página de colección: título + rejilla de tarjetas.
 *
 * @param {{ count?: number }} props número de tarjetas a renderizar
 */
const CollectionSkeleton = ({ count = 4 }) => (
  <div className="collection-skeleton" role="status" aria-label="Cargando colección…">
    <p className="collection-skeleton__hint" aria-hidden="true">
      Cargando…
    </p>
    <Skeleton variant="text" decorative className="collection-skeleton__title" />
    <div className="collection-skeleton__grid">
      {Array.from({ length: count }, (_, index) => (
        <PaintingCardSkeleton key={index} />
      ))}
    </div>
  </div>
)

export default CollectionSkeleton
