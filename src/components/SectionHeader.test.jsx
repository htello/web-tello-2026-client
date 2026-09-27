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
        action={<a href="/painting/exhibitions">Ver exposiciones</a>}
      />,
    )

    const action = screen.getByRole('link', { name: 'Ver exposiciones' })
    expect(action.closest('header.section-header')).not.toBeNull()
  })

  it('omite la acción cuando no se indica', () => {
    const { container } = render(<SectionHeader title="Exposiciones" />)

    expect(container.querySelectorAll('.section-header > *')).toHaveLength(1)
  })

  it('renderiza la descripción debajo del título', () => {
    const { container } = render(
      <SectionHeader title="Cosmos" description="Serie de pinturas abstractas." />,
    )

    const description = container.querySelector('p.section-header__description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveTextContent('Serie de pinturas abstractas.')
    expect(description.compareDocumentPosition(container.querySelector('h1'))).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    )
  })

  it('omite la descripción cuando no se indica', () => {
    const { container } = render(<SectionHeader title="Diseño" />)

    expect(container.querySelector('p.section-header__description')).not.toBeInTheDocument()
  })
})
