import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomeHero from './HomeHero.jsx'

describe('HomeHero', () => {
  const backgroundImage = 'https://example.com/portada.jpg'

  it('muestra una única sección hero con la imagen de fondo', () => {
    const { container } = render(<HomeHero backgroundImage={backgroundImage} />)

    const heroes = container.querySelectorAll('.home-hero')
    expect(heroes).toHaveLength(1)
    expect(heroes[0].style.backgroundImage).toContain(backgroundImage)
  })

  it('muestra la identidad del artista', () => {
    render(<HomeHero backgroundImage={backgroundImage} />)

    expect(screen.getByRole('heading', { name: 'Antonio Tello' })).toBeInTheDocument()
  })
})
