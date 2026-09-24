import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminPanel from './AdminPanel.jsx'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { setAuthToken } from '@/services/api.js'

const ADMIN = { id: 1, email: 'admin@example.com', name: 'Antonio', role: 'ADMIN' }

function renderPanel() {
  sessionStorage.setItem('admin_session', JSON.stringify({ token: 'token-1', user: ADMIN }))
  return render(
    <AuthProvider>
      <AdminPanel />
    </AuthProvider>,
  )
}

describe('AdminPanel', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    sessionStorage.clear()
    setAuthToken(null)
  })

  it('saluda al usuario autenticado', () => {
    renderPanel()

    expect(screen.getByRole('heading', { name: /panel de administración/i })).toBeInTheDocument()
    expect(screen.getByText(/hola, antonio/i)).toBeInTheDocument()
  })

  it('cierra la sesión al pulsar el botón de logout', async () => {
    renderPanel()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    expect(sessionStorage.getItem('admin_session')).toBeNull()
  })
})
