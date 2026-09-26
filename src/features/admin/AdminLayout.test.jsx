import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from './AdminLayout.jsx'
import { ADMIN_NAV_SECTIONS as ADMIN_NAV, ARTIST_NAME } from '@/constants/businessRules.js'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { setAuthToken } from '@/services/api.js'

const ADMIN = { id: 1, email: 'admin@example.com', name: 'Antonio', role: 'ADMIN' }

function renderLayout(initialEntry = '/admin') {
  sessionStorage.setItem('admin_session', JSON.stringify({ token: 'token-1', user: ADMIN }))
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<h1>Dashboard</h1>} />
            <Route path="collections" element={<h1>Colecciones</h1>} />
          </Route>
          <Route path="/admin/login" element={<h1>Acceso administración</h1>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('AdminLayout', () => {
  afterEach(() => {
    cleanup()
    sessionStorage.clear()
    setAuthToken(null)
  })

  it('renderiza la navegación admin con todas las secciones', () => {
    renderLayout()

    const nav = screen.getByRole('navigation', { name: 'Administración' })
    expect(nav).toBeInTheDocument()

    for (const { label } of ADMIN_NAV) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
    expect(ADMIN_NAV.map((item) => item.label)).toEqual([
      'Dashboard',
      'Colecciones',
      'Pinturas',
      'Exhibiciones',
      'Diseño',
      'Ilustración',
      'Biografía',
      'Usuarios',
    ])
  })

  it('renderiza el header con la marca pública y el logout', () => {
    renderLayout()

    const header = screen.getByRole('banner')
    expect(header).toHaveTextContent(ARTIST_NAME)
    expect(header).toContainElement(screen.getByRole('button', { name: 'Cerrar sesión' }))
  })

  it('renderiza el footer con el copyright', () => {
    renderLayout()

    expect(screen.getByRole('contentinfo')).toHaveTextContent(`© ${ARTIST_NAME}`)
  })

  it('marca la sección activa con aria-current', async () => {
    const user = userEvent.setup()
    renderLayout()

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await user.click(screen.getByRole('link', { name: 'Colecciones' }))

    expect(screen.getByRole('link', { name: 'Colecciones' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('renderiza la vista anidada dentro de main', () => {
    renderLayout()

    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Dashboard' }),
    )
  })

  it('colapsa y expande la navegación en móvil con aria-expanded', async () => {
    const user = userEvent.setup()
    renderLayout()

    const toggle = screen.getByRole('button', { name: 'Menú de administración' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'admin-nav')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('cierra el menú móvil al navegar a una sección', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Menú de administración' }))
    await user.click(screen.getByRole('link', { name: 'Colecciones' }))

    expect(screen.getByRole('button', { name: 'Menú de administración' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('el logout limpia la sesión y vuelve a /admin/login', async () => {
    const user = userEvent.setup()
    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(screen.getByRole('heading', { name: 'Acceso administración' })).toBeInTheDocument()
    expect(sessionStorage.getItem('admin_session')).toBeNull()
  })

  it('marca el panel como noindex para los buscadores', () => {
    renderLayout()

    const robots = document.head.querySelector('meta[name="robots"]')
    expect(robots).toHaveAttribute('content', 'noindex, nofollow')
    expect(document.title).toBe('Panel de administración — Antonio Tello')
    robots.remove()
  })
})
