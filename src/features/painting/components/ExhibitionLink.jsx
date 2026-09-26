import { Link } from 'react-router-dom'
import './ExhibitionLink.scss'

const ExhibitionLink = () => (
  <Link className="exhibition-link" to="/painting/exhibitions">
    Ver exposiciones
  </Link>
)

export default ExhibitionLink
