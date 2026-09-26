import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@sentry/react', () => ({
  captureReactException: vi.fn(),
  getFeedback: vi.fn(),
}))

import * as Sentry from '@sentry/react'
import SentryErrorBoundary from './SentryErrorBoundary.jsx'

let shouldThrow = true

const Bomb = () => {
  if (shouldThrow) throw new Error('boom con token eyJhbGci y password secreta')
  return <p>contenido ok</p>
}

describe('SentryErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true
    vi.clearAllMocks()
    Sentry.getFeedback.mockReturnValue(undefined)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renderiza los children cuando no hay error', () => {
    render(
      <SentryErrorBoundary>
        <p>todo bien</p>
      </SentryErrorBoundary>,
    )

    expect(screen.getByText('todo bien')).toBeInTheDocument()
  })

  it('muestra el fallback accesible y reporta a Sentry sin exponer el error', async () => {
    render(
      <SentryErrorBoundary>
        <Bomb />
      </SentryErrorBoundary>,
    )

    const region = await screen.findByRole('alert')
    expect(region).toHaveAccessibleName('Algo ha ido mal')
    expect(screen.getByRole('heading', { level: 1, name: 'Algo ha ido mal' })).toBeInTheDocument()
    expect(screen.queryByText(/eyJhbGci/)).not.toBeInTheDocument()
    expect(screen.queryByText(/secreta/)).not.toBeInTheDocument()
    expect(Sentry.captureReactException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'boom con token eyJhbGci y password secreta' }),
      expect.anything(),
    )
  })

  it('el botón Reintentar recibe el foco y restaura los children', async () => {
    const user = userEvent.setup()
    render(
      <SentryErrorBoundary>
        <Bomb />
      </SentryErrorBoundary>,
    )

    const retry = await screen.findByRole('button', { name: 'Reintentar' })
    expect(document.activeElement).toBe(retry)

    shouldThrow = false
    await user.click(retry)
    expect(await screen.findByText('contenido ok')).toBeInTheDocument()
  })

  it('no muestra el botón de feedback cuando la integración no está disponible', async () => {
    render(
      <SentryErrorBoundary>
        <Bomb />
      </SentryErrorBoundary>,
    )

    await screen.findByRole('alert')
    expect(screen.queryByRole('button', { name: 'Reportar problema' })).not.toBeInTheDocument()
  })

  it('abre el formulario de feedback cuando la integración está disponible', async () => {
    const user = userEvent.setup()
    const form = { appendToDom: vi.fn(), open: vi.fn() }
    const createForm = vi.fn(() => Promise.resolve(form))
    Sentry.getFeedback.mockReturnValue({ createForm })

    render(
      <SentryErrorBoundary>
        <Bomb />
      </SentryErrorBoundary>,
    )

    await user.click(await screen.findByRole('button', { name: 'Reportar problema' }))
    await waitFor(() => expect(form.open).toHaveBeenCalled())
    expect(createForm).toHaveBeenCalledWith({
      messagePlaceholder: 'Describe qué ha pasado (no incluyas contraseñas ni datos personales)',
    })
    expect(form.appendToDom).toHaveBeenCalled()
  })
})
