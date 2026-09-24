import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { PortfolioProvider } from '@/context/PortfolioProvider.jsx'
import BiographySection from './BiographySection.jsx'

function jsonResponse(data, ok = true, status = 200) {
  return { ok, status, headers: { get: () => 'application/json' }, json: async () => data }
}

function buildFetch({ biography, biographyStatus = 200 } = {}) {
  return vi.fn((url) => {
    if (url.endsWith('/biography')) {
      if (biographyStatus === 404) {
        return Promise.resolve(jsonResponse({ error: 'No existe', code: 'NOT_FOUND' }, false, 404))
      }
      return Promise.resolve(jsonResponse({ data: biography ?? null }))
    }
    return Promise.resolve(jsonResponse({ data: [] }))
  })
}

function renderWithProvider() {
  return render(
    <PortfolioProvider>
      <BiographySection />
    </PortfolioProvider>,
  )
}

describe('BiographySection', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra la biografía como texto plano y la fotografía del artista', async () => {
    vi.stubGlobal('fetch', buildFetch({ biography: { id: 1, content: 'Nací en 1970', imageUrl: 'https://example.com/foto.jpg' } }))

    renderWithProvider()

    expect(await screen.findByText('Nací en 1970')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /fotografía de antonio tello/i })).toBeInTheDocument()
  })

  it('muestra el estado "sin biografía" cuando no existe (404)', async () => {
    vi.stubGlobal('fetch', buildFetch({ biographyStatus: 404 }))

    renderWithProvider()

    expect(await screen.findByText(/sin biografía/i)).toBeInTheDocument()
  })

  it('no interpreta el contenido como HTML', async () => {
    vi.stubGlobal('fetch', buildFetch({ biography: { id: 1, content: '<script>alert(1)</script>' } }))

    renderWithProvider()

    expect(await screen.findByText('<script>alert(1)</script>')).toBeInTheDocument()
  })

  it('muestra un estado de error cuando la carga falla', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.endsWith('/collections')) return Promise.reject(new Error('red'))
      if (url.endsWith('/biography')) return Promise.resolve(jsonResponse({ data: null }))
      return Promise.resolve(jsonResponse({ data: [] }))
    }))

    renderWithProvider()

    expect(await screen.findByText(/no se pudo cargar/i)).toBeInTheDocument()
  })
})
