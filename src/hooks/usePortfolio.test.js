import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { usePortfolio } from './usePortfolio.js'

function jsonResponse(data, ok = true, status = 200) {
  return { ok, status, headers: { get: () => 'application/json' }, json: async () => data }
}

function buildFetch({ featured, collections, exhibitions, biography, biographyStatus = 200 } = {}) {
  return vi.fn((url) => {
    if (url.endsWith('/paintings/featured')) return Promise.resolve(jsonResponse({ data: featured ?? [] }))
    if (url.endsWith('/collections')) return Promise.resolve(jsonResponse({ data: collections ?? [] }))
    if (url.endsWith('/exhibitions')) return Promise.resolve(jsonResponse({ data: exhibitions ?? [] }))
    if (url.endsWith('/biography')) {
      if (biographyStatus === 404) {
        return Promise.resolve(jsonResponse({ error: 'No existe', code: 'NOT_FOUND' }, false, 404))
      }
      return Promise.resolve(jsonResponse({ data: biography ?? null }))
    }
    return Promise.reject(new Error('URL no esperada'))
  })
}

describe('usePortfolio', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', buildFetch())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('carga featured, collections, exhibitions y biography', async () => {
    vi.stubGlobal('fetch', buildFetch({
      featured: [{ id: 1, title: 'F1' }],
      collections: [{ id: 2, title: 'C1' }],
      exhibitions: [{ id: 3, title: 'E1' }],
      biography: { id: 4, content: 'Bio' },
    }))

    const { result } = renderHook(() => usePortfolio())
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.featuredPaintings).toEqual([{ id: 1, title: 'F1' }])
    expect(result.current.collections).toEqual([{ id: 2, title: 'C1' }])
    expect(result.current.exhibitions).toEqual([{ id: 3, title: 'E1' }])
    expect(result.current.biography).toEqual({ id: 4, content: 'Bio' })
    expect(result.current.error).toBeNull()
  })

  it('expone error cuando una petición falla', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.endsWith('/collections')) return Promise.reject(new Error('red'))
      if (url.endsWith('/biography')) return Promise.resolve(jsonResponse({ data: null }))
      return Promise.resolve(jsonResponse({ data: [] }))
    }))

    const { result } = renderHook(() => usePortfolio())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).not.toBeNull()
  })

  it('trata la biografía 404 como sin biografía', async () => {
    vi.stubGlobal('fetch', buildFetch({ biographyStatus: 404 }))

    const { result } = renderHook(() => usePortfolio())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.biography).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('refresh recarga el contenido', async () => {
    const fetchMock = buildFetch({ featured: [{ id: 1, title: 'F1' }] })
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => usePortfolio())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const callsAfterLoad = fetchMock.mock.calls.length

    act(() => {
      result.current.refresh()
    })

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(callsAfterLoad))
  })
})
