import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ForgotPasswordForm from './ForgotPasswordForm.jsx'

function jsonResponse(data, ok = true, status = 200) {
  return { ok, status, headers: { get: () => 'application/json' }, json: async () => data }
}

function renderForm() {
  return render(
    <MemoryRouter>
      <ForgotPasswordForm />
    </MemoryRouter>,
  )
}

describe('ForgotPasswordForm', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renderiza input de email accesible y botón', () => {
    renderForm()

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument()
  })

  it('deshabilita el botón con email inválido y lo habilita con email válido', async () => {
    renderForm()
    const submit = screen.getByRole('button', { name: /enviar enlace/i })
    expect(submit).toBeDisabled()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')

    expect(submit).toBeEnabled()
  })

  it('no envía la solicitud si se fuerza el submit con email inválido', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { container } = renderForm()

    fireEvent.submit(container.querySelector('form'))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('muestra mensaje genérico de éxito sin revelar si el email existe', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { message: 'ok' } }))
    vi.stubGlobal('fetch', fetchMock)
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(await screen.findByText(/si el email está registrado/i)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/forgot-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.com' }),
      }),
    )
  })

  it('muestra el mensaje del server en un error 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ error: 'Solicitud inválida', code: 'VALIDATION_ERROR' }, false, 400),
        ),
    )
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/solicitud inválida/i)
  })

  it('muestra mensaje de límite en 429 RATE_LIMITED', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ error: 'Demasiados intentos', code: 'RATE_LIMITED' }, false, 429),
        ),
    )
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/límite de intentos/i)
  })

  it('muestra error genérico si el server falla sin mensaje', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ code: 'INTERNAL_ERROR' }, false, 500)),
    )
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo procesar/i)
  })

  it('enlaza de vuelta al acceso admin', () => {
    renderForm()

    expect(screen.getByRole('link', { name: /volver al acceso/i })).toHaveAttribute(
      'href',
      '/admin/login',
    )
  })
})
