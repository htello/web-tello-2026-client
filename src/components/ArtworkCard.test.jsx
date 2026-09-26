import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ArtworkCard from './ArtworkCard.jsx'

describe('ArtworkCard', () => {
  afterEach(cleanup)

  const props = {
    src: 'https://example.com/obra.jpg',
    alt: 'Obra',
    title: 'Atardecer',
    onOpen: () => {},
  }

  it('renderiza figure con imagen, botón de apertura y título en figcaption', () => {
    const { container } = render(<ArtworkCard {...props} />)

    const figure = container.querySelector('figure.artwork-card')
    expect(figure).toBeInTheDocument()
    expect(figure.querySelector('figcaption')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Obra' })).toHaveAttribute('src', props.src)
    expect(screen.getByRole('heading', { level: 2, name: 'Atardecer' })).toBeInTheDocument()
  })

  it('respeta el nivel de encabezado indicado', () => {
    render(<ArtworkCard {...props} headingLevel={3} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Atardecer' })).toBeInTheDocument()
  })

  it('muestra la descripción si existe', () => {
    render(<ArtworkCard {...props} description="Óleo sobre lienzo grande" />)

    expect(screen.getByText('Óleo sobre lienzo grande')).toBeInTheDocument()
  })

  it('muestra los datos técnicos como lista de definición', () => {
    const { container } = render(
      <ArtworkCard {...props} details={[{ label: 'Año', value: '2020' }]} />,
    )

    const dl = container.querySelector('.artwork-card__details')
    expect(dl).toBeInTheDocument()
    expect(screen.getByText('Año')).toBeInTheDocument()
    expect(screen.getByText('2020')).toBeInTheDocument()
  })

  it('llama a onOpen al hacer click en la imagen', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<ArtworkCard {...props} onOpen={onOpen} />)

    await user.click(screen.getByRole('button', { name: 'Obra' }))

    expect(onOpen).toHaveBeenCalledTimes(1)
  })
})
