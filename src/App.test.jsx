import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import App from './App.jsx'

describe('portfolio navigation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('API unavailable')))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows persistent public navigation and the three portfolio destinations', async () => {
    render(<App />)

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Pintura' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Diseño' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ilustración' })).toBeTruthy()
    expect(await screen.findByText(/obras destacadas/i)).toBeTruthy()
  })
})
