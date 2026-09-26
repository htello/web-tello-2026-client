import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DesignGallery from './DesignGallery.jsx'

function jsonResponse(data) {
  return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => data }
}

const projects = [
  { id: 1, title: 'Logo', imageUrl: 'https://example.com/logo.jpg', description: 'Logo corporativo' },
  { id: 2, title: 'Cartel', imageUrl: 'https://example.com/cartel.jpg' },
]

describe('DesignGallery', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra todos los proyectos de la subcategoría', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: projects })))
    render(<DesignGallery subcategory="imagen-corporativa" />)

    expect(await screen.findByRole('img', { name: 'Logo' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Cartel' })).toBeInTheDocument()
    expect(screen.getByText('Logo corporativo')).toBeInTheDocument()
  })

  it('abre el Lightbox al hacer click en un proyecto', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: projects })))
    render(<DesignGallery subcategory="imagen-corporativa" />)

    await user.click(await screen.findByRole('button', { name: 'Logo' }))

    expect(screen.getByRole('dialog', { name: 'Logo' })).toBeInTheDocument()
  })

  it('muestra un estado vacío sin proyectos', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: [] })))
    render(<DesignGallery subcategory="editorial" />)

    expect(await screen.findByText(/no hay proyectos/i)).toBeInTheDocument()
  })

  it('muestra un estado de error cuando falla la carga', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('red')))
    render(<DesignGallery subcategory="editorial" />)

    expect(await screen.findByText(/no se pudieron cargar/i)).toBeInTheDocument()
  })

  it('muestra un skeleton de galería durante la carga', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    render(<DesignGallery subcategory="editorial" />)

    expect(screen.getByRole('status', { name: 'Cargando galería…' })).toBeInTheDocument()
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })
})
