import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ExhibitionLink from './ExhibitionLink.jsx'

describe('ExhibitionLink', () => {
  it('enlaza a la página de exposiciones como botón "Ver exposiciones"', () => {
    render(
      <MemoryRouter>
        <ExhibitionLink />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: /ver exposiciones/i })
    expect(link).toHaveAttribute('href', '/pintura/exposiciones')
  })
})
