import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedArtworkImage from './ProtectedArtworkImage.jsx'

describe('ProtectedArtworkImage', () => {
  it('renderiza la imagen con alt y draggable false', () => {
    render(<ProtectedArtworkImage src="https://example.com/obra.jpg" alt="Obra" />)

    const img = screen.getByRole('img', { name: 'Obra' })
    expect(img).toHaveAttribute('src', 'https://example.com/obra.jpg')
    expect(img).toHaveAttribute('draggable', 'false')
  })

  it('incluye un overlay transparente', () => {
    const { container } = render(
      <ProtectedArtworkImage src="https://example.com/obra.jpg" alt="Obra" />,
    )

    expect(container.querySelector('.protected-artwork__overlay')).toBeTruthy()
  })
})
