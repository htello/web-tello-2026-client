import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from './AuthContext.jsx'
import { useAuth } from '@/hooks/useAuth.js'
import { api, setAuthToken } from '@/services/api.js'

const BASE = 'http://localhost:3000/api/v1'
const SESSION_KEY = 'admin_session'
const ADMIN = { id: 1, email: 'admin@example.com', name: 'Admin', role: 'ADMIN' }

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

function jsonResponse(payload, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: async () => payload,
  }
}

function loginResponse(token = 'token-1', user = ADMIN) {
  return jsonResponse({ data: { token, user } })
}

async function loginWith(result, email = 'admin@example.com', password = 'pass1234') {
  await act(async () => {
    await result.current.login(email, password)
  })
}

describe('AuthContext', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    sessionStorage.clear()
    setAuthToken(null)
  })

  it('inicia sin usuario autenticado', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isAdmin).toBe(false)
  })

  it('login exitoso guarda la sesión y devuelve el usuario', async () => {
    const fetchMock = vi.fn().mockResolvedValue(loginResponse())
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useAuth(), { wrapper })

    let loggedUser
    await act(async () => {
      loggedUser = await result.current.login('admin@example.com', 'pass1234')
    })

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com', password: 'pass1234' }),
      }),
    )
    expect(loggedUser).toEqual(ADMIN)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.user).toEqual(ADMIN)
    expect(result.current.token).toBe('token-1')
    expect(JSON.parse(sessionStorage.getItem(SESSION_KEY))).toEqual({
      token: 'token-1',
      user: ADMIN,
    })
  })

  it('adjunta Authorization Bearer en peticiones admin tras el login', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(loginResponse())
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await loginWith(result)
    await api.get('/admin/collections')

    const [, options] = fetchMock.mock.calls[1]
    expect(options.headers['Authorization']).toBe('Bearer token-1')
  })

  it('credenciales inválidas (401) rechazan y no persisten la sesión', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ error: 'Credenciales inválidas', code: 'UNAUTHORIZED' }, false, 401),
        ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(result.current.login('admin@example.com', 'malo1234')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
      code: 'UNAUTHORIZED',
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('expone isLoading mientras la petición de login está en curso', async () => {
    let resolveLogin
    vi.stubGlobal('fetch', vi.fn(() => new Promise((resolve) => (resolveLogin = resolve))))
    const { result } = renderHook(() => useAuth(), { wrapper })

    let loginPromise
    act(() => {
      loginPromise = result.current.login('admin@example.com', 'pass1234')
    })
    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolveLogin(loginResponse())
      await loginPromise
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('logout limpia la sesión, el token y sessionStorage', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(loginResponse())
      .mockResolvedValueOnce(jsonResponse({ data: [] }))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await loginWith(result)
    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()

    await api.get('/admin/collections')
    const [, options] = fetchMock.mock.calls[1]
    expect(options.headers['Authorization']).toBeUndefined()
  })

  it('restaura la sesión al recargar desde sessionStorage', async () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'token-guardado', user: ADMIN }))
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.token).toBe('token-guardado')

    await api.get('/admin/collections')
    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers['Authorization']).toBe('Bearer token-guardado')
  })

  it('restaura un usuario sin rol ADMIN (isAuthenticated true, isAdmin false)', () => {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ token: 'token-user', user: { ...ADMIN, role: 'USER' } }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAdmin).toBe(false)
  })

  it('ignora una sesión corrupta en sessionStorage', () => {
    sessionStorage.setItem(SESSION_KEY, '{no-es-json')

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('un 403 en una ruta admin cierra la sesión automáticamente', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(loginResponse())
      .mockResolvedValueOnce(
        jsonResponse({ error: 'Token expirado', code: 'FORBIDDEN' }, false, 403),
      )
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await loginWith(result)
    await expect(api.get('/admin/collections')).rejects.toMatchObject({ status: 403 })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false))
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })

  it('un 403 fuera de /admin no cierra la sesión', async () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'token-1', user: ADMIN }))
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(jsonResponse({ error: 'Prohibido', code: 'FORBIDDEN' }, false, 403)),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(api.get('/collections')).rejects.toMatchObject({ status: 403 })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('useAuth fuera de AuthProvider lanza un error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth debe usarse dentro de <AuthProvider>',
    )
  })
})
