import Skeleton from './Skeleton.jsx'
import './PaintingCardSkeleton.scss'

/**
 * Tarjeta de pintura en skeleton (decorativa: el contenedor anuncia la carga).
 */
const PaintingCardSkeleton = () => (
  <div className="painting-card-skeleton" aria-hidden="true">
    <Skeleton variant="rectangular" decorative className="painting-card-skeleton__image" />
    <Skeleton variant="text" decorative className="painting-card-skeleton__title" />
    <Skeleton variant="text" decorative className="painting-card-skeleton__line" />
  </div>
)

export default PaintingCardSkeleton
