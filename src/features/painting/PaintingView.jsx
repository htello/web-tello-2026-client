import { ARTIST_NAME } from '@/constants/businessRules.js'
import SeoMeta from '@/components/SeoMeta.jsx'
import CollectionsSlider from './components/CollectionsSlider.jsx'
import ExhibitionLink from './components/ExhibitionLink.jsx'
import './PaintingView.scss'

const PaintingView = () => (
  <div className="painting-view">
    <SeoMeta title={`Pintura — ${ARTIST_NAME}`} path="/painting" />
    <h1 className="painting-view__title">Pintura</h1>
    <ExhibitionLink />
    <CollectionsSlider />
  </div>
)

export default PaintingView
