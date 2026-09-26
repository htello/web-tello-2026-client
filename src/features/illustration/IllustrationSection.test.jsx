import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IllustrationSection from './IllustrationSection.jsx'

const illustrations = [
  { id: 1, title: 'Ilustración 1', imageUrl: 'https://example.com/i1.jpg', position: 1 },
  { id: 2, title: 'Ilustración 2', imageUrl: 'https://example.com/i2.jpg', position: 2 },
]

function jsonResponse(data) {
  return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => data }
}

function mockIllustrations({ illustrationsData = illustrations } = {}) {
  return vi.fn((url) => {
    if (url.endsWith('/illustrations')) {
      return Promise.resolve(jsonResponse({ data: illustrationsData }))
    }
    return Promise.reject(new Error('URL no esperada'))
  })
}

describe('IllustrationSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockIllustrations())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra el grupo Ilustración con su retícula de obras', async () => {
    render(<IllustrationSection />)

    const item = await screen.findByRole('button', { name: 'Ilustración', exact: true })
    expect(item).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('heading', { level: 1, name: 'Ilustración' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Ilustración' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ilustración 1' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ilustración 2' })).toBeInTheDocument()
  })

  it('abre el lightbox al pulsar una ilustración', async () => {
    const user = userEvent.setup()
    render(<IllustrationSection />)

    await user.click(await screen.findByRole('button', { name: 'Ilustración 1' }))

    expect(await screen.findByRole('dialog', { name: 'Ilustración 1' })).toBeInTheDocument()
  })

  it('muestra un estado vacío sin ilustraciones', async () => {
    vi.stubGlobal('fetch', mockIllustrations({ illustrationsData: [] }))
    render(<IllustrationSection />)

    expect(await screen.findByText(/no hay ilustraciones/i)).toBeInTheDocument()
  })

  it('muestra un skeleton durante la carga', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    render(<IllustrationSection />)

    expect(screen.getByRole('status', { name: 'Cargando galería…' })).toBeInTheDocument()
  })
})
