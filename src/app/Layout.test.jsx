import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Layout from './Layout.jsx'
import { ARTIST_NAME, NAV_SECTIONS } from '@/constants/businessRules.js'

function renderLayout() {
  return render(
    <MemoryRouter>
      <Layout />
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  afterEach(cleanup)

  it('renderiza la navegación principal con la marca y las secciones', () => {
    renderLayout()

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: ARTIST_NAME })).toBeInTheDocument()
    for (const { label } of NAV_SECTIONS) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('colapsa y expande el menú móvil con aria-expanded', async () => {
    const user = userEvent.setup()
    renderLayout()

    const toggle = screen.getByRole('button', { name: 'Menú de navegación' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'main-nav')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('cierra el menú móvil al navegar a una sección', async () => {
    const user = userEvent.setup()
    renderLayout()

    const toggle = screen.getByRole('button', { name: 'Menú de navegación' })
    await user.click(toggle)
    await user.click(screen.getByRole('link', { name: 'Pintura' }))

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('renderiza el footer con el copyright', () => {
    renderLayout()

    expect(screen.getByRole('contentinfo')).toHaveTextContent(`© ${ARTIST_NAME}`)
  })
})
