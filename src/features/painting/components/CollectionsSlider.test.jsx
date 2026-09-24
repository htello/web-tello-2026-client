import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CollectionsSlider from './CollectionsSlider.jsx'

const collections = [
  { id: 1, title: 'Serie Azul', description: 'Obras en azul', coverImage: 'https://example.com/azul.jpg', position: 1, isPublished: true, paintingsCount: 1 },
  { id: 2, title: 'Serie Roja', coverImage: 'https://example.com/roja.jpg', position: 2, isPublished: true, paintingsCount: 1 },
]

const paintingsByCollection = {
  1: [{ id: 10, title: 'Atardecer azul', imageUrl: 'https://example.com/p10.jpg', isFeatured: true }],
  2: [{ id: 20, title: 'Rojo apagado', imageUrl: 'https://example.com/p20.jpg', isFeatured: false }],
}

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => data,
  }
}

function mockApi({ collectionsData = collections, paintings = paintingsByCollection } = {}) {
  return vi.fn((url) => {
    if (url.endsWith('/collections')) {
      return Promise.resolve(jsonResponse({ data: collectionsData }))
    }
    const match = url.match(/\/collections\/(\d+)$/)
    if (match) {
      const id = Number(match[1])
      const collection = collectionsData.find((c) => c.id === id)
      return Promise.resolve(jsonResponse({ data: { ...collection, paintings: paintings[id] ?? [] } }))
    }
    return Promise.reject(new Error('URL no esperada'))
  })
}

const renderSlider = () =>
  render(
    <MemoryRouter>
      <CollectionsSlider />
    </MemoryRouter>,
  )

describe('CollectionsSlider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockApi())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra todas las colecciones una debajo de la otra', async () => {
    renderSlider()

    expect(await screen.findByRole('heading', { name: 'Serie Azul' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Serie Roja' })).toBeInTheDocument()
  })

  it('muestra las pinturas destacadas de cada colección', async () => {
    renderSlider()

    expect(await screen.findByRole('img', { name: 'Atardecer azul' })).toBeInTheDocument()
  })

  it('usa la portada como fallback cuando no hay destacadas', async () => {
    renderSlider()

    expect(await screen.findByRole('img', { name: 'Serie Roja' })).toBeInTheDocument()
  })

  it('enlaza cada colección a su galería', async () => {
    renderSlider()

    expect(await screen.findByRole('link', { name: 'Serie Azul' })).toHaveAttribute('href', '/painting/collections/1')
  })

  it('muestra un estado vacío sin colecciones', async () => {
    vi.stubGlobal('fetch', mockApi({ collectionsData: [] }))
    renderSlider()

    expect(await screen.findByText(/no hay colecciones/i)).toBeInTheDocument()
  })
})
