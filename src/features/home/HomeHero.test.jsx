import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomeHero from './HomeHero.jsx'

describe('HomeHero', () => {
  const backgroundImage = 'https://example.com/portada.jpg'

  it('muestra una única sección hero con la imagen en HTML', () => {
    const { container } = render(<HomeHero backgroundImage={backgroundImage} />)

    const heroes = container.querySelectorAll('.home-hero')
    expect(heroes).toHaveLength(1)
    const image = container.querySelector('.home-hero__image')
    expect(image.tagName).toBe('IMG')
    expect(image).toHaveAttribute('src', backgroundImage)
  })

  it('no muestra ningún encabezado', () => {
    render(<HomeHero backgroundImage={backgroundImage} />)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})
