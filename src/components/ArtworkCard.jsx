import ProtectedArtworkImage from './ProtectedArtworkImage.jsx'
import './ArtworkCard.scss'

/**
 * Card semántica de obra: <figure> con imagen protegida clicable,
 * título como encabezado de nivel configurable, descripción opcional
 * y datos técnicos en lista de definición.
 *
 * @param {{ src: string, alt: string, title: string, headingLevel?: 2|3|4, description?: string, details?: Array<{ label: string, value: string }>, onOpen: () => void }} props
 */
const ArtworkCard = ({
  src,
  alt,
  title,
  headingLevel = 2,
  description,
  details = [],
  onOpen,
}) => {
  const Heading = `h${headingLevel}`

  return (
    <figure className="artwork-card">
      <button type="button" className="artwork-card__button" onClick={onOpen}>
        <ProtectedArtworkImage className="artwork-card__image" src={src} alt={alt} />
      </button>
      <figcaption className="artwork-card__body">
        <Heading className="artwork-card__title">{title}</Heading>
        {description && <p className="artwork-card__description">{description}</p>}
        {details.length > 0 && (
          <dl className="artwork-card__details">
            {details.map(({ label, value }) => (
              <div key={label} className="artwork-card__detail">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </figcaption>
    </figure>
  )
}

export default ArtworkCard
