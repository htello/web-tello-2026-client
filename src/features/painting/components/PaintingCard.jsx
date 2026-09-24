import { getTechnicalDetails } from '@/utils/getTechnicalDetails.js'
import './PaintingCard.scss'

const PaintingCard = ({ painting, onOpen }) => {
  const { id, title, imageUrl } = painting

  const details = getTechnicalDetails(painting)

  return (
    <article className="painting-card">
      <button
        type="button"
        className="painting-card__button"
        onClick={() => onOpen(id)}
      >
        <img
          className="painting-card__image"
          src={imageUrl}
          alt={title}
          loading="lazy"
        />
      </button>
      <div className="painting-card__body">
        <h3 className="painting-card__title">{title}</h3>
        {details.length > 0 && (
          <dl className="painting-card__details">
            {details.map(({ label, value }) => (
              <div key={label} className="painting-card__detail">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  )
}

export default PaintingCard
