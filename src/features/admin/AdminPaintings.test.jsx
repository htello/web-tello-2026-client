import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminPaintings from './AdminPaintings.jsx'
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
  { id: 1, title: 'Óleos', position: 0, isPublished: true },
  { id: 2, title: 'Bocetos', position: 1, isPublished: false },
  { id: 3, title: 'Vacía', position: 2, isPublished: true },
]

const PAINTINGS = [
  {
    id: 10,
    title: 'Marina',
    year: 2001,
    dimensions: '100x80',
    technique: 'Óleo sobre lienzo',
    imageUrl: null,
    position: 0,
    isPublished: true,
    isFeatured: true,
    collection: { id: 1, title: 'Óleos' },
  },
  {
    id: 11,
    title: 'Retrato',
    year: 2002,
    dimensions: '60x40',
    technique: 'Carboncillo',
    imageUrl: null,
    position: 1,
    isPublished: false,
    isFeatured: false,
    collection: { id: 2, title: 'Bocetos' },
  },
]

function renderView() {
  return render(
    <MemoryRouter>
      <AdminPaintings />
    </MemoryRouter>,
  )
}

describe('AdminPaintings', () => {
  beforeEach(() => {
    adminApi.list.mockImplementation((resource) =>
      Promise.resolve({ data: resource === 'paintings' ? PAINTINGS : COLLECTIONS }),
    )
    adminApi.create.mockResolvedValue({ data: { id: 12 } })
    adminApi.update.mockResolvedValue({ data: { id: 10 } })
    adminApi.remove.mockResolvedValue(null)
    adminApi.reorder.mockResolvedValue({ data: null })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('lista las pinturas con su colección, estado y destacada', async () => {
    renderView()

    expect(await screen.findByRole('cell', { name: 'Marina' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Retrato' })).toBeInTheDocument()
    expect(screen.getByText('Publicada · Destacada')).toBeInTheDocument()
    expect(screen.getByText('Borrador')).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Óleos' })).toBeInTheDocument()
  })

  it('alimenta el selector de colección con GET /admin/collections', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    expect(adminApi.list).toHaveBeenCalledWith('collections', expect.objectContaining({}))

    await user.click(screen.getByRole('button', { name: 'Nueva pintura' }))

    const select = screen.getByRole('combobox', { name: 'Colección' })
    expect(within(select).getByRole('option', { name: 'Óleos' })).toBeInTheDocument()
    expect(within(select).getByRole('option', { name: 'Bocetos' })).toBeInTheDocument()
  })

  it('valida en cliente título, año y colección antes de enviar', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.click(screen.getByRole('button', { name: 'Nueva pintura' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Título es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Año es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Colección es obligatorio')).toBeInTheDocument()
    expect(adminApi.create).not.toHaveBeenCalled()
  })

  it('valida el rango del año (1900-2100)', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.click(screen.getByRole('button', { name: 'Nueva pintura' }))
    await user.type(screen.getByLabelText('Título'), 'Obra')
    await user.type(screen.getByLabelText('Año'), '1800')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText(/no puede ser menor que 1900/)).toBeInTheDocument()
    expect(adminApi.create).not.toHaveBeenCalled()
  })

  it('crea una pintura con collectionId y year numéricos y toggles', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.click(screen.getByRole('button', { name: 'Nueva pintura' }))
    await user.type(screen.getByLabelText('Título'), 'Obra nueva')
    await user.type(screen.getByLabelText('Año'), '2024')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Colección' }), '1')
    await user.click(screen.getByRole('checkbox', { name: 'Publicada' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.create).toHaveBeenCalledWith('paintings', {
        title: 'Obra nueva',
        year: 2024,
        collectionId: 1,
        isPublished: true,
        isFeatured: false,
      }),
    )
  })

  it('edita precargando la colección y envía solo lo cambiado', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.click(screen.getByRole('button', { name: 'Editar Marina' }))

    expect(screen.getByLabelText('Título')).toHaveValue('Marina')
    expect(screen.getByRole('combobox', { name: 'Colección' })).toHaveValue('1')
    expect(screen.getByLabelText('Año')).toHaveValue(2001)
    expect(screen.getByRole('checkbox', { name: 'Destacada' })).toBeChecked()

    await user.clear(screen.getByLabelText('Técnica'))
    await user.type(screen.getByLabelText('Técnica'), 'Acrílico')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('paintings', 10, { technique: 'Acrílico' }),
    )
  })

  it('filtra la lista por colección', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.selectOptions(screen.getByLabelText('Filtrar por colección'), '1')

    expect(screen.getByRole('cell', { name: 'Marina' })).toBeInTheDocument()
    expect(screen.queryByRole('cell', { name: 'Retrato' })).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Filtrar por colección'), 'all')

    expect(screen.getByRole('cell', { name: 'Retrato' })).toBeInTheDocument()
  })

  it('oculta la reordenación con el filtro activo', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.selectOptions(screen.getByLabelText('Filtrar por colección'), '1')

    expect(screen.queryByRole('button', { name: /subir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /bajar/i })).not.toBeInTheDocument()
  })

  it('reordena enviando SOLO { orderedIds }', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.click(screen.getByRole('button', { name: 'Bajar Marina' }))

    await waitFor(() => expect(adminApi.reorder).toHaveBeenCalledWith('paintings', [11, 10]))
    expect(adminApi.reorder.mock.calls[0]).toHaveLength(2)
  })

  it('muestra el VALIDATION_ERROR del server al crear', async () => {
    adminApi.create.mockRejectedValue(
      Object.assign(new Error('El año no es válido'), { status: 400, code: 'VALIDATION_ERROR' }),
    )
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.click(screen.getByRole('button', { name: 'Nueva pintura' }))
    await user.type(screen.getByLabelText('Título'), 'Obra')
    await user.type(screen.getByLabelText('Año'), '2024')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Colección' }), '1')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('El año no es válido')
    expect(alert).toHaveTextContent('VALIDATION_ERROR')
  })

  it('borra con confirmación', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.click(screen.getByRole('button', { name: 'Borrar Marina' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(adminApi.remove).toHaveBeenCalledWith('paintings', 10))
  })

  it('muestra el estado vacío filtrado', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Marina' })

    await user.selectOptions(screen.getByLabelText('Filtrar por colección'), '3')

    expect(screen.getByText('No hay pinturas para este filtro.')).toBeInTheDocument()
  })
})
