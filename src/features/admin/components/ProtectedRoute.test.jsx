import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute.jsx'
import { useAuth } from '@/hooks/useAuth.js'

vi.mock('@/hooks/useAuth.js', () => ({ useAuth: vi.fn() }))

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<h1>Panel Admin</h1>} />
        </Route>
        <Route path="/admin/login" element={<h1>Login Admin</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('muestra estado de carga mientras se restaura la sesión', () => {
    useAuth.mockReturnValue({ isLoading: true, isAuthenticated: false, isAdmin: false })

    renderRoute()

    expect(screen.getByRole('status')).toHaveTextContent(/verificando sesión/i)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('permite el acceso a un ADMIN autenticado', () => {
    useAuth.mockReturnValue({ isLoading: false, isAuthenticated: true, isAdmin: true })

    renderRoute()

    expect(screen.getByRole('heading', { name: /panel admin/i })).toBeInTheDocument()
  })

  it('redirige a /admin/login si no está autenticado', () => {
    useAuth.mockReturnValue({ isLoading: false, isAuthenticated: false, isAdmin: false })

    renderRoute()

    expect(screen.getByRole('heading', { name: /login admin/i })).toBeInTheDocument()
  })

  it('redirige a /admin/login si el usuario no tiene rol ADMIN', () => {
    useAuth.mockReturnValue({ isLoading: false, isAuthenticated: true, isAdmin: false })

    renderRoute()

    expect(screen.getByRole('heading', { name: /login admin/i })).toBeInTheDocument()
  })
})
