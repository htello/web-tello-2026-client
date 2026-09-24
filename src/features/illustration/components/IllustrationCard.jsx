import { getImageProtectionProps } from '@/utils/getImageProtectionProps.js'
import './IllustrationCard.scss'

const IllustrationCard = ({ illustration, onOpen }) => {
  const { id, title, imageUrl } = illustration

  return (
    <article className="illustration-card">
      <button
        type="button"
        className="illustration-card__button"
        onClick={() => onOpen(id)}
      >
        <img
          className="illustration-card__image"
          {...getImageProtectionProps(title)}
          src={imageUrl}
          loading="lazy"
        />
      </button>
      <h3 className="illustration-card__title">{title}</h3>
      {illustration.description && (
        <p className="illustration-card__description">{illustration.description}</p>
      )}
    </article>
  )
}

export default IllustrationCard
