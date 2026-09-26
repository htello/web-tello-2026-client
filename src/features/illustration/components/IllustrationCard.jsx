import ProtectedArtworkImage from '@/components/ProtectedArtworkImage.jsx'
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
        <ProtectedArtworkImage className="illustration-card__image" src={imageUrl} alt={title} />
      </button>
      <h2 className="illustration-card__title">{title}</h2>
      {illustration.description && (
        <p className="illustration-card__description">{illustration.description}</p>
      )}
    </article>
  )
}

export default IllustrationCard
