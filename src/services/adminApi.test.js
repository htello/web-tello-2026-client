import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthToken, setUnauthorizedHandler } from './api.js'
import { adminApi, ADMIN_RESOURCES } from './adminApi.js'

const BASE = 'http://localhost:3000/api/v1'
const NUEVA_CLAVE = 'nueva1234'
const CLAVE_REGISTRO = 'clave1234'

function jsonResponse(payload, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: async () => payload,
  }
}

function mockFetch(payload, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload, ok, status))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('adminApi', () => {
  beforeEach(() => {
    setAuthToken('token-admin')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    setAuthToken(null)
    setUnauthorizedHandler(null)
  })

  it('añade Authorization Bearer a las peticiones admin', async () => {
    const fetchMock = mockFetch({ data: [] })

    await adminApi.list('collections')

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/admin/collections`)
    expect(options.method).toBe('GET')
    expect(options.headers['Authorization']).toBe('Bearer token-admin')
  })

  it('parsea el éxito { data }', async () => {
    mockFetch({ data: [{ id: 1, title: 'Colección' }] })

    const result = await adminApi.list('collections')

    expect(result).toEqual({ data: [{ id: 1, title: 'Colección' }] })
  })

  it('parsea { data, meta } en GET /admin/users y admite paginación', async () => {
    const fetchMock = mockFetch({ data: [], meta: { total: 0, page: 2, limit: 20, pages: 0 } })

    const result = await adminApi.list('users', { params: { page: 2, limit: 20 } })

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/admin/users?page=2&limit=20`)
    expect(result.meta).toEqual({ total: 0, page: 2, limit: 20, pages: 0 })
  })

  it('traduce { error, code } a ApiError con mensaje en español', async () => {
    mockFetch({ error: 'El registro está duplicado', code: 'DUPLICATE_ERROR' }, false, 400)

    await expect(adminApi.create('collections', { title: 'X' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'DUPLICATE_ERROR',
      message: 'El registro está duplicado',
    })
  })

  it('dispara la limpieza de sesión en 401 UNAUTHORIZED', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    mockFetch({ error: 'Sin token', code: 'UNAUTHORIZED' }, false, 401)

    await expect(adminApi.list('paintings')).rejects.toMatchObject({ status: 401 })
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401, code: 'UNAUTHORIZED' }),
    )
  })

  it('dispara la limpieza de sesión en 403 FORBIDDEN', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    mockFetch({ error: 'Token expirado', code: 'FORBIDDEN' }, false, 403)

    await expect(adminApi.list('paintings')).rejects.toMatchObject({ status: 403 })
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403, code: 'FORBIDDEN' }),
    )
  })

  it('nunca loguea el token ni la cabecera Authorization', async () => {
    const spies = [
      vi.spyOn(console, 'log'),
      vi.spyOn(console, 'warn'),
      vi.spyOn(console, 'error'),
      vi.spyOn(console, 'info'),
      vi.spyOn(console, 'debug'),
    ]
    mockFetch({ data: [] })

    await adminApi.list('collections')

    for (const spy of spies) {
      for (const call of spy.mock.calls) {
        expect(JSON.stringify(call)).not.toContain('token-admin')
        expect(JSON.stringify(call)).not.toContain('Authorization')
      }
    }
  })

  it('create hace POST con body JSON', async () => {
    const fetchMock = mockFetch({ data: { id: 5 } })

    await adminApi.create('paintings', { title: 'Obra', year: 2020, collectionId: 1 })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/admin/paintings`)
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ title: 'Obra', year: 2020, collectionId: 1 }))
  })

  it('update hace PUT con solo los campos modificados (parcial)', async () => {
    const fetchMock = mockFetch({ data: { id: 5, title: 'Nuevo' } })

    await adminApi.update('paintings', 5, { title: 'Nuevo' })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/admin/paintings/5`)
    expect(options.method).toBe('PUT')
    expect(options.body).toBe(JSON.stringify({ title: 'Nuevo' }))
  })

  it('update rechaza payload vacío sin llamar a la red', async () => {
    const fetchMock = mockFetch({ data: null })

    await expect(adminApi.update('paintings', 5, {})).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VALIDATION_ERROR',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('remove hace DELETE', async () => {
    const fetchMock = mockFetch({ data: null })

    await adminApi.remove('collections', 3)

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/admin/collections/3`)
    expect(options.method).toBe('DELETE')
  })

  it('reorder hace PUT con SOLO orderedIds (sin collectionId en paintings)', async () => {
    const fetchMock = mockFetch({ data: null })

    await adminApi.reorder('paintings', [3, 1, 2])

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/admin/paintings/reorder`)
    expect(options.method).toBe('PUT')
    expect(options.body).toBe(JSON.stringify({ orderedIds: [3, 1, 2] }))
  })

  it('reorder para cada recurso reorderable usa su ruta', async () => {
    const fetchMock = mockFetch({ data: null })

    for (const resource of ['collections', 'exhibitions', 'design', 'illustrations']) {
      await adminApi.reorder(resource, [1, 2])
    }

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      `${BASE}/admin/collections/reorder`,
      `${BASE}/admin/exhibitions/reorder`,
      `${BASE}/admin/design/reorder`,
      `${BASE}/admin/illustrations/reorder`,
    ])
  })

  it('rechaza recursos no contemplados sin llamar a la red', async () => {
    const fetchMock = mockFetch({ data: null })

    await expect(adminApi.list('posts')).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VALIDATION_ERROR',
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(ADMIN_RESOURCES).toContain('collections')
  })

  it('rechaza reorder de recursos no reordenables sin llamar a la red', async () => {
    const fetchMock = mockFetch({ data: null })

    await expect(adminApi.reorder('users', [1, 2])).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VALIDATION_ERROR',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('omite params undefined/null y no añade "?" cuando quedan vacíos', async () => {
    const fetchMock = mockFetch({ data: [] })

    await adminApi.list('users', { params: { page: undefined, limit: null } })

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/admin/users`)
  })

  it('upload usa section "general" para secciones no válidas', async () => {
    const fetchMock = mockFetch({ data: {} })

    await adminApi.upload(new File(['img'], 'x.jpg'), 'otra')

    expect(fetchMock.mock.calls[0][1].body.get('section')).toBe('general')
  })

  it('upload envía FormData con file y section sin forzar Content-Type', async () => {
    const fetchMock = mockFetch({ data: { url: 'https://cdn/x.jpg', thumbnail: 'https://cdn/x_t.jpg' } })
    const file = new File(['img'], 'x.jpg', { type: 'image/jpeg' })

    const result = await adminApi.upload(file, 'pintura')

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/admin/upload`)
    expect(options.method).toBe('POST')
    expect(options.headers['Content-Type']).toBeUndefined()
    expect(options.body.get('file')).toBe(file)
    expect(options.body.get('section')).toBe('pintura')
    expect(result.data.url).toBe('https://cdn/x.jpg')
  })

  it('upload usa section "general" por defecto', async () => {
    const fetchMock = mockFetch({ data: {} })

    await adminApi.upload(new File(['img'], 'x.jpg'))

    expect(fetchMock.mock.calls[0][1].body.get('section')).toBe('general')
  })

  it('createBiography hace POST /admin/biography', async () => {
    const fetchMock = mockFetch({ data: { id: 1 } })

    await adminApi.createBiography({ content: 'Texto' })

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/admin/biography`)
    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
  })

  it('updateBiography hace PUT /admin/biography parcial', async () => {
    const fetchMock = mockFetch({ data: { id: 1 } })

    await adminApi.updateBiography({ content: 'Nuevo' })

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/admin/biography`)
    expect(fetchMock.mock.calls[0][1].method).toBe('PUT')
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ content: 'Nuevo' }))
  })

  it('updateBiography rechaza payload vacío sin llamar a la red', async () => {
    const fetchMock = mockFetch({ data: null })

    await expect(adminApi.updateBiography({})).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('updateUserPassword hace PUT /admin/users/:id/password', async () => {
    const fetchMock = mockFetch({ data: null })

    await adminApi.updateUserPassword(7, { password: NUEVA_CLAVE })

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/admin/users/7/password`)
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ password: NUEVA_CLAVE }))
  })

  it('getUser hace GET /admin/users/:id', async () => {
    const fetchMock = mockFetch({ data: { id: 7, email: 'a@b.c' } })

    const result = await adminApi.getUser(7)

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/admin/users/7`)
    expect(result.data.email).toBe('a@b.c')
  })

  it('registerUser hace POST /admin/users/register', async () => {
    const fetchMock = mockFetch({ data: { id: 9 } })

    await adminApi.registerUser({ name: 'Ana', email: 'ana@b.c', password: CLAVE_REGISTRO })

    expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/admin/users/register`)
    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
  })

  it('reenvía el error 400 de reorder con IDs inexistentes', async () => {
    mockFetch({ error: 'Algunos IDs no existen', code: 'VALIDATION_ERROR' }, false, 400)

    await expect(adminApi.reorder('collections', [999])).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Algunos IDs no existen',
    })
  })

  it('aborta la petición cuando la señal externa se aborta', async () => {
    const fetchMock = vi.fn(
      (_url, options) =>
        new Promise((_, reject) => {
          options.signal.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          )
        }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    const promise = adminApi.list('design', { signal: controller.signal })
    controller.abort()

    await expect(promise).rejects.toMatchObject({ code: 'TIMEOUT', status: 0 })
  })
})
