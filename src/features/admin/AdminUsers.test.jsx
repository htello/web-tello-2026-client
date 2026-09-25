import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminUsers from './AdminUsers.jsx'
import { adminApi } from '@/services/adminApi.js'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { setAuthToken } from '@/services/api.js'

vi.mock('@/services/adminApi.js', () => ({
  adminApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    registerUser: vi.fn(),
    updateUserPassword: vi.fn(),
  },
}))

const CURRENT_ADMIN = { id: 1, email: 'admin@test.com', name: 'Antonio', role: 'ADMIN' }

const USERS = [
  { id: 1, email: 'admin@test.com', name: 'Antonio', role: 'ADMIN', createdAt: '2026-01-01T10:00:00.000Z' },
  { id: 2, email: 'lucia@test.com', name: 'Lucía', role: 'USER', createdAt: '2026-01-02T10:00:00.000Z' },
]

const META = { total: 2, page: 1, limit: 20, pages: 1 }

const NUEVA_CLAVE = 'Nueva-Clave!23'

const apiError = (message, status, code) =>
  Object.assign(new Error(message), { status, code })

function renderView() {
  sessionStorage.setItem(
    'admin_session',
    JSON.stringify({ token: 'token-secreto', user: CURRENT_ADMIN }),
  )
  return render(
    <MemoryRouter>
      <AuthProvider>
        <AdminUsers />
      </AuthProvider>
    </MemoryRouter>,
  )
}

const pagination = () => screen.getByRole('navigation', { name: 'Paginación de usuarios' })

async function openRegister(user) {
  await screen.findByRole('cell', { name: 'admin@test.com' })
  await user.click(screen.getByRole('button', { name: 'Nuevo administrador' }))
  await user.type(screen.getByLabelText('Email'), 'marta@test.com')
}

