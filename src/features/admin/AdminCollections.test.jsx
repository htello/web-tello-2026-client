import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminCollections from './AdminCollections.jsx'
import { adminApi } from '@/services/adminApi.js'

vi.mock('@/services/adminApi.js', () => ({
  adminApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
  },
}))

const COLLECTIONS = [
  { id: 1, title: 'Óleos', description: 'Descripción óleos', coverImage: null, position: 0, isPublished: true },
  { id: 2, title: 'Bocetos', description: '', coverImage: null, position: 1, isPublished: false },
]

const dataRows = () => screen.getAllByRole('row').slice(1)

function renderView() {
  return render(
    <MemoryRouter>
      <AdminCollections />
    </MemoryRouter>,
  )
}

describe('AdminCollections', () => {
  beforeEach(() => {
    adminApi.list.mockResolvedValue({ data: COLLECTIONS })
    adminApi.create.mockResolvedValue({ data: { id: 3 } })
    adminApi.update.mockResolvedValue({ data: { id: 1 } })
    adminApi.remove.mockResolvedValue(null)
    adminApi.reorder.mockResolvedValue({ data: null })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('lista todas las colecciones con toggle inline de estado', async () => {
    renderView()

    expect(await screen.findByRole('cell', { name: 'Óleos' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Bocetos' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Publicar Óleos' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Publicar Bocetos' })).not.toBeChecked()
  })

  it('alterna publicada inline enviando también title (exigido por CollectionRequest)', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('checkbox', { name: 'Publicar Bocetos' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('collections', 2, {
        title: 'Bocetos',
        isPublished: true,
      }),
    )
  })

  it('muestra el estado de carga', () => {
    adminApi.list.mockReturnValue(new Promise(() => {}))
    renderView()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('crea una colección con el formulario basado en EntityForm', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('button', { name: 'Nueva colección' }))
    expect(screen.getByRole('heading', { name: 'Crear colección' })).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toBeInTheDocument()
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
    expect(screen.getByLabelText(/imagen de portada/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Posición')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Publicada' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Título'), 'Acuarelas')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.create).toHaveBeenCalledWith('collections', {
        title: 'Acuarelas',
        isPublished: false,
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Crear colección' })).not.toBeInTheDocument(),
    )
  })

  it('edita con valores precargados y envía los campos cambiados más title (exigido por CollectionRequest)', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('button', { name: 'Editar Óleos' }))

    expect(screen.getByRole('heading', { name: 'Editar colección' })).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('Óleos')
    expect(screen.getByLabelText('Descripción')).toHaveValue('Descripción óleos')
    expect(screen.getByRole('checkbox', { name: 'Publicada' })).toBeChecked()

    await user.clear(screen.getByLabelText('Descripción'))
    await user.type(screen.getByLabelText('Descripción'), 'Nuevo texto')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('collections', 1, {
        title: 'Óleos',
        description: 'Nuevo texto',
      }),
    )
  })

  it('cierra el formulario sin llamar a update si no hay cambios', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('button', { name: 'Editar Óleos' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Editar colección' })).not.toBeInTheDocument(),
    )
    expect(adminApi.update).not.toHaveBeenCalled()
  })

  it('borra tras confirmar en el ConfirmDialog', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('button', { name: 'Borrar Óleos' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('¿Borrar la colección «Óleos»?')

    await user.click(within(dialog).getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(adminApi.remove).toHaveBeenCalledWith('collections', 1))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('cancela el borrado sin llamar a remove', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('button', { name: 'Borrar Óleos' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }))

    expect(adminApi.remove).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('reordena con subir/bajar enviando { orderedIds }', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('button', { name: 'Bajar Óleos' }))

    await waitFor(() => expect(adminApi.reorder).toHaveBeenCalledWith('collections', [2, 1]))
    await waitFor(() => expect(within(dataRows()[0]).getByText('Bocetos')).toBeInTheDocument())
  })

  it('muestra el error 400 del reorder y revierte el orden', async () => {
    adminApi.reorder.mockRejectedValue(
      Object.assign(new Error('Algunos IDs no existen'), { status: 400, code: 'VALIDATION_ERROR' }),
    )
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('button', { name: 'Bajar Óleos' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Algunos IDs no existen')
    await waitFor(() => expect(within(dataRows()[0]).getByText('Óleos')).toBeInTheDocument())
  })

  it('muestra el VALIDATION_ERROR del server al crear', async () => {
    adminApi.create.mockRejectedValue(
      Object.assign(new Error('El título ya existe'), { status: 400, code: 'VALIDATION_ERROR' }),
    )
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('button', { name: 'Nueva colección' }))
    await user.type(screen.getByLabelText('Título'), 'Óleos')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('El título ya existe')
    expect(alert).toHaveTextContent('VALIDATION_ERROR')
    expect(screen.getByRole('heading', { name: 'Crear colección' })).toBeInTheDocument()
  })

  it('muestra el error del server al borrar', async () => {
    adminApi.remove.mockRejectedValue(
      Object.assign(new Error('No se puede borrar'), { status: 400, code: 'VALIDATION_ERROR' }),
    )
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Óleos' })

    await user.click(screen.getByRole('button', { name: 'Borrar Óleos' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Borrar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No se puede borrar')
  })
})
