import './HomeHero.scss'

const HomeHero = ({ backgroundImage }) => (
  <section className="home-hero" style={{ backgroundImage: `url(${backgroundImage})` }}>
    <h1 className="home-hero__title">Antonio Tello</h1>
  </section>
)

export default HomeHero
