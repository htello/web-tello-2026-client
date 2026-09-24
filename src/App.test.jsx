import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.jsx'

describe('App', () => {
  it('muestra la navegación principal con las cinco disciplinas', () => {
    render(<App />)

    expect(
      screen.getByRole('navigation', { name: 'Navegación principal' }),
    ).toBeInTheDocument()

    for (const name of ['Pintura', 'Ilustración', 'Diseño', 'Biografía', 'Contacto']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
  })
})
