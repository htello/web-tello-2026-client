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

  it('muestra las cuatro subcategorías con sus labels', async () => {
    renderSlider()

    expect(await screen.findByText('Imagen corporativa')).toBeInTheDocument()
    expect(screen.getByText('Packaging y Expositores')).toBeInTheDocument()
    expect(screen.getByText('Cartelería')).toBeInTheDocument()
    expect(screen.getByText('Editorial')).toBeInTheDocument()
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
})
