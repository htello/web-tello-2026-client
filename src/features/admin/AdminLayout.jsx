import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ADMIN_NAV_SECTIONS, ARTIST_NAME } from '@/constants/businessRules.js'
import { useAuth } from '@/hooks/useAuth.js'
import SeoMeta from '@/components/SeoMeta.jsx'
import './AdminLayout.scss'

/**
 * Layout del panel admin: navegación lateral accesible (aria-current vía
 * NavLink), colapsable en móvil con botón de menú (aria-expanded/controls),
 * logout que limpia la sesión y vuelve a /admin/login, y <main> con <Outlet />
 * para las vistas anidadas. Mobile-first.
 */
const AdminLayout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [navOpen, setNavOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const handleNavigate = () => setNavOpen(false)

  return (
    <div className="admin-layout">
      <SeoMeta title={`Panel de administración — ${ARTIST_NAME}`} noindex />
      <header className="admin-layout__topbar">
        <Link to="/" className="admin-layout__topbar-brand">
          {ARTIST_NAME}
        </Link>
        <nav className="admin-layout__topbar-nav" aria-label="Acciones de administración">
          <button type="button" className="admin-layout__topbar-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </nav>
      </header>
      <button
        type="button"
        className="admin-layout__toggle"
        aria-expanded={navOpen}
        aria-controls="admin-nav"
        aria-label="Menú de administración"
        onClick={() => setNavOpen((current) => !current)}
      >
        <span className="admin-layout__toggle-icon" aria-hidden="true">
          ☰
        </span>
        Menú
      </button>
      <nav
        id="admin-nav"
        aria-label="Administración"
        className={navOpen ? 'admin-layout__nav admin-layout__nav--open' : 'admin-layout__nav'}
      >
        <p className="admin-layout__brand">Administración</p>
        <ul className="admin-layout__menu">
          {ADMIN_NAV_SECTIONS.map(({ label, to, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className="admin-layout__link" onClick={handleNavigate}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="admin-layout__main">
        <Outlet />
      </main>
      <footer className="admin-layout__footer">© {ARTIST_NAME}</footer>
    </div>
  )
}

export default AdminLayout
