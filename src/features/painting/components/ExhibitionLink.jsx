import { Link } from 'react-router-dom'
import './ExhibitionLink.scss'

const ExhibitionLink = () => (
  <Link className="exhibition-link" to="/painting/exhibitions">
    Exhibiciones
  </Link>
)

export default ExhibitionLink
