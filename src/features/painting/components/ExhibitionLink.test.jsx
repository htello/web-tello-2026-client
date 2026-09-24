import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExhibitionLink from './ExhibitionLink.jsx'

describe('ExhibitionLink', () => {
  it('enlaza a la página de exposiciones', () => {
    render(<ExhibitionLink />)

    const link = screen.getByRole('link', { name: /exhibiciones/i })
    expect(link).toHaveAttribute('href', '/painting/exhibitions')
  })
})
