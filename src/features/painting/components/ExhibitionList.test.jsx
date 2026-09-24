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
  { id: 1, title: 'Expo B', date: '2024-06-10', location: 'Madrid', position: 2, isPublished: true },
  { id: 2, title: 'Expo A', date: '2023-03-05', location: 'Valencia', description: 'Retrospectiva', position: 1, isPublished: true },
]

describe('ExhibitionList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: exhibitions })))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('lista las exposiciones ordenadas por position con title, date y location', async () => {
    render(<ExhibitionList />)

    const titles = (await screen.findAllByRole('heading')).map((h) => h.textContent)
    expect(titles).toEqual(['Expo A', 'Expo B'])
    expect(screen.getByText('Valencia')).toBeInTheDocument()
    expect(screen.getByText(/retrospectiva/i)).toBeInTheDocument()
  })

  it('muestra la fecha formateada en español', async () => {
    render(<ExhibitionList />)

    expect(await screen.findByText(/5 de marzo de 2023/)).toBeInTheDocument()
  })

  it('muestra un estado vacío sin exposiciones', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: [] })))
    render(<ExhibitionList />)

    expect(await screen.findByText(/no hay exposiciones/i)).toBeInTheDocument()
  })
})
