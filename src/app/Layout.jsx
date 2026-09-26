import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { ARTIST_NAME, NAV_SECTIONS } from '@/constants/businessRules.js'
import './Layout.scss'

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="layout">
      <header className="layout__header">
        <nav className="layout__nav" aria-label="Navegación principal">
          <Link to="/" className="layout__brand" onClick={closeMenu}>
            {ARTIST_NAME}
          </Link>
          <button
            type="button"
            className="layout__toggle"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            aria-label="Menú de navegación"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className="layout__toggle-icon" aria-hidden="true">
              ☰
            </span>
            Menú
          </button>
          <ul
            id="main-nav"
            className={menuOpen ? 'layout__menu layout__menu--open' : 'layout__menu'}
          >
            {NAV_SECTIONS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="layout__link" onClick={closeMenu}>
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
}

export default Layout
