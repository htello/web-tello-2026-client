import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboard from './AdminDashboard.jsx'
import { adminApi } from '@/services/adminApi.js'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { setAuthToken } from '@/services/api.js'

vi.mock('@/services/adminApi.js', () => ({
  adminApi: {
    list: vi.fn(),
  },
}))

const ADMIN = { id: 1, email: 'admin@example.com', name: 'Antonio', role: 'ADMIN' }

function renderDashboard() {
  sessionStorage.setItem('admin_session', JSON.stringify({ token: 'token-1', user: ADMIN }))
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminDashboard />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function mockCounts(countsByResource) {
  adminApi.list.mockImplementation((resource) =>
    Promise.resolve({ data: Array.from({ length: countsByResource[resource] ?? 0 }, (_, i) => ({ id: i + 1 })) }),
  )
}

describe('AdminDashboard', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    sessionStorage.clear()
    setAuthToken(null)
  })

  it('muestra el título y la bienvenida con el nombre del admin', async () => {
    mockCounts({})
    renderDashboard()

    expect(screen.getByRole('heading', { name: /panel de administración/i })).toBeInTheDocument()
    expect(screen.getByText(/hola, antonio/i)).toBeInTheDocument()
  })

  it('muestra el estado de carga mientras obtiene los recuentos', () => {
    adminApi.list.mockReturnValue(new Promise(() => {}))
    renderDashboard()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra tarjetas con el recuento por entidad y accesos directos', async () => {
    mockCounts({ collections: 2, paintings: 10, exhibitions: 3, design: 7, illustrations: 5 })
    renderDashboard()

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

    expect(screen.getByRole('link', { name: /colecciones/i })).toHaveTextContent('2')
    expect(screen.getByRole('link', { name: /pinturas/i })).toHaveTextContent('10')
    expect(screen.getByRole('link', { name: /exhibiciones/i })).toHaveTextContent('3')
    expect(screen.getByRole('link', { name: /diseño/i })).toHaveTextContent('7')
    expect(screen.getByRole('link', { name: /ilustración/i })).toHaveTextContent('5')
    expect(screen.getByRole('link', { name: /colecciones/i })).toHaveAttribute(
      'href',
      '/admin/collections',
    )
  })

  it('consulta los cinco listados admin', async () => {
    mockCounts({})
    renderDashboard()

    await waitFor(() => expect(adminApi.list).toHaveBeenCalledTimes(5))
    expect(adminApi.list.mock.calls.map(([resource]) => resource).sort()).toEqual([
      'collections',
      'design',
      'exhibitions',
      'illustrations',
      'paintings',
    ])
  })

  it('muestra el estado de error cuando falla la carga', async () => {
    adminApi.list.mockRejectedValue(Object.assign(new Error('Error interno'), { status: 500 }))
    renderDashboard()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