describe('AdminUsers', () => {
  beforeEach(() => {
    adminApi.list.mockResolvedValue({ data: USERS, meta: META })
    adminApi.update.mockResolvedValue({ data: { id: 2 } })
    adminApi.remove.mockResolvedValue(null)
    adminApi.registerUser.mockResolvedValue({ data: { id: 3 } })
    adminApi.updateUserPassword.mockResolvedValue({ data: { message: 'Contraseña actualizada' } })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    sessionStorage.clear()
    setAuthToken(null)
  })

  it('lista los usuarios paginados con email, nombre y rol', async () => {
    renderView()

    expect(await screen.findByRole('cell', { name: 'admin@test.com' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'lucia@test.com' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Lucía' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'ADMIN' })).toBeInTheDocument()
    expect(adminApi.list).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({ params: { page: 1, limit: 20 } }),
    )
  })

  it('muestra el paginador accesible con la página actual y el total', async () => {
    renderView()
    await screen.findByRole('cell', { name: 'admin@test.com' })

    expect(pagination()).toHaveTextContent('Página 1 de 1 · 2 usuarios')
    expect(within(pagination()).getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    expect(within(pagination()).getByRole('button', { name: 'Página siguiente' })).toBeDisabled()
  })

  it('avanza a la página siguiente y pide page=2', async () => {
    adminApi.list.mockImplementation((_resource, { params }) =>
      Promise.resolve(
        params.page === 2
          ? {
              data: [{ id: 21, email: 'veinteuno@test.com', name: 'Veintiuno', role: 'USER' }],
              meta: { total: 21, page: 2, limit: 20, pages: 2 },
            }
          : { data: USERS, meta: { total: 21, page: 1, limit: 20, pages: 2 } },
      ),
    )
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'admin@test.com' })

    await user.click(within(pagination()).getByRole('button', { name: 'Página siguiente' }))

    expect(await screen.findByRole('cell', { name: 'veinteuno@test.com' })).toBeInTheDocument()
    expect(pagination()).toHaveTextContent('Página 2 de 2 · 21 usuarios')
    expect(within(pagination()).getByRole('button', { name: 'Página siguiente' })).toBeDisabled()
    expect(adminApi.list).toHaveBeenLastCalledWith(
      'users',
      expect.objectContaining({ params: { page: 2, limit: 20 } }),
    )
  })

  it('vuelve a la página anterior', async () => {
    adminApi.list.mockImplementation((_resource, { params }) =>
      Promise.resolve(
        params.page === 2
          ? {
              data: [{ id: 21, email: 'veinteuno@test.com', name: 'Veintiuno', role: 'USER' }],
              meta: { total: 21, page: 2, limit: 20, pages: 2 },
            }
          : { data: USERS, meta: { total: 21, page: 1, limit: 20, pages: 2 } },
      ),
    )
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'admin@test.com' })

    await user.click(within(pagination()).getByRole('button', { name: 'Página siguiente' }))
    await screen.findByRole('cell', { name: 'veinteuno@test.com' })
    await user.click(within(pagination()).getByRole('button', { name: 'Página anterior' }))

    expect(await screen.findByRole('cell', { name: 'lucia@test.com' })).toBeInTheDocument()
    expect(adminApi.list).toHaveBeenLastCalledWith(
      'users',
      expect.objectContaining({ params: { page: 1, limit: 20 } }),
    )
  })

  it('muestra el estado de carga', () => {
    adminApi.list.mockReturnValue(new Promise(() => {}))
    renderView()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('registra un administrador con POST /admin/users/register', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'admin@test.com' })

    await user.click(screen.getByRole('button', { name: 'Nuevo administrador' }))

    expect(screen.getByRole('heading', { name: 'Crear administrador' })).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
    expect(screen.getByText(/mínimo 8 caracteres, una mayúscula y un símbolo/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nombre'), 'Marta')
    await user.type(screen.getByLabelText('Email'), 'marta@test.com')
    await user.type(screen.getByLabelText('Contraseña'), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    await waitFor(() =>
      expect(adminApi.registerUser).toHaveBeenCalledWith({
        name: 'Marta',
        email: 'marta@test.com',
        password: NUEVA_CLAVE,
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Crear administrador' })).not.toBeInTheDocument(),
    )
  })

  it('registra sin nombre omitiendo el campo vacío', async () => {
    const user = userEvent.setup()
    renderView()
    await openRegister(user)

    await user.type(screen.getByLabelText('Contraseña'), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    await waitFor(() =>
      expect(adminApi.registerUser).toHaveBeenCalledWith({
        email: 'marta@test.com',
        password: NUEVA_CLAVE,
      }),
    )
  })

  it.each([
    ['corta', 'Ab!1', /al menos 8 caracteres/],
    ['sin mayúscula', 'nueva-clave!23', /debe incluir una mayúscula/],
    ['sin símbolo', 'NuevaClave1234', /debe incluir un símbolo/],
  ])('bloquea el registro con contraseña %s sin llamar a la red', async (_label, weak, message) => {
    const user = userEvent.setup()
    renderView()
    await openRegister(user)

    await user.type(screen.getByLabelText('Contraseña'), weak)
    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true')
    expect(adminApi.registerUser).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'Crear administrador' })).toBeInTheDocument()
  })

  it('bloquea el registro con email inválido', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'admin@test.com' })

    await user.click(screen.getByRole('button', { name: 'Nuevo administrador' }))
    await user.type(screen.getByLabelText('Email'), 'no-es-email')
    await user.type(screen.getByLabelText('Contraseña'), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    expect(await screen.findByText('Email no válido')).toBeInTheDocument()
    expect(adminApi.registerUser).not.toHaveBeenCalled()
  })

  it('muestra el 400 DUPLICATE_ERROR del server al registrar y mantiene el formulario', async () => {
    adminApi.registerUser.mockRejectedValue(
      apiError('El email ya está registrado', 400, 'DUPLICATE_ERROR'),
    )
    const user = userEvent.setup()
    renderView()
    await openRegister(user)

    await user.type(screen.getByLabelText('Contraseña'), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('El email ya está registrado')
    expect(alert).toHaveTextContent('DUPLICATE_ERROR')
    expect(screen.getByRole('heading', { name: 'Crear administrador' })).toBeInTheDocument()
  })

  it('muestra el 429 RATE_LIMITED del server al registrar', async () => {
    adminApi.registerUser.mockRejectedValue(
      apiError('Demasiados intentos, inténtalo más tarde', 429, 'RATE_LIMITED'),
    )
    const user = userEvent.setup()
    renderView()
    await openRegister(user)

    await user.type(screen.getByLabelText('Contraseña'), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: 'Registrar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('RATE_LIMITED')
  })

  it('edita con valores precargados y envía un PUT parcial solo con lo cambiado', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Editar lucia@test.com' }))

    expect(screen.getByRole('heading', { name: 'Editar usuario' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Lucía')
    expect(screen.getByLabelText('Email')).toHaveValue('lucia@test.com')
    expect(screen.getByLabelText('Rol')).toHaveValue('USER')

    await user.clear(screen.getByLabelText('Nombre'))
    await user.type(screen.getByLabelText('Nombre'), 'Lucía Gómez')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('users', 2, { name: 'Lucía Gómez' }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Editar usuario' })).not.toBeInTheDocument(),
    )
  })

  it('cambia el rol enviando solo role', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Editar lucia@test.com' }))
    await user.selectOptions(screen.getByLabelText('Rol'), 'ADMIN')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(adminApi.update).toHaveBeenCalledWith('users', 2, { role: 'ADMIN' }))
  })

  it('cierra la edición sin llamar a update si no hay cambios', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Editar lucia@test.com' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Editar usuario' })).not.toBeInTheDocument(),
    )
    expect(adminApi.update).not.toHaveBeenCalled()
  })

  it('muestra el 404 del server al editar', async () => {
    adminApi.update.mockRejectedValue(apiError('Usuario no encontrado', 404, 'NOT_FOUND'))
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Editar lucia@test.com' }))
    await user.clear(screen.getByLabelText('Nombre'))
    await user.type(screen.getByLabelText('Nombre'), 'Otro')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Usuario no encontrado')
    expect(alert).toHaveTextContent('NOT_FOUND')
  })

  it('borra tras confirmar en el ConfirmDialog', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Borrar lucia@test.com' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('¿Borrar el usuario «lucia@test.com»?')
    expect(dialog).toHaveTextContent('Esta acción no se puede deshacer.')

    await user.click(within(dialog).getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(adminApi.remove).toHaveBeenCalledWith('users', 2))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('cancela el borrado sin llamar a remove', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Borrar lucia@test.com' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))

    expect(adminApi.remove).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('avisa de forma explícita al borrar la cuenta propia', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'admin@test.com' })

    await user.click(screen.getByRole('button', { name: 'Borrar admin@test.com' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Vas a borrar tu propia cuenta')
    expect(dialog).toHaveTextContent('perderás el acceso al panel')

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(adminApi.remove).not.toHaveBeenCalled()
  })

  it('muestra el error del server al borrar', async () => {
    adminApi.remove.mockRejectedValue(apiError('No se puede borrar', 400, 'VALIDATION_ERROR'))
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Borrar lucia@test.com' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Borrar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No se puede borrar')
  })

  it('cambia la contraseña con PUT /admin/users/:id/password', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña de lucia@test.com' }))

    expect(screen.getByRole('heading', { name: 'Cambiar contraseña' })).toBeInTheDocument()
    expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('type', 'password')

    await user.type(screen.getByLabelText('Nueva contraseña'), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.updateUserPassword).toHaveBeenCalledWith(2, { password: NUEVA_CLAVE }),
    )
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Cambiar contraseña' }),
      ).not.toBeInTheDocument(),
    )
  })

  it('bloquea el cambio de contraseña débil sin llamar a la red', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña de lucia@test.com' }))
    await user.type(screen.getByLabelText('Nueva contraseña'), 'corta')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText(/al menos 8 caracteres/)).toBeInTheDocument()
    expect(adminApi.updateUserPassword).not.toHaveBeenCalled()
  })

  it('muestra el 404 del server al cambiar la contraseña', async () => {
    adminApi.updateUserPassword.mockRejectedValue(
      apiError('Usuario no encontrado', 404, 'NOT_FOUND'),
    )
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'lucia@test.com' })

    await user.click(screen.getByRole('button', { name: 'Cambiar contraseña de lucia@test.com' }))
    await user.type(screen.getByLabelText('Nueva contraseña'), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Usuario no encontrado')
    expect(alert).toHaveTextContent('NOT_FOUND')
    expect(screen.getByRole('heading', { name: 'Cambiar contraseña' })).toBeInTheDocument()
  })

  it('muestra el error 403 al cargar el listado', async () => {
    adminApi.list.mockRejectedValue(apiError('Sin permisos', 403, 'FORBIDDEN'))
    renderView()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Sin permisos')
  })

  it('no expone la contraseña ni el token como texto, en el listado o en consola', async () => {
    const logs = vi.spyOn(console, 'log').mockImplementation(() => {})
    const infos = vi.spyOn(console, 'info').mockImplementation(() => {})
    const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'admin@test.com' })

    await user.click(screen.getByRole('button', { name: 'Nuevo administrador' }))
    await user.type(screen.getByLabelText('Contraseña'), NUEVA_CLAVE)

    const passwordInput = screen.getByLabelText('Contraseña')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password')

    await user.type(screen.getByLabelText('Email'), 'marta@test.com')
    await user.click(screen.getByRole('button', { name: 'Registrar' }))
    await waitFor(() => expect(adminApi.registerUser).toHaveBeenCalled())

    expect(document.body.textContent).not.toContain(NUEVA_CLAVE)
    expect(document.body.textContent).not.toContain('token-secreto')
    expect(screen.getByRole('table').innerHTML).not.toContain(NUEVA_CLAVE)
    for (const spy of [logs, infos, warnings, errors]) {
      expect(spy.mock.calls.flat().join(' ')).not.toContain(NUEVA_CLAVE)
      expect(spy.mock.calls.flat().join(' ')).not.toContain('token-secreto')
    }

    logs.mockRestore()
    infos.mockRestore()
    warnings.mockRestore()
    errors.mockRestore()
  })

  it('olvida la contraseña del DOM al cerrar el formulario', async () => {
    const user = userEvent.setup()
    const { container } = renderView()
    await screen.findByRole('cell', { name: 'admin@test.com' })

    await user.click(screen.getByRole('button', { name: 'Nuevo administrador' }))
    await user.type(screen.getByLabelText('Contraseña'), NUEVA_CLAVE)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Crear administrador' })).not.toBeInTheDocument(),
    )
    expect(container.innerHTML).not.toContain(NUEVA_CLAVE)
    expect(container.innerHTML).not.toContain('token-secreto')
  })
})
