import './CollectionCard.scss'

const CollectionCard = ({ collection, paintings }) => {
  const featured = paintings.filter((p) => p.isFeatured)
  const images =
    featured.length > 0
      ? featured
      : [{ title: collection.title, imageUrl: collection.coverImage }]

  return (
    <article className="collection-card">
      <h3 className="collection-card__title">
        <a href={`/painting/collections/${collection.id}`}>{collection.title}</a>
      </h3>
      {collection.description && (
        <p className="collection-card__description">{collection.description}</p>
      )}
      <div className="collection-card__images">
        {images.map((image) => (
          <img
            key={image.imageUrl}
            className="collection-card__image"
            src={image.imageUrl}
            alt={image.title}
            loading="lazy"
          />
        ))}
      </div>
    </article>
  )
}

export default CollectionCard
