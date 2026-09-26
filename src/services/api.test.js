import { afterEach, describe, expect, it, vi } from 'vitest'
import { api, setAuthToken, setUnauthorizedHandler } from './api.js'

const BASE = 'http://localhost:3000/api/v1'

function jsonResponse(data, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data,
  }
}

describe('api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.useRealTimers()
    setAuthToken(null)
    setUnauthorizedHandler(null)
  })

  it('hace GET y devuelve el envelope { data, meta }', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [1, 2], meta: { total: 2 } }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await api.get('/collections')

    expect(result).toEqual({ data: [1, 2], meta: { total: 2 } })
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE}/collections`,
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('llama a post, put y del con el método correcto', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: null }))
    vi.stubGlobal('fetch', fetchMock)

    await api.post('/contact', { name: 'X' })
    await api.put('/collections/1', { title: 'Y' })
    await api.del('/collections/1')

    expect(fetchMock.mock.calls.map(([, options]) => options.method)).toEqual([
      'POST',
      'PUT',
      'DELETE',
    ])
  })

  it('envía JSON con Content-Type application/json', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: {} }))
    vi.stubGlobal('fetch', fetchMock)

    await api.post('/contact', { name: 'Ana' })

    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe(JSON.stringify({ name: 'Ana' }))
  })

  it('envía FormData sin forzar Content-Type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: {} }))
    vi.stubGlobal('fetch', fetchMock)

    const formData = new FormData()
    formData.append('file', new Blob(['x']), 'x.jpg')
    await api.post('/admin/upload', formData)

    const [, options] = fetchMock.mock.calls[0]
    expect(options.body).toBe(formData)
    expect(options.headers['Content-Type']).toBeUndefined()
  })

  it('lanza ApiError con status y code en errores de API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ error: 'Email no válido', code: 'VALIDATION_ERROR' }, false, 400)),
    )

    await expect(api.post('/contact', {})).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Email no válido',
    })
  })

  it('lanza ApiError genérico cuando la respuesta de error no es JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: { get: () => 'text/plain' },
        json: async () => {
          throw new Error('no json')
        },
      }),
    )

    await expect(api.get('/collections')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      message: 'Error 500',
    })
  })

  it('lanza ApiError TIMEOUT cuando la petición se aborta', async () => {
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError))

    await expect(api.get('/collections')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'TIMEOUT',
      status: 0,
    })
  })

  it('relanza errores de red que no son abort', async () => {
    const networkError = new Error('sin conexión')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError))

    await expect(api.get('/collections')).rejects.toBe(networkError)
  })

  it('aborta la petición cuando la señal externa se aborta', async () => {
    const external = new AbortController()
    let capturedOptions

    const fetchMock = vi.fn((_url, options) => {
      capturedOptions = options
      return new Promise((_, reject) => {
        options.signal.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        )
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const promise = api.get('/collections', { signal: external.signal })
    external.abort()

    await expect(promise).rejects.toMatchObject({ code: 'TIMEOUT' })
    expect(capturedOptions).toBeDefined()
  })

  it('aborta por timeout interno', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(
      (_url, options) =>
        new Promise((_, reject) => {
          options.signal.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          )
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const promise = api.get('/collections', { timeout: 1000 })
    const assertion = expect(promise).rejects.toMatchObject({ code: 'TIMEOUT' })
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })

  it('devuelve null cuando la respuesta no es JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: { get: () => null },
        json: async () => {
          throw new Error('no json')
        },
      }),
    )

    const result = await api.del('/collections/1')
    expect(result).toBeNull()
  })

  it('adjunta Authorization Bearer cuando hay token', async () => {
    setAuthToken('mi-token')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: {} }))
    vi.stubGlobal('fetch', fetchMock)

    await api.get('/admin/collections')

    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers['Authorization']).toBe('Bearer mi-token')
  })

  it('no adjunta Authorization sin token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: {} }))
    vi.stubGlobal('fetch', fetchMock)

    await api.get('/collections')

    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers['Authorization']).toBeUndefined()
  })

  it('invoca el unauthorizedHandler en 403 de rutas /admin', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ error: 'Token expirado', code: 'FORBIDDEN' }, false, 403),
        ),
    )

    await expect(api.get('/admin/collections')).rejects.toMatchObject({ status: 403 })
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, code: 'FORBIDDEN' }),
    )
  })

  it('invoca el unauthorizedHandler en 401 de rutas /admin', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(jsonResponse({ error: 'Sin token', code: 'UNAUTHORIZED' }, false, 401)),
    )

    await expect(api.get('/admin/users')).rejects.toMatchObject({ status: 401 })
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, code: 'UNAUTHORIZED' }),
    )
  })

  it('no invoca el unauthorizedHandler en 401 fuera de /admin', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ error: 'Credenciales inválidas', code: 'UNAUTHORIZED' }, false, 401),
        ),
    )

    await expect(api.post('/auth/login', {})).rejects.toMatchObject({ status: 401 })
    expect(handler).not.toHaveBeenCalled()
  })

  it('no invoca el unauthorizedHandler en 500 de rutas /admin', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ error: 'Error', code: 'INTERNAL_ERROR' }, false, 500)),
    )

    await expect(api.get('/admin/collections')).rejects.toMatchObject({ status: 500 })
    expect(handler).not.toHaveBeenCalled()
  })

  it('deja de invocar el unauthorizedHandler tras desregistrarlo', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    setUnauthorizedHandler(null)
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(jsonResponse({ error: 'Prohibido', code: 'FORBIDDEN' }, false, 403)),
    )

    await expect(api.get('/admin/collections')).rejects.toMatchObject({ status: 403 })
    expect(handler).not.toHaveBeenCalled()
  })

  it('usa el fallback localhost cuando VITE_API_URL no está definida', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_API_URL', undefined)
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: null }))
    vi.stubGlobal('fetch', fetchMock)

    const { api: apiWithoutEnv } = await import('./api.js')
    await apiWithoutEnv.get('/health')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/health',
      expect.objectContaining({ method: 'GET' }),
    )
    vi.unstubAllEnvs()
    vi.resetModules()
  })
})
