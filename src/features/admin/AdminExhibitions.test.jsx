import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminExhibitions from './AdminExhibitions.jsx'
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

const EXHIBITIONS = [
  {
    id: 20,
    title: 'Expo Madrid',
    date: '2024-05-01',
    location: 'Madrid',
    description: '',
    position: 0,
    isPublished: true,
  },
  {
    id: 21,
    title: 'Expo Sevilla',
    date: '2023-04-01',
    location: 'Sevilla',
    description: '',
    position: 1,
    isPublished: false,
  },
]

function renderView() {
  return render(
    <MemoryRouter>
      <AdminExhibitions />
    </MemoryRouter>,
  )
}

describe('AdminExhibitions', () => {
  beforeEach(() => {
    adminApi.list.mockResolvedValue({ data: EXHIBITIONS })
    adminApi.create.mockResolvedValue({ data: { id: 22 } })
    adminApi.update.mockResolvedValue({ data: { id: 20 } })
    adminApi.remove.mockResolvedValue(null)
    adminApi.reorder.mockResolvedValue({ data: null })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('lista las exhibiciones con fecha y estado', async () => {
    renderView()

    expect(await screen.findByRole('cell', { name: 'Expo Madrid' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '2024-05-01' })).toBeInTheDocument()
    expect(screen.getByText('Publicada')).toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
  })

  it('valida título y fecha obligatorios antes de crear', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Expo Madrid' })

    await user.click(screen.getByRole('button', { name: 'Nueva exhibición' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Título es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Fecha es obligatorio')).toBeInTheDocument()
    expect(adminApi.create).not.toHaveBeenCalled()
  })

  it('crea una exhibición con campos del schema ExhibitionRequest', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Expo Madrid' })

    await user.click(screen.getByRole('button', { name: 'Nueva exhibición' }))
    expect(screen.getByLabelText('Localización')).toBeInTheDocument()
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Título'), 'Expo Bilbao')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2025-01-15' } })
    await user.type(screen.getByLabelText('Localización'), 'Bilbao')
    await user.click(screen.getByRole('checkbox', { name: 'Publicada' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.create).toHaveBeenCalledWith('exhibitions', {
        title: 'Expo Bilbao',
        date: '2025-01-15',
        location: 'Bilbao',
        isPublished: true,
      }),
    )
  })

  it('edita con valores precargados y envía solo lo cambiado', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Expo Madrid' })

    await user.click(screen.getByRole('button', { name: 'Editar Expo Madrid' }))

    expect(screen.getByLabelText('Título')).toHaveValue('Expo Madrid')
    expect(screen.getByLabelText('Fecha')).toHaveValue('2024-05-01')

    await user.clear(screen.getByLabelText('Localización'))
    await user.type(screen.getByLabelText('Localización'), 'Barcelona')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('exhibitions', 20, { location: 'Barcelona' }),
    )
  })

  it('borra tras confirmar en el ConfirmDialog', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Expo Madrid' })

    await user.click(screen.getByRole('button', { name: 'Borrar Expo Madrid' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('¿Borrar la exhibición «Expo Madrid»?')

    await user.click(within(dialog).getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(adminApi.remove).toHaveBeenCalledWith('exhibitions', 20))
  })

  it('reordena enviando { orderedIds }', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Expo Madrid' })

    await user.click(screen.getByRole('button', { name: 'Bajar Expo Madrid' }))

    await waitFor(() => expect(adminApi.reorder).toHaveBeenCalledWith('exhibitions', [21, 20]))
  })

  it('muestra el error del server al crear', async () => {
    adminApi.create.mockRejectedValue(
      Object.assign(new Error('Registro duplicado'), { status: 400, code: 'DUPLICATE_ERROR' }),
    )
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Expo Madrid' })

    await user.click(screen.getByRole('button', { name: 'Nueva exhibición' }))
    await user.type(screen.getByLabelText('Título'), 'Expo Madrid')
    fireEvent.change(screen.getByLabelText('Fecha'), { target: { value: '2025-01-15' } })
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Registro duplicado')
    expect(alert).toHaveTextContent('DUPLICATE_ERROR')
  })
})
