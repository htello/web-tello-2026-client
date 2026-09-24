import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ResetPasswordForm from './ResetPasswordForm.jsx'

const NUEVA_CLAVE = 'Nueva$1234'

function jsonResponse(data, ok = true, status = 200) {
  return { ok, status, headers: { get: () => 'application/json' }, json: async () => data }
}

function renderForm({ entry = '/reset-password?token=abc123' } = {}) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <ResetPasswordForm />
    </MemoryRouter>,
  )
}

describe('ResetPasswordForm', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('renderiza input de contraseña accesible con pista de requisitos', () => {
    renderForm()

    expect(screen.getByLabelText(/nueva contraseña/i)).toHaveAttribute('type', 'password')
    expect(screen.getByText(/mínimo 8 caracteres, una mayúscula y un símbolo/i)).toBeInTheDocument()
  })

  it('sin token muestra alerta y deshabilita el botón', () => {
    renderForm({ entry: '/reset-password' })

    expect(screen.getByRole('alert')).toHaveTextContent(/no incluye un token/i)
    expect(screen.getByRole('button', { name: /restablecer/i })).toBeDisabled()
  })

  it('sin token y submit forzado muestra error de enlace inválido', () => {
    const { container } = renderForm({ entry: '/reset-password' })

    fireEvent.submit(container.querySelector('form'))

    expect(screen.getByText(/enlace de recuperación no es válido/i)).toBeInTheDocument()
  })

  it('deshabilita el botón con contraseña débil y lo habilita con contraseña fuerte', async () => {
    renderForm()
    const submit = screen.getByRole('button', { name: /restablecer/i })
    expect(submit).toBeDisabled()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/nueva contraseña/i), NUEVA_CLAVE)

    expect(submit).toBeEnabled()
  })

  it('muestra error de validación con submit forzado y contraseña débil', async () => {
    const { container } = renderForm()
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/nueva contraseña/i), 'nueva1234')

    fireEvent.submit(container.querySelector('form'))

    expect(await screen.findByText(/debe incluir una mayúscula/i)).toBeInTheDocument()
  })

  it('restablece la contraseña y muestra éxito', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { message: 'ok' } }))
    vi.stubGlobal('fetch', fetchMock)
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/nueva contraseña/i), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: /restablecer/i }))

    expect(await screen.findByText(/contraseña actualizada/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ir al acceso/i })).toHaveAttribute(
      'href',
      '/admin/login',
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/reset-password',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'abc123', password: NUEVA_CLAVE }),
      }),
    )
  })

  it('muestra el mensaje del server en 400 (token inválido o expirado)', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { error: 'Token inválido o expirado', code: 'VALIDATION_ERROR' },
            false,
            400,
          ),
        ),
    )
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/nueva contraseña/i), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: /restablecer/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/token inválido o expirado/i)
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

    await user.type(screen.getByLabelText(/nueva contraseña/i), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: /restablecer/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/límite de intentos/i)
  })

  it('muestra error genérico si el server falla sin mensaje', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ code: 'INTERNAL_ERROR' }, false, 500)),
    )
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/nueva contraseña/i), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: /restablecer/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo restablecer/i)
  })

  it('no expone el token en el DOM', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { message: 'ok' } })))
    renderForm()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/nueva contraseña/i), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: /restablecer/i }))

    expect(await screen.findByText(/contraseña actualizada/i)).toBeInTheDocument()
    expect(document.body.innerHTML).not.toContain('abc123')
  })
})
