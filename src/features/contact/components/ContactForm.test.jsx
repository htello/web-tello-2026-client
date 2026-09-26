import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from './ContactForm.jsx'

function jsonResponse(data, ok = true, status = 200) {
  return { ok, status, headers: { get: () => 'application/json' }, json: async () => data }
}

async function fillForm(user) {
  await user.type(screen.getByLabelText(/nombre/i), 'Ana')
  await user.type(screen.getByLabelText(/email/i), 'ana@example.com')
  await user.type(screen.getByLabelText(/asunto/i), 'Hola')
  await user.type(screen.getByLabelText(/mensaje/i), 'Quiero comprar una obra')
}

describe('ContactForm', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('valida los campos requeridos', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.click(screen.getByRole('button', { name: /enviar/i }))

    expect(await screen.findByText(/nombre es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/email es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/asunto es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/mensaje es obligatorio/i)).toBeInTheDocument()
  })

  it('valida el formato del email', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/email/i), 'no-es-email')
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    expect(await screen.findByText(/email no válido/i)).toBeInTheDocument()
  })

  it('envía el formulario y limpia los campos al tener éxito', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { ok: true } }))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<ContactForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    expect(await screen.findByText(/mensaje enviado/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('muestra error en 429 RATE_LIMITED', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Demasiados intentos', code: 'RATE_LIMITED' }, false, 429)))
    const user = userEvent.setup()
    render(<ContactForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    expect(await screen.findByText(/no se pudo enviar/i)).toBeInTheDocument()
    expect(screen.queryByText(/mensaje enviado/i)).not.toBeInTheDocument()
  })

  it('muestra error en 502 EMAIL_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Error de email', code: 'EMAIL_ERROR' }, false, 502)))
    const user = userEvent.setup()
    render(<ContactForm />)

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: /enviar/i }))

    expect(await screen.findByText(/no se pudo enviar/i)).toBeInTheDocument()
    expect(screen.queryByText(/mensaje enviado/i)).not.toBeInTheDocument()
  })
})
