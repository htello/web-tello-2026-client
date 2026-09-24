import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'

const ADMIN = { id: 1, email: 'admin@example.com', name: 'Antonio', role: 'ADMIN' }

describe('App', () => {
  afterEach(() => {
    cleanup()
    sessionStorage.clear()
  })

  it('muestra la navegación principal con las cinco disciplinas', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('navigation', { name: 'Navegación principal' }),
    ).toBeInTheDocument()

    for (const name of ['Pintura', 'Ilustración', 'Diseño', 'Biografía', 'Contacto']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
  })

  it('redirige /admin al login cuando no hay sesión', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /acceso administración/i }),
    ).toBeInTheDocument()
  })

  it('muestra el panel admin con una sesión ADMIN restaurada', () => {
    sessionStorage.setItem('admin_session', JSON.stringify({ token: 'token-1', user: ADMIN }))

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /panel de administración/i })).toBeInTheDocument()
    expect(screen.getByText(/hola, antonio/i)).toBeInTheDocument()
  })
})
