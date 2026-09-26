import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import MasonryGrid from './MasonryGrid.jsx'

describe('MasonryGrid', () => {
  afterEach(() => {
    cleanup()
  })

  it('renderiza los elementos dentro de un grupo con etiqueta accesible', () => {
    render(
      <MasonryGrid label="Galería de prueba">
        <div>Uno</div>
        <div>Dos</div>
        <div>Tres</div>
      </MasonryGrid>,
    )

    const group = screen.getByRole('group', { name: 'Galería de prueba' })
    expect(group).toBeInTheDocument()
    expect(group).toHaveClass('masonry-grid')
    expect(screen.getByText('Uno')).toBeInTheDocument()
    expect(screen.getByText('Dos')).toBeInTheDocument()
    expect(screen.getByText('Tres')).toBeInTheDocument()
  })

  it('renderiza un único elemento sin controles adicionales', () => {
    render(
      <MasonryGrid label="Galería de prueba">
        <div>Único</div>
      </MasonryGrid>,
    )

    expect(screen.getByText('Único')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
