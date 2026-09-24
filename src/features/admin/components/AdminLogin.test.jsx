import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminLogin from './AdminLogin.jsx'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { setAuthToken } from '@/services/api.js'

const ADMIN = { id: 1, email: 'admin@example.com', name: 'Admin', role: 'ADMIN' }

function jsonResponse(data, ok = true, status = 200) {
  return { ok, status, headers: { get: () => 'application/json' }, json: async () => data }
}

function renderLogin({ withRoutes = false } = {}) {
  const element = (
    <MemoryRouter initialEntries={['/admin/login']}>
      <AuthProvider>
        {withRoutes ? (
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<h1>Panel Admin</h1>} />
          </Routes>
        ) : (
          <AdminLogin />
        )}
      </AuthProvider>
    </MemoryRouter>
  )
  return render(element)
}

async function fillCredentials(user, email = 'admin@example.com', password = 'pass1234') {
  await user.type(screen.getByLabelText(/email/i), email)
  await user.type(screen.getByLabelText(/contraseña/i), password)
}

describe('AdminLogin', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    sessionStorage.clear()
    setAuthToken(null)
  })

  it('renderiza inputs accesibles y el botón de entrada', () => {
    renderLogin()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('deshabilita el botón con formulario inválido y lo habilita al completarlo', async () => {
    renderLogin()
    const submit = screen.getByRole('button', { name: /entrar/i })
    expect(submit).toBeDisabled()

    const user = userEvent.setup()
    await fillCredentials(user)

    expect(submit).toBeEnabled()
  })

  it('muestra errores de campo si se fuerza el submit con formulario inválido', () => {
    const { container } = renderLogin()

    fireEvent.submit(container.querySelector('form'))

    expect(screen.getByText(/email es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/contraseña es obligatoria/i)).toBeInTheDocument()
  })

  it('inicia sesión y navega a /admin con éxito', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: { token: 'token-1', user: ADMIN } }))
    vi.stubGlobal('fetch', fetchMock)
    renderLogin({ withRoutes: true })
    const user = userEvent.setup()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: /panel admin/i })).toBeInTheDocument()
    expect(sessionStorage.getItem('admin_session')).toContain('token-1')
  })

  it('muestra el estado de éxito tras iniciar sesión', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ data: { token: 'token-1', user: ADMIN } })),
    )
    renderLogin()
    const user = userEvent.setup()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/sesión iniciada/i)).toBeInTheDocument()
  })

  it('muestra estado de carga mientras espera la respuesta', async () => {
    let resolveLogin
    const fetchMock = vi.fn(() => new Promise((resolve) => (resolveLogin = resolve)))
    vi.stubGlobal('fetch', fetchMock)
    renderLogin({ withRoutes: true })
    const user = userEvent.setup()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()

    resolveLogin(jsonResponse({ data: { token: 'token-1', user: ADMIN } }))
    expect(await screen.findByRole('heading', { name: /panel admin/i })).toBeInTheDocument()
  })

  it('muestra «Credenciales inválidas» en 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ error: 'Credenciales inválidas', code: 'UNAUTHORIZED' }, false, 401),
        ),
    )
    renderLogin()
    const user = userEvent.setup()

    await fillCredentials(user, 'admin@example.com', 'malo1234')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/credenciales inválidas/i)
    expect(sessionStorage.getItem('admin_session')).toBeNull()
  })

  it('muestra mensaje específico con rate limit 429', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ error: 'Demasiados intentos', code: 'RATE_LIMITED' }, false, 429),
        ),
    )
    renderLogin()
    const user = userEvent.setup()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /demasiados intentos.*espera un minuto/i,
    )
  })

  it('muestra error genérico ante un fallo interno del servidor', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(jsonResponse({ error: 'Error', code: 'INTERNAL_ERROR' }, false, 500)),
    )
    renderLogin()
    const user = userEvent.setup()

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo iniciar sesión/i)
  })

  it('oculta la contraseña y no expone el token en el DOM', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ data: { token: 'token-secreto', user: ADMIN } })),
    )
    renderLogin()
    const user = userEvent.setup()

    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('type', 'password')

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(screen.getByText(/sesión iniciada/i)).toBeInTheDocument())
    expect(document.body.innerHTML).not.toContain('token-secreto')
  })

  it('enlaza a la recuperación de contraseña', () => {
    renderLogin()

    expect(
      screen.getByRole('link', { name: /olvidado mi contraseña/i }),
    ).toHaveAttribute('href', '/admin/forgot-password')
  })
})
