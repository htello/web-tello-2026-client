import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PaintingSection from './PaintingSection.jsx'

const collections = [
  {
    id: 1,
    title: 'Serie Azul',
    description: 'Óleos sobre lienzo.',
    coverImage: 'https://example.com/azul.jpg',
    position: 1,
    isPublished: true,
  },
  { id: 2, title: 'Serie Roja', coverImage: 'https://example.com/roja.jpg', position: 2, isPublished: true },
]

const paintingsByCollection = {
  1: [
    { id: 10, title: 'Atardecer azul', imageUrl: 'https://example.com/p10.jpg', year: 2024, position: 1 },
    { id: 11, title: 'Mar de fondo', imageUrl: 'https://example.com/p11.jpg', year: 2023, position: 2 },
  ],
  2: [{ id: 20, title: 'Rojo apagado', imageUrl: 'https://example.com/p20.jpg', year: 2022, position: 1 }],
}

function jsonResponse(data) {
  return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => data }
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

const renderSection = () =>
  render(
    <MemoryRouter>
      <PaintingSection />
    </MemoryRouter>,
  )

describe('PaintingSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockApi())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra una columna con las colecciones y selecciona la primera', async () => {
    renderSection()

    const items = await screen.findAllByRole('button', { name: /Serie (Azul|Roja)/ })
    expect(items.map((item) => item.textContent)).toEqual(['Serie Azul', 'Serie Roja'])
    expect(screen.getByRole('heading', { name: 'Pintura' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Serie Azul' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Atardecer azul' })).toBeInTheDocument()
    expect(items[0]).toHaveAttribute('aria-current', 'true')
  })

  it('al pulsar una colección muestra sus obras en el panel derecho', async () => {
    const user = userEvent.setup()
    renderSection()

    await user.click(await screen.findByRole('button', { name: 'Serie Roja' }))

    expect(screen.getByRole('heading', { level: 2, name: 'Serie Roja' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Rojo apagado' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Serie Roja' })).toHaveAttribute('aria-current', 'true')
  })

  it('abre el lightbox al pulsar una obra', async () => {
    const user = userEvent.setup()
    renderSection()

    await user.click(await screen.findByRole('button', { name: 'Atardecer azul' }))

    expect(await screen.findByRole('dialog', { name: 'Atardecer azul' })).toBeInTheDocument()
  })

  it('el título del panel no enlaza a la página de la colección', async () => {
    renderSection()

    await screen.findByRole('heading', { level: 2, name: 'Serie Azul' })
    expect(
      screen.queryByRole('link', {
        name: 'Serie Azul',
        href: '/painting/collections/1',
      }),
    ).not.toBeInTheDocument()
  })

  it('muestra la descripción de la colección bajo el título', async () => {
    renderSection()

    const title = await screen.findByRole('heading', { level: 2, name: 'Serie Azul' })
    const description = screen.getByText('Óleos sobre lienzo.')
    expect(description.tagName).toBe('P')
    expect(description.compareDocumentPosition(title)).toBe(Node.DOCUMENT_POSITION_PRECEDING)
  })

  it('muestra el enlace a exposiciones', async () => {
    renderSection()

    expect(await screen.findByRole('link', { name: 'Ver exposiciones' })).toHaveAttribute(
      'href',
      '/painting/exhibitions',
    )
  })

  it('muestra un estado vacío sin colecciones', async () => {
    vi.stubGlobal('fetch', mockApi({ collectionsData: [] }))
    renderSection()

    expect(await screen.findByText(/no hay colecciones/i)).toBeInTheDocument()
  })

  it('muestra un skeleton durante la carga', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    renderSection()

    expect(screen.getByRole('status', { name: 'Cargando galería…' })).toBeInTheDocument()
  })
})
