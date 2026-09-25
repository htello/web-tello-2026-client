import { ARTIST_NAME } from '@/constants/businessRules.js'
import SeoMeta from '@/components/SeoMeta.jsx'
import './HomeHero.scss'

const HomeHero = ({ backgroundImage }) => (
  <section className="home-hero" style={{ backgroundImage: `url(${backgroundImage})` }}>
    <SeoMeta title={`${ARTIST_NAME} — Portfolio`} path="/" image={backgroundImage} />
    <h1 className="home-hero__title">{ARTIST_NAME}</h1>
  </section>
)

export default HomeHero
