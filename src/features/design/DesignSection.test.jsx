import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DesignSection from './DesignSection.jsx'

const projectsBySubcategory = {
  'imagen-corporativa': [
    { id: 1, title: 'Logo Empresa', imageUrl: 'https://example.com/logo.jpg', isFeatured: true },
  ],
  'packaging-expositores': [
    { id: 2, title: 'Caja', imageUrl: 'https://example.com/caja.jpg', isFeatured: false },
  ],
  carteleria: [],
  editorial: [],
}

function jsonResponse(data) {
  return { ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => data }
}

function buildFetch(projects = projectsBySubcategory) {
  return vi.fn((url) => {
    const match = url.match(/subcategory=([a-z-]+)/)
    if (match) {
      return Promise.resolve(jsonResponse({ data: projects[match[1]] ?? [] }))
    }
    return Promise.reject(new Error('URL no esperada'))
  })
}

describe('DesignSection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', buildFetch())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra una columna con las categorías y selecciona la primera', async () => {
    render(<DesignSection />)

    const items = await screen.findAllByRole('button', { name: /^(Imagen corporativa|Packaging y Expositores)$/ })
    expect(items.map((item) => item.textContent)).toEqual(['Imagen corporativa', 'Packaging y Expositores'])
    expect(screen.getByRole('heading', { name: 'Diseño' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Imagen corporativa' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Logo Empresa' })).toBeInTheDocument()
    expect(items[0]).toHaveAttribute('aria-current', 'true')
  })

  it('al pulsar una categoría muestra sus proyectos en el panel derecho', async () => {
    const user = userEvent.setup()
    render(<DesignSection />)

    await user.click(await screen.findByRole('button', { name: 'Packaging y Expositores' }))

    expect(screen.getByRole('heading', { level: 2, name: 'Packaging y Expositores' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Caja' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Packaging y Expositores' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('abre el lightbox al pulsar un proyecto', async () => {
    const user = userEvent.setup()
    render(<DesignSection />)

    await user.click(await screen.findByRole('button', { name: 'Logo Empresa' }))

    expect(await screen.findByRole('dialog', { name: 'Logo Empresa' })).toBeInTheDocument()
  })

  it('muestra un estado vacío si ninguna categoría tiene proyectos', async () => {
    vi.stubGlobal('fetch', buildFetch({}))
    render(<DesignSection />)

    expect(await screen.findByText(/no hay proyectos/i)).toBeInTheDocument()
  })

  it('muestra un skeleton de galería durante la carga', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    render(<DesignSection />)

    expect(screen.getByRole('status', { name: 'Cargando galería…' })).toBeInTheDocument()
  })
})
