import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { PortfolioProvider } from '@/context/PortfolioProvider.jsx'
import ExhibitionList from './ExhibitionList.jsx'

function jsonResponse(data, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data,
  }
}

const exhibitions = [
  { id: 1, title: 'Expo B', date: '2024-06-10', location: 'Madrid', position: 2, isPublished: true },
  { id: 2, title: 'Expo A', date: '2023-03-05', location: 'Valencia', description: 'Retrospectiva', position: 1, isPublished: true },
]

function buildFetch({ exhibitionsData = exhibitions } = {}) {
  return vi.fn((url) => {
    if (url.endsWith('/exhibitions')) return Promise.resolve(jsonResponse({ data: exhibitionsData }))
    if (url.endsWith('/paintings/featured')) return Promise.resolve(jsonResponse({ data: [] }))
    if (url.endsWith('/collections')) return Promise.resolve(jsonResponse({ data: [] }))
    if (url.endsWith('/biography')) {
      return Promise.resolve(jsonResponse({ error: 'No existe', code: 'NOT_FOUND' }, false, 404))
    }
    return Promise.reject(new Error('URL no esperada'))
  })
}

const renderList = () =>
  render(
    <PortfolioProvider>
      <ExhibitionList />
    </PortfolioProvider>,
  )

describe('ExhibitionList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', buildFetch())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('lista las exposiciones ordenadas por position con title, date y location', async () => {
    renderList()

    const titles = (await screen.findAllByRole('heading')).map((h) => h.textContent)
    expect(titles).toEqual(['Expo A', 'Expo B'])
    expect(screen.getByText('Valencia')).toBeInTheDocument()
    expect(screen.getByText(/retrospectiva/i)).toBeInTheDocument()
  })

  it('muestra la fecha formateada en español', async () => {
    renderList()

    expect(await screen.findByText(/5 de marzo de 2023/)).toBeInTheDocument()
  })

  it('muestra un estado vacío sin exposiciones', async () => {
    vi.stubGlobal('fetch', buildFetch({ exhibitionsData: [] }))
    renderList()

    expect(await screen.findByText(/no hay exposiciones/i)).toBeInTheDocument()
  })
})
