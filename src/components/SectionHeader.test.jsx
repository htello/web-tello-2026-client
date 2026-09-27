import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import SectionHeader from './SectionHeader.jsx'

describe('SectionHeader', () => {
  afterEach(cleanup)

  it('renderiza el título como único h1 del encabezado', () => {
    const { container } = render(<SectionHeader title="Diseño" />)

    expect(container.querySelector('header.section-header')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Diseño' })).toBeInTheDocument()
  })

  it('renderiza la acción opcional junto al título', () => {
    render(
      <SectionHeader
        title="Pintura"
        action={<a href="/pintura/exposiciones">Ver exposiciones</a>}
      />,
    )

    const action = screen.getByRole('link', { name: 'Ver exposiciones' })
    expect(action.closest('header.section-header')).not.toBeNull()
  })

  it('omite la acción cuando no se indica', () => {
    const { container } = render(<SectionHeader title="Exposiciones" />)

    expect(container.querySelectorAll('.section-header > *')).toHaveLength(1)
  })
})
