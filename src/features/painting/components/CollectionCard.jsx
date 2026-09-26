import { Link } from 'react-router-dom'
import './CollectionCard.scss'

/**
 * @param {object} props
 * @param {object} props.collection
 * @param {object[]} props.paintings pinturas de la colección (para destacar las featured)
 * @param {boolean} [props.priority] la primera imagen se carga con prioridad
 *   (eager + fetchpriority=high); solo debe activarse en la primera tarjeta visible.
 */
const CollectionCard = ({ collection, paintings, priority = false }) => {
  const featured = paintings.filter((p) => p.isFeatured)
  const images =
    featured.length > 0
      ? featured
      : [{ title: collection.title, imageUrl: collection.coverImage }]

  return (
    <section className="collection-card">
      <h3 className="collection-card__title">
        <Link to={`/painting/collections/${collection.id}`}>{collection.title}</Link>
      </h3>
      {collection.description && (
        <p className="collection-card__description">{collection.description}</p>
      )}
      <div className="collection-card__slider" aria-label={`Obras de ${collection.title}`}>
        {images.map((image, index) => {
          const isPriority = priority && index === 0
          return (
            <img
              key={image.imageUrl}
              className="collection-card__image"
              src={image.imageUrl}
              alt={image.title}
              loading={isPriority ? 'eager' : 'lazy'}
              fetchPriority={isPriority ? 'high' : undefined}
            />
          )
        })}
      </div>
    </section>
  )
}

export default CollectionCard
