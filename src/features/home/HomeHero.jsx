import { ARTIST_NAME } from '@/constants/businessRules.js'
import SeoMeta from '@/components/SeoMeta.jsx'
import './HomeHero.scss'

const HomeHero = ({ backgroundImage }) => (
  <section className="home-hero">
    <SeoMeta title={`${ARTIST_NAME} — Portfolio`} path="/" image={backgroundImage} />
    <img className="home-hero__image" src={backgroundImage} alt="" fetchPriority="high" />
  </section>
)

export default HomeHero
