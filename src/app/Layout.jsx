import { Link, Outlet } from 'react-router-dom'
import './Layout.scss'

const NAV_ITEMS = [
  { label: 'Pintura', to: '/painting' },
  { label: 'Ilustración', to: '/illustration' },
  { label: 'Diseño', to: '/design' },
  { label: 'Biografía', to: '/biography' },
  { label: 'Contacto', to: '/contact' },
]

const Layout = () => (
  <div className="layout">
    <header className="layout__header">
      <nav className="layout__nav" aria-label="Navegación principal">
        <Link to="/" className="layout__brand">
          Antonio Tello
        </Link>
        <ul className="layout__menu">
          {NAV_ITEMS.map(({ label, to }) => (
            <li key={label}>
              <Link to={to} className="layout__link">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
    <main className="layout__main">
      <Outlet />
    </main>
    <footer className="layout__footer">© Antonio Tello</footer>
  </div>
)

export default Layout
