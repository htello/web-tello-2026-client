import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaintingCard from './PaintingCard.jsx'

describe('PaintingCard', () => {
  const basePainting = {
    id: 1,
    title: 'Atardecer',
    imageUrl: 'https://example.com/atardecer.jpg',
    dimensions: '80 x 100 cm',
    technique: 'Óleo sobre lienzo',
    year: 2020,
  }

  it('muestra la imagen con alt descriptivo y el título', () => {
    render(<PaintingCard painting={basePainting} onOpen={() => {}} />)

    const img = screen.getByRole('img', { name: 'Atardecer' })
    expect(img).toHaveAttribute('src', 'https://example.com/atardecer.jpg')
    expect(screen.getByText('Atardecer')).toBeInTheDocument()
  })

  it('muestra solo los datos técnicos que existen', () => {
    render(
      <PaintingCard
        painting={{
          id: 2,
          title: 'Sin datos',
          imageUrl: 'https://example.com/x.jpg',
          dimensions: '50 x 50 cm',
        }}
        onOpen={() => {}}
      />,
    )

    expect(screen.getByText('50 x 50 cm')).toBeInTheDocument()
    expect(screen.queryByText(/técnica/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/año/i)).not.toBeInTheDocument()
  })

  it('llama a onOpen al hacer click', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(<PaintingCard painting={basePainting} onOpen={onOpen} />)

    await user.click(screen.getByRole('button', { name: 'Atardecer' }))

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith(1)
  })
})
