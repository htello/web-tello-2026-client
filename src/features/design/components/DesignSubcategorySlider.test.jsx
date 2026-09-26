import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DesignSubcategorySlider from './DesignSubcategorySlider.jsx'

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

const renderSlider = () =>
  render(
    <MemoryRouter>
      <DesignSubcategorySlider />
    </MemoryRouter>,
  )

describe('DesignSubcategorySlider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', buildFetch())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('muestra solo las subcategorías con proyectos publicados', async () => {
    renderSlider()

    expect(await screen.findByText('Imagen corporativa')).toBeInTheDocument()
    expect(screen.getByText('Packaging y Expositores')).toBeInTheDocument()
    expect(screen.queryByText('Cartelería')).not.toBeInTheDocument()
    expect(screen.queryByText('Editorial')).not.toBeInTheDocument()
  })

  it('muestra un estado vacío si ninguna subcategoría tiene proyectos', async () => {
    vi.stubGlobal('fetch', buildFetch({}))
    renderSlider()

    expect(await screen.findByText(/no hay proyectos/i)).toBeInTheDocument()
  })

  it('muestra los proyectos destacados de cada subcategoría', async () => {
    renderSlider()

    expect(await screen.findByRole('img', { name: 'Logo Empresa' })).toBeInTheDocument()
  })

  it('usa la primera imagen como fallback sin destacadas', async () => {
    renderSlider()

    expect(await screen.findByRole('img', { name: 'Caja' })).toBeInTheDocument()
  })

  it('rellena con proyectos no destacados hasta cinco por subcategoría', async () => {
    const many = [
      { id: 11, title: 'Destacada A', imageUrl: 'https://example.com/da.jpg', isFeatured: true },
      { id: 12, title: 'P2', imageUrl: 'https://example.com/p2.jpg', isFeatured: false },
      { id: 13, title: 'P3', imageUrl: 'https://example.com/p3.jpg', isFeatured: false },
      { id: 14, title: 'P4', imageUrl: 'https://example.com/p4.jpg', isFeatured: false },
      { id: 15, title: 'P5', imageUrl: 'https://example.com/p5.jpg', isFeatured: false },
      { id: 16, title: 'P6', imageUrl: 'https://example.com/p6.jpg', isFeatured: false },
      { id: 17, title: 'P7', imageUrl: 'https://example.com/p7.jpg', isFeatured: false },
    ]
    vi.stubGlobal(
      'fetch',
      buildFetch({
        'imagen-corporativa': many,
        'packaging-expositores': projectsBySubcategory['packaging-expositores'],
        carteleria: [],
        editorial: [],
      }),
    )
    renderSlider()

    expect(await screen.findByRole('img', { name: 'P5' })).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'P6' })).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'P7' })).not.toBeInTheDocument()
  })

  it('enlaza cada subcategoría a su galería', async () => {
    renderSlider()

    expect(await screen.findByRole('link', { name: 'Packaging y Expositores' })).toHaveAttribute('href', '/design/packaging-expositores')
  })

  it('precarga solo la primera imagen visible', async () => {
    renderSlider()

    const first = await screen.findByRole('img', { name: 'Logo Empresa' })
    expect(first).toHaveAttribute('loading', 'eager')
    expect(first).toHaveAttribute('fetchpriority', 'high')
    expect(screen.getByRole('img', { name: 'Caja' })).toHaveAttribute('loading', 'lazy')
  })

  it('muestra un skeleton de galería durante la carga', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    renderSlider()

    expect(screen.getByRole('status', { name: 'Cargando galería…' })).toBeInTheDocument()
  })
})
