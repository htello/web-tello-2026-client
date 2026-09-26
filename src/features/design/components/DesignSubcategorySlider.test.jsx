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
