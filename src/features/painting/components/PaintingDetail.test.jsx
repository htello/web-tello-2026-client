import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import PaintingDetail from './PaintingDetail.jsx'

function jsonResponse(data, ok = true, status = 200) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: async () => data,
  }
}

const fullPainting = {
  id: 7,
  title: 'Atardecer',
  imageUrl: 'https://example.com/atardecer.jpg',
  dimensions: '80 x 100 cm',
  technique: 'Óleo',
  year: 2020,
  isFeatured: true,
  collection: { id: 3, title: 'Serie Azul' },
}

const partialPainting = {
  id: 8,
  title: 'Sin datos',
  imageUrl: 'https://example.com/sin.jpg',
  isFeatured: false,
  collection: { id: 3, title: 'Serie Azul' },
}

describe('PaintingDetail', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra la pintura y sus datos técnicos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: fullPainting })))
    render(<PaintingDetail paintingId={7} />)

    expect(await screen.findByRole('heading', { name: 'Atardecer' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Atardecer' })).toBeInTheDocument()
    expect(screen.getByText('80 x 100 cm')).toBeInTheDocument()
    expect(screen.getByText('Óleo')).toBeInTheDocument()
    expect(screen.getByText('2020')).toBeInTheDocument()
  })

  it('no renderiza filas vacías cuando faltan datos técnicos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: partialPainting })))
    render(<PaintingDetail paintingId={8} />)

    await screen.findByRole('heading', { name: 'Sin datos' })
    expect(screen.queryByText(/dimensiones/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/técnica/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/año/i)).not.toBeInTheDocument()
  })

  it('muestra un botón para volver a la colección', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: fullPainting })))
    render(<PaintingDetail paintingId={7} />)

    const back = await screen.findByRole('link', { name: /volver a la colección/i })
    expect(back).toHaveAttribute('href', '/painting/collections/3')
  })

  it('muestra not found para una pintura inexistente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'No encontrada', code: 'NOT_FOUND' }, false, 404)))
    render(<PaintingDetail paintingId={999} />)

    expect(await screen.findByText(/no encontrada/i)).toBeInTheDocument()
  })
})
