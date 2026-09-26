import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Carousel from './Carousel.jsx'

describe('Carousel', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollTo = vi.fn()
  })

  afterEach(() => {
    cleanup()
    delete HTMLElement.prototype.scrollTo
  })

  function renderCarousel() {
    return render(
      <Carousel label="Galería de prueba">
        <div>Uno</div>
        <div>Dos</div>
        <div>Tres</div>
      </Carousel>,
    )
  }

  it('renderiza los elementos dentro del carrusel con etiqueta accesible', () => {
    renderCarousel()

    const group = screen.getByRole('group', { name: 'Galería de prueba' })
    expect(group).toBeInTheDocument()
    expect(screen.getByText('Uno')).toBeInTheDocument()
    expect(screen.getByText('Tres')).toBeInTheDocument()
  })

  it('renderiza flechas anterior y siguiente', () => {
    renderCarousel()

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
  })

  it('muestra un dot por imagen y marca el primero como activo', () => {
    renderCarousel()

    expect(screen.getByRole('button', { name: 'Ver imagen 1 de 3' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Ver imagen 2 de 3' })).not.toHaveAttribute(
      'aria-current',
    )
    expect(screen.getByRole('button', { name: 'Ver imagen 3 de 3' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('mueve el estado activo al pulsar un dot', async () => {
    const user = userEvent.setup()
    renderCarousel()

    await user.click(screen.getByRole('button', { name: 'Ver imagen 2 de 3' }))

    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Ver imagen 2 de 3' })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Ver imagen 1 de 3' })).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('la flecha siguiente avanza y la anterior no baja de la primera imagen', async () => {
    const user = userEvent.setup()
    renderCarousel()

    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(screen.getByRole('button', { name: 'Ver imagen 1 de 3' })).toHaveAttribute(
      'aria-current',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByRole('button', { name: 'Ver imagen 2 de 3' })).toHaveAttribute(
      'aria-current',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByRole('button', { name: 'Ver imagen 3 de 3' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('sin flechas ni dots cuando hay un solo elemento', () => {
    render(
      <Carousel label="Galería de prueba">
        <div>Único</div>
      </Carousel>,
    )

    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ver imagen/ })).not.toBeInTheDocument()
    expect(screen.getByText('Único')).toBeInTheDocument()
  })
})
