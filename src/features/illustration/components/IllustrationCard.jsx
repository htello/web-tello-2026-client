import ArtworkCard from '@/components/ArtworkCard.jsx'

const IllustrationCard = ({ illustration, onOpen, headingLevel = 2 }) => {
  const { id, title, imageUrl, description } = illustration

  return (
    <ArtworkCard
      src={imageUrl}
      alt={title}
      title={title}
      headingLevel={headingLevel}
      description={description}
      onOpen={() => onOpen(id)}
    />
  )
}

export default IllustrationCard
