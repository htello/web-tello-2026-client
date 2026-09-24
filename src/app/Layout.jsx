import { Link, Outlet } from 'react-router-dom'
import { ARTIST_NAME, NAV_SECTIONS } from '@/constants/businessRules.js'
import './Layout.scss'

const Layout = () => (
  <div className="layout">
    <header className="layout__header">
      <nav className="layout__nav" aria-label="Navegación principal">
        <Link to="/" className="layout__brand">
          {ARTIST_NAME}
        </Link>
        <ul className="layout__menu">
          {NAV_SECTIONS.map(({ label, to }) => (
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
    <footer className="layout__footer">© {ARTIST_NAME}</footer>
  </div>
)

export default Layout
