import { ARTIST_NAME } from '@/constants/businessRules.js'
import './HomeHero.scss'

const HomeHero = ({ backgroundImage }) => (
  <section className="home-hero" style={{ backgroundImage: `url(${backgroundImage})` }}>
    <h1 className="home-hero__title">{ARTIST_NAME}</h1>
  </section>
)

export default HomeHero
