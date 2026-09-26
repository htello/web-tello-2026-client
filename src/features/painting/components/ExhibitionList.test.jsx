import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import ExhibitionList from './ExhibitionList.jsx'

function jsonResponse(data) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => data,
  }
}

const exhibitions = [
  { id: 1, title: 'Expo B', date: '2024-06-10', endDate: '2024-06-30', location: 'Madrid', position: 2, isPublished: true },
  { id: 2, title: 'Expo A', date: '2023-03-05', endDate: null, location: 'Valencia', description: 'Retrospectiva', position: 1, isPublished: true },
]

function mockExhibitions({ exhibitionsData = exhibitions } = {}) {
  return vi.fn(() => Promise.resolve(jsonResponse({ data: exhibitionsData })))
}

describe('ExhibitionList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockExhibitions())
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('lista las exposiciones ordenadas por position con title, date y location', async () => {
    render(<ExhibitionList />)

    const titles = (await screen.findAllByRole('heading')).map((h) => h.textContent)
    expect(titles).toEqual(['Exposiciones', 'Expo A', 'Expo B'])
    expect(screen.getByText('Valencia')).toBeInTheDocument()
    expect(screen.getByText(/retrospectiva/i)).toBeInTheDocument()
  })

  it('muestra la fecha formateada en español', async () => {
    render(<ExhibitionList />)

    expect(await screen.findByText(/5 de marzo de 2023/)).toBeInTheDocument()
  })

  it('muestra el rango "Del X al Y" cuando hay endDate', async () => {
    render(<ExhibitionList />)

    expect(
      await screen.findByText('Del 10 de junio de 2024 al 30 de junio de 2024'),
    ).toBeInTheDocument()
  })

  it('muestra un estado vacío sin exposiciones', async () => {
    vi.stubGlobal('fetch', mockExhibitions({ exhibitionsData: [] }))
    render(<ExhibitionList />)

    expect(await screen.findByText(/no hay exposiciones/i)).toBeInTheDocument()
  })

  it('muestra las imágenes de cada exposición en un carrusel con la primera prioritaria', async () => {
    vi.stubGlobal(
      'fetch',
      mockExhibitions({
        exhibitionsData: [
          {
            id: 1,
            title: 'Expo A',
            date: '2023-03-05',
            endDate: null,
            location: 'Valencia',
            position: 1,
            isPublished: true,
            images: [
              { id: 11, url: 'https://example.com/g1.jpg', thumbnail: 'https://example.com/t1.jpg', position: 1 },
              { id: 12, url: 'https://example.com/g2.jpg', thumbnail: null, position: 2 },
            ],
          },
        ],
      }),
    )
    render(<ExhibitionList />)

    const images = await screen.findAllByRole('img', { name: 'Expo A' })
    expect(images).toHaveLength(2)
    const [first, second] = images
    expect(first).toHaveAttribute('src', 'https://example.com/t1.jpg')
    expect(first).toHaveAttribute('loading', 'eager')
    expect(first).toHaveAttribute('fetchpriority', 'high')

    expect(second).toHaveAttribute('src', 'https://example.com/g2.jpg')
    expect(second).toHaveAttribute('loading', 'lazy')
  })

  it('omite el carrusel cuando la exposición no tiene imágenes', async () => {
    render(<ExhibitionList />)

    expect(await screen.findByRole('heading', { name: 'Expo A' })).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
