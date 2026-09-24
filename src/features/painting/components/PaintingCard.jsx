import './PaintingCard.scss'

const DETAILS = [
  { label: 'Dimensiones', key: 'dimensions' },
  { label: 'Técnica', key: 'technique' },
  { label: 'Año', key: 'year' },
]

const PaintingCard = ({ painting, onOpen }) => {
  const { id, title, imageUrl } = painting

  const details = DETAILS.filter(({ key }) => painting[key])

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
            {details.map(({ label, key }) => (
              <div key={label} className="painting-card__detail">
                <dt>{label}</dt>
                <dd>{painting[key]}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  )
}

export default PaintingCard
