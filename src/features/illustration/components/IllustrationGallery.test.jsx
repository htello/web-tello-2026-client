import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IllustrationGallery from './IllustrationGallery.jsx'

function jsonResponse(data) {
  return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => data }
}

const illustrations = [
  { id: 1, title: 'Ilustración 1', imageUrl: 'https://example.com/i1.jpg', position: 1 },
  { id: 2, title: 'Ilustración 2', imageUrl: 'https://example.com/i2.jpg', position: 2 },
]

describe('IllustrationGallery', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: illustrations })))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra las ilustraciones con título e imagen', async () => {
    render(<IllustrationGallery />)

    expect(await screen.findByRole('img', { name: 'Ilustración 1' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ilustración 2' })).toBeInTheDocument()
    expect(screen.getByText('Ilustración 1')).toBeInTheDocument()
  })

  it('protege las imágenes contra descarga', async () => {
    render(<IllustrationGallery />)

    const img = await screen.findByRole('img', { name: 'Ilustración 1' })
    expect(img).toHaveAttribute('draggable', 'false')
  })

  it('abre el Lightbox al hacer click', async () => {
    const user = userEvent.setup()
    render(<IllustrationGallery />)

    await user.click(await screen.findByRole('button', { name: 'Ilustración 1' }))

    expect(screen.getByRole('dialog', { name: 'Ilustración 1' })).toBeInTheDocument()
  })

  it('muestra un estado vacío sin ilustraciones', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: [] })))
    render(<IllustrationGallery />)

    expect(await screen.findByText(/no hay ilustraciones/i)).toBeInTheDocument()
  })
})
