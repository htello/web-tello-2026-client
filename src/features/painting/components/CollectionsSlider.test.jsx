import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CollectionsSlider from './CollectionsSlider.jsx'

const renderSlider = () =>
  render(
    <MemoryRouter>
      <CollectionsSlider />
    </MemoryRouter>,
  )

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

describe('CollectionsSlider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockApi())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra la colección activa con título, descripción y pintura destacada', async () => {
    renderSlider()

    expect(await screen.findByRole('heading', { name: 'Serie Azul' })).toBeInTheDocument()
    expect(screen.getByText('Obras en azul')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Atardecer azul' })).toBeInTheDocument()
  })

  it('permite avanzar entre colecciones con controles accesibles', async () => {
    const user = userEvent.setup()
    renderSlider()

    await screen.findByRole('heading', { name: 'Serie Azul' })
    await user.click(screen.getByRole('button', { name: 'Colección siguiente' }))

    expect(await screen.findByRole('heading', { name: 'Serie Roja' })).toBeInTheDocument()
  })

  it('usa la portada como fallback cuando no hay pinturas destacadas', async () => {
    const user = userEvent.setup()
    renderSlider()

    await screen.findByRole('heading', { name: 'Serie Azul' })
    await user.click(screen.getByRole('button', { name: 'Colección siguiente' }))

    expect(await screen.findByRole('img', { name: 'Serie Roja' })).toBeInTheDocument()
  })

  it('enlaza cada colección a su galería', async () => {
    renderSlider()

    const link = await screen.findByRole('link', { name: 'Serie Azul' })
    expect(link).toHaveAttribute('href', '/painting/collections/1')
  })

  it('muestra un estado vacío cuando no hay colecciones', async () => {
    vi.stubGlobal('fetch', mockApi({ collectionsData: [] }))
    renderSlider()

    expect(await screen.findByText(/no hay colecciones/i)).toBeInTheDocument()
  })
})
