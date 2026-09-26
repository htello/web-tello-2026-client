import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminBiography from './AdminBiography.jsx'
import { api } from '@/services/api.js'
import { adminApi } from '@/services/adminApi.js'

vi.mock('@/services/api.js', () => ({
  api: { get: vi.fn() },
}))

vi.mock('@/services/adminApi.js', () => ({
  adminApi: {
    createBiography: vi.fn(),
    updateBiography: vi.fn(),
    upload: vi.fn(),
  },
}))

const UPLOAD_RESPONSE = {
  data: {
    url: 'https://cdn.example.com/nueva.jpg',
    thumbnail: 'https://cdn.example.com/nueva_t.jpg',
    width: 600,
    height: 800,
    format: 'jpg',
  },
}

const BIOGRAPHY = {
  id: 1,
  content: 'Antonio Tello es un pintor afincado en Madrid.',
  imageUrl: 'https://cdn.example.com/artist.jpg',
  updatedAt: '2026-01-01T10:00:00Z',
}

const notFoundError = Object.assign(new Error('No encontrado'), {
  status: 404,
  code: 'NOT_FOUND',
})

function renderView() {
  return render(
    <MemoryRouter>
      <AdminBiography />
    </MemoryRouter>,
  )
}

describe('AdminBiography', () => {
  beforeEach(() => {
    adminApi.createBiography.mockResolvedValue({ data: { ...BIOGRAPHY, id: 1 } })
    adminApi.updateBiography.mockResolvedValue({ data: BIOGRAPHY })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('muestra el estado de carga mientras obtiene la biografía', () => {
    api.get.mockReturnValue(new Promise(() => {}))
    renderView()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('muestra error si GET /biography falla con un error que no es 404', async () => {
    api.get.mockRejectedValue(
      Object.assign(new Error('Servidor caído'), { status: 500, code: 'INTERNAL_ERROR' }),
    )
    renderView()

    expect(await screen.findByText('No se pudo cargar la biografía.')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('con 404 muestra el formulario de creación y crea con POST /admin/biography', async () => {
    const user = userEvent.setup()
    api.get
      .mockRejectedValueOnce(notFoundError)
      .mockResolvedValue({ data: BIOGRAPHY })
    renderView()

    expect(await screen.findByRole('heading', { name: 'Crear biografía' })).toBeInTheDocument()

    await user.type(
      screen.getByLabelText('Contenido'),
      'Nueva biografía del artista Antonio Tello.',
    )
    adminApi.upload.mockResolvedValue(UPLOAD_RESPONSE)
    await user.upload(
      screen.getByLabelText(/foto del artista/i),
      new File(['img'], 'nueva.jpg', { type: 'image/jpeg' }),
    )
    await screen.findByAltText('Foto del artista subida')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(adminApi.upload).toHaveBeenCalledWith(expect.any(File), 'general')
    await waitFor(() =>
      expect(adminApi.createBiography).toHaveBeenCalledWith({
        content: 'Nueva biografía del artista Antonio Tello.',
        imageUrl: 'https://cdn.example.com/nueva.jpg',
      }),
    )
    expect(await screen.findByText('Biografía guardada.')).toBeInTheDocument()
  })

  it('si existe, precarga el formulario de edición y envía un PUT parcial', async () => {
    const user = userEvent.setup()
    api.get.mockResolvedValue({ data: BIOGRAPHY })
    renderView()

    expect(await screen.findByRole('heading', { name: 'Editar biografía' })).toBeInTheDocument()
    expect(screen.getByLabelText('Contenido')).toHaveValue(BIOGRAPHY.content)
    expect(screen.getByAltText('Foto del artista actual')).toHaveAttribute(
      'src',
      BIOGRAPHY.imageUrl,
    )

    adminApi.upload.mockResolvedValue({
      data: { ...UPLOAD_RESPONSE.data, url: 'https://cdn.example.com/b.jpg' },
    })
    await user.upload(
      screen.getByLabelText(/foto del artista/i),
      new File(['img'], 'b.jpg', { type: 'image/jpeg' }),
    )
    await screen.findByAltText('Foto del artista subida')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(adminApi.updateBiography).toHaveBeenCalledWith({
        imageUrl: 'https://cdn.example.com/b.jpg',
      }),
    )
    expect(await screen.findByText('Biografía guardada.')).toBeInTheDocument()
  })

  it('no llama a la API si se guarda sin cambios', async () => {
    const user = userEvent.setup()
    api.get.mockResolvedValue({ data: BIOGRAPHY })
    renderView()

    await screen.findByRole('heading', { name: 'Editar biografía' })
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Biografía guardada.')).toBeInTheDocument()
    expect(adminApi.updateBiography).not.toHaveBeenCalled()
  })

  it('valida contenido obligatorio y mínimo de 10 caracteres', async () => {
    const user = userEvent.setup()
    api.get.mockRejectedValueOnce(notFoundError)
    renderView()

    await screen.findByRole('heading', { name: 'Crear biografía' })
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Contenido es obligatorio')).toBeInTheDocument()
    expect(adminApi.createBiography).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Contenido'), 'Corto')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(
      screen.getByText('El contenido debe tener al menos 10 caracteres'),
    ).toBeInTheDocument()
    expect(adminApi.createBiography).not.toHaveBeenCalled()
  })

  it('muestra el error del server al guardar', async () => {
    const user = userEvent.setup()
    api.get.mockResolvedValue({ data: BIOGRAPHY })
    adminApi.updateBiography.mockRejectedValue(
      Object.assign(new Error('Token expirado'), { status: 403, code: 'FORBIDDEN' }),
    )
    renderView()

    await screen.findByRole('heading', { name: 'Editar biografía' })
    await user.type(screen.getByLabelText('Contenido'), ' añadido final')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Token expirado')
    expect(alert).toHaveTextContent('FORBIDDEN')
  })
})
