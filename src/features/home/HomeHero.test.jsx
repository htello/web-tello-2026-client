import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomeHero from './HomeHero.jsx'

const ROUTES = {
  Pintura: '/painting',
  Ilustración: '/illustration',
  Diseño: '/design',
  Biografía: '/biography',
  Contacto: '/contact',
}

describe('HomeHero', () => {
  const backgroundImage = 'https://example.com/portada.jpg'

  it('muestra una única sección hero con la imagen de fondo', () => {
    const { container } = render(<HomeHero backgroundImage={backgroundImage} />)

    const heroes = container.querySelectorAll('.home-hero')
    expect(heroes).toHaveLength(1)
    expect(heroes[0].style.backgroundImage).toContain(backgroundImage)
  })

  it('mantiene el menú visible superpuesto sobre el fondo', () => {
    render(<HomeHero backgroundImage={backgroundImage} />)

    expect(
      screen.getByRole('navigation', { name: 'Navegación principal' }),
    ).toBeInTheDocument()
  })

  it('expone enlaces accesibles a cada disciplina', () => {
    render(<HomeHero backgroundImage={backgroundImage} />)

    for (const [name, href] of Object.entries(ROUTES)) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })
})
