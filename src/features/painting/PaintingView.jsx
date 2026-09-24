import CollectionsSlider from './components/CollectionsSlider.jsx'
import ExhibitionLink from './components/ExhibitionLink.jsx'
import './PaintingView.scss'

const PaintingView = () => (
  <div className="painting-view">
    <ExhibitionLink />
    <CollectionsSlider />
  </div>
)

export default PaintingView
