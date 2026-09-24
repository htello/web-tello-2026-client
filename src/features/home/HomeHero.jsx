import './HomeHero.scss'

const NAV_ITEMS = [
  { label: 'Pintura', href: '/painting' },
  { label: 'Ilustración', href: '/illustration' },
  { label: 'Diseño', href: '/design' },
  { label: 'Biografía', href: '/biography' },
  { label: 'Contacto', href: '/contact' },
]

const HomeHero = ({ backgroundImage }) => (
  <section
    className="home-hero"
    style={{ backgroundImage: `url(${backgroundImage})` }}
  >
    <nav className="home-hero__nav" aria-label="Navegación principal">
      <span className="home-hero__brand">Antonio Tello</span>
      <ul className="home-hero__menu">
        {NAV_ITEMS.map(({ label, href }) => (
          <li key={label}>
            <a className="home-hero__link" href={href}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </section>
)

export default HomeHero
