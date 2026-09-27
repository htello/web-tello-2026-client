import { getTechnicalDetails } from '@/utils/getTechnicalDetails.js'
import ArtworkCard from '@/components/ArtworkCard.jsx'

const PaintingCard = ({ painting, onOpen, headingLevel = 2 }) => {
  const { id, title, imageUrl } = painting

  return (
    <ArtworkCard
      src={imageUrl}
      alt={title}
      title={title}
      headingLevel={headingLevel}
      details={getTechnicalDetails(painting)}
      onOpen={() => onOpen(id)}
    />
  )
}

export default PaintingCard
