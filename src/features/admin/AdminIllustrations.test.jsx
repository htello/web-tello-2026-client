import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminIllustrations from './AdminIllustrations.jsx'
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

const ILLUSTRATIONS = [
  {
    id: 40,
    title: 'Dragón',
    description: '',
    imageUrl: null,
    isPublished: true,
    isFeatured: false,
    position: 0,
  },
  {
    id: 41,
    title: 'Retrato a tinta',
    description: '',
    imageUrl: null,
    isPublished: false,
    isFeatured: true,
    position: 1,
  },
]

function renderView() {
  return render(
    <MemoryRouter>
      <AdminIllustrations />
    </MemoryRouter>,
  )
}

describe('AdminIllustrations', () => {
  beforeEach(() => {
    adminApi.list.mockResolvedValue({ data: ILLUSTRATIONS })
    adminApi.create.mockResolvedValue({ data: { id: 42 } })
    adminApi.update.mockResolvedValue({ data: { id: 40 } })
    adminApi.remove.mockResolvedValue(null)
    adminApi.reorder.mockResolvedValue({ data: null })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('lista todas las ilustraciones (publicadas y no) con toggles inline', async () => {
    renderView()

    expect(await screen.findByRole('cell', { name: 'Dragón' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Retrato a tinta' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Publicar Dragón' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Destacar Dragón' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Publicar Retrato a tinta' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Destacar Retrato a tinta' })).toBeChecked()
  })

  it('alterna publicada/destacada inline con PUT parcial', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Dragón' })

    await user.click(screen.getByRole('checkbox', { name: 'Publicar Retrato a tinta' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('illustrations', 41, { isPublished: true }),
    )

    await user.click(screen.getByRole('checkbox', { name: 'Destacar Dragón' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('illustrations', 40, { isFeatured: true }),
    )
  })

  it('valida el título obligatorio antes de crear', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Dragón' })

    await user.click(screen.getByRole('button', { name: 'Nueva ilustración' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Título es obligatorio')).toBeInTheDocument()
    expect(adminApi.create).not.toHaveBeenCalled()
  })

  it('crea una ilustración con los campos del schema IllustrationRequest', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Dragón' })

    await user.click(screen.getByRole('button', { name: 'Nueva ilustración' }))
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
    expect(screen.getByLabelText(/imagen \(url\)/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText('Título'), 'Bosque')
    await user.click(screen.getByRole('checkbox', { name: 'Publicada' }))
    await user.click(screen.getByRole('checkbox', { name: 'Destacada' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.create).toHaveBeenCalledWith('illustrations', {
        title: 'Bosque',
        isPublished: true,
        isFeatured: true,
      }),
    )
  })

  it('edita precargando valores y envía solo lo cambiado', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Dragón' })

    await user.click(screen.getByRole('button', { name: 'Editar Dragón' }))

    expect(screen.getByLabelText('Título')).toHaveValue('Dragón')
    expect(screen.getByRole('checkbox', { name: 'Publicada' })).toBeChecked()

    await user.type(screen.getByLabelText('Descripción'), 'Acuarela original')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('illustrations', 40, {
        description: 'Acuarela original',
      }),
    )
  })

  it('reordena enviando SOLO { orderedIds }', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Dragón' })

    await user.click(screen.getByRole('button', { name: 'Bajar Dragón' }))

    await waitFor(() => expect(adminApi.reorder).toHaveBeenCalledWith('illustrations', [41, 40]))
    expect(adminApi.reorder.mock.calls[0]).toHaveLength(2)
  })

  it('borra con confirmación', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Dragón' })

    await user.click(screen.getByRole('button', { name: 'Borrar Dragón' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(adminApi.remove).toHaveBeenCalledWith('illustrations', 40))
  })

  it('muestra el estado vacío', async () => {
    adminApi.list.mockResolvedValue({ data: [] })
    renderView()

    expect(await screen.findByText('No hay ilustraciones.')).toBeInTheDocument()
  })
})
