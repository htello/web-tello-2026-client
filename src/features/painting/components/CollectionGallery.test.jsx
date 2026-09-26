import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CollectionGallery from './CollectionGallery.jsx'

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => data,
  }
}

const collectionDetail = {
  id: 1,
  title: 'Serie Azul',
  paintings: [
    { id: 30, title: 'Obra B', imageUrl: 'https://example.com/b.jpg', position: 2, isFeatured: false },
    { id: 31, title: 'Obra A', imageUrl: 'https://example.com/a.jpg', position: 1, isFeatured: true },
  ],
}

describe('CollectionGallery', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: collectionDetail })))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra las pinturas de la colección ordenadas por position', async () => {
    render(<CollectionGallery collectionId={1} />)

    await screen.findByRole('heading', { name: 'Serie Azul' })
    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(titles).toEqual(['Obra A', 'Obra B'])
  })

  it('abre el Lightbox al hacer click en una pintura', async () => {
    const user = userEvent.setup()
    render(<CollectionGallery collectionId={1} />)

    const button = await screen.findByRole('button', { name: 'Obra A' })
    await user.click(button)

    expect(screen.getByRole('dialog', { name: 'Obra A' })).toBeInTheDocument()
  })

  it('muestra un estado vacío sin pinturas', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { id: 2, title: 'Vacía', paintings: [] } })))
    render(<CollectionGallery collectionId={2} />)

    expect(await screen.findByText(/no hay obras/i)).toBeInTheDocument()
  })

  it('muestra un skeleton de colección durante la carga', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    render(<CollectionGallery collectionId={1} />)

    expect(screen.getByRole('status', { name: 'Cargando colección…' })).toBeInTheDocument()
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })

  it('define SEO y Open Graph con los datos de la colección', async () => {
    render(<CollectionGallery collectionId={1} />)
    await screen.findByRole('heading', { name: 'Serie Azul' })

    expect(document.title).toBe('Serie Azul — Antonio Tello')
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://example.com/a.jpg',
    )
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${window.location.origin}/painting/collections/1`,
    )
  })
})
