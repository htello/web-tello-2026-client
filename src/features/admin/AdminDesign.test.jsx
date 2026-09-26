import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminDesign from './AdminDesign.jsx'
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

const DESIGNS = [
  {
    id: 30,
    title: 'Cartel Feria',
    description: '',
    imageUrl: null,
    subcategory: 'carteleria',
    isPublished: true,
    isFeatured: false,
    position: 0,
  },
  {
    id: 31,
    title: 'Logo Bodega',
    description: '',
    imageUrl: null,
    subcategory: 'imagen-corporativa',
    isPublished: false,
    isFeatured: true,
    position: 1,
  },
]

function renderView() {
  return render(
    <MemoryRouter>
      <AdminDesign />
    </MemoryRouter>,
  )
}

describe('AdminDesign', () => {
  beforeEach(() => {
    adminApi.list.mockImplementation((resource, { params } = {}) => {
      const data = params?.subcategory
        ? DESIGNS.filter((design) => design.subcategory === params.subcategory)
        : DESIGNS
      return Promise.resolve({ data })
    })
    adminApi.create.mockResolvedValue({ data: { id: 32 } })
    adminApi.update.mockResolvedValue({ data: { id: 30 } })
    adminApi.remove.mockResolvedValue(null)
    adminApi.reorder.mockResolvedValue({ data: null })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('lista los proyectos con su subcategoría y toggles inline', async () => {
    renderView()

    expect(await screen.findByRole('cell', { name: 'Cartel Feria' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Cartelería' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Imagen corporativa' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Publicar Cartel Feria' })).toBeChecked()
  })

  it('alterna publicada inline con PUT parcial', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.click(screen.getByRole('checkbox', { name: 'Publicar Logo Bodega' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('design', 31, { isPublished: true }),
    )
  })

  it('valida título y subcategoría obligatorios antes de crear', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.click(screen.getByRole('button', { name: 'Nuevo proyecto' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Título es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Subcategoría es obligatorio')).toBeInTheDocument()
    expect(adminApi.create).not.toHaveBeenCalled()
  })

  it('ofrece las 4 subcategorías del contrato en el selector del formulario', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.click(screen.getByRole('button', { name: 'Nuevo proyecto' }))

    const select = screen.getByRole('combobox', { name: 'Subcategoría' })
    expect(within(select).getByRole('option', { name: 'Imagen corporativa' })).toBeInTheDocument()
    expect(
      within(select).getByRole('option', { name: 'Packaging y Expositores' }),
    ).toBeInTheDocument()
    expect(within(select).getByRole('option', { name: 'Cartelería' })).toBeInTheDocument()
    expect(within(select).getByRole('option', { name: 'Editorial' })).toBeInTheDocument()
  })

  it('crea un proyecto con la subcategoría seleccionada', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.click(screen.getByRole('button', { name: 'Nuevo proyecto' }))
    await user.type(screen.getByLabelText('Título'), 'Catálogo Expo')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Subcategoría' }), 'editorial')
    await user.click(screen.getByRole('checkbox', { name: 'Publicado' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.create).toHaveBeenCalledWith('design', {
        title: 'Catálogo Expo',
        subcategory: 'editorial',
        isPublished: true,
      }),
    )
  })

  it('edita precargando valores y envía solo lo cambiado', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.click(screen.getByRole('button', { name: 'Editar Cartel Feria' }))

    expect(screen.getByLabelText('Título')).toHaveValue('Cartel Feria')
    expect(screen.getByRole('combobox', { name: 'Subcategoría' })).toHaveValue('carteleria')
    expect(screen.getByRole('checkbox', { name: 'Publicado' })).toBeChecked()

    await user.type(screen.getByLabelText('Descripción'), 'Cartel de la feria 2024')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.update).toHaveBeenCalledWith('design', 30, {
        description: 'Cartel de la feria 2024',
      }),
    )
  })

  it('filtra la lista por subcategoría vía query del server', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.selectOptions(screen.getByLabelText('Filtrar por subcategoría'), 'carteleria')

    await waitFor(() =>
      expect(adminApi.list).toHaveBeenCalledWith(
        'design',
        expect.objectContaining({ params: { page: 1, limit: 20, subcategory: 'carteleria' } }),
      ),
    )
    expect(await screen.findByRole('cell', { name: 'Cartel Feria' })).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('cell', { name: 'Logo Bodega' })).not.toBeInTheDocument(),
    )

    await user.selectOptions(screen.getByLabelText('Filtrar por subcategoría'), 'all')

    await waitFor(() =>
      expect(adminApi.list).toHaveBeenCalledWith(
        'design',
        expect.objectContaining({ params: { page: 1, limit: 20 } }),
      ),
    )
    expect(await screen.findByRole('cell', { name: 'Logo Bodega' })).toBeInTheDocument()
  })

  it('oculta la reordenación con el filtro activo', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.selectOptions(screen.getByLabelText('Filtrar por subcategoría'), 'carteleria')

    expect(screen.queryByRole('button', { name: /subir/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /bajar/i })).not.toBeInTheDocument()
  })

  it('reordena enviando SOLO { orderedIds }', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.click(screen.getByRole('button', { name: 'Bajar Cartel Feria' }))

    await waitFor(() => expect(adminApi.reorder).toHaveBeenCalledWith('design', [31, 30]))
    expect(adminApi.reorder.mock.calls[0]).toHaveLength(2)
  })

  it('borra con confirmación', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.click(screen.getByRole('button', { name: 'Borrar Cartel Feria' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Borrar' }))

    await waitFor(() => expect(adminApi.remove).toHaveBeenCalledWith('design', 30))
  })

  it('muestra el estado vacío sin filtro', async () => {
    adminApi.list.mockImplementation(() => Promise.resolve({ data: [] }))
    renderView()

    expect(await screen.findByText('No hay proyectos de diseño.')).toBeInTheDocument()
  })

  it('muestra el estado vacío filtrado', async () => {
    const user = userEvent.setup()
    renderView()
    await screen.findByRole('cell', { name: 'Cartel Feria' })

    await user.selectOptions(screen.getByLabelText('Filtrar por subcategoría'), 'editorial')

    expect(await screen.findByText('No hay proyectos para este filtro.')).toBeInTheDocument()
  })
})
