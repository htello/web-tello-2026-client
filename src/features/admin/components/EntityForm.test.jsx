import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EntityForm from './EntityForm.jsx'

const fields = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'year', label: 'Año', type: 'number', required: true, min: 1900, max: 2100 },
  {
    name: 'collectionId',
    label: 'Colección',
    type: 'select',
    required: true,
    options: [{ value: 1, label: 'Colección 1' }],
  },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'published', label: 'Publicado', type: 'checkbox' },
]

describe('EntityForm', () => {
  afterEach(cleanup)

  it('renderiza campos accesibles por label según su tipo', () => {
    render(<EntityForm fields={fields} onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Título')).toBeInTheDocument()
    expect(screen.getByLabelText('Año')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Colección' })).toBeInTheDocument()
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Publicado' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('precarga los valores iniciales en modo edición', () => {
    render(
      <EntityForm
        fields={fields}
        initialValues={{ title: 'Obra A', year: 2001, collectionId: 1, published: true }}
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Título')).toHaveValue('Obra A')
    expect(screen.getByLabelText('Año')).toHaveValue(2001)
    expect(screen.getByRole('combobox', { name: 'Colección' })).toHaveValue('1')
    expect(screen.getByRole('checkbox', { name: 'Publicado' })).toBeChecked()
  })

  it('bloquea el envío con campos requeridos vacíos y marca los errores', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<EntityForm fields={fields} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Título es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Año es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('Colección es obligatorio')).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('valida el rango de los campos numéricos', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <EntityForm
        fields={[{ name: 'year', label: 'Año', type: 'number', required: true, min: 1900, max: 2100 }]}
        initialValues={{ year: 1800 }}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText(/no puede ser menor que 1900/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.clear(screen.getByLabelText('Año'))
    await user.type(screen.getByLabelText('Año'), '2200')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText(/no puede ser mayor que 2100/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('usa la validación personalizada del campo cuando existe', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <EntityForm
        fields={[
          {
            name: 'slug',
            label: 'Slug',
            type: 'text',
            validate: (value) => (/\s/.test(value) ? 'Sin espacios' : ''),
          },
        ]}
        initialValues={{ slug: 'con espacio' }}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Sin espacios')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envía valores tipados (números, select numérico y checkbox) al validar', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue({ ok: true, data: { id: 1 } })
    render(<EntityForm fields={fields} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Título'), 'Obra nueva')
    await user.type(screen.getByLabelText('Año'), '2024')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Colección' }), '1')
    await user.type(screen.getByLabelText('Descripción'), '  Texto  ')
    await user.click(screen.getByRole('checkbox', { name: 'Publicado' }))
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Obra nueva',
      year: 2024,
      collectionId: 1,
      description: 'Texto',
      published: true,
    })
  })

  it('deshabilita el envío mientras guarda', async () => {
    const user = userEvent.setup()
    let resolveSubmit
    const onSubmit = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve
        }),
    )
    render(
      <EntityForm
        fields={[{ name: 'title', label: 'Título', type: 'text' }]}
        initialValues={{ title: 'X' }}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled())

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    resolveSubmit({ ok: true, data: null })

    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar' })).toBeEnabled())
  })

  it('muestra el error del server con mensaje y code', async () => {
    const user = userEvent.setup()
    const error = Object.assign(new Error('El registro está duplicado'), {
      status: 400,
      code: 'DUPLICATE_ERROR',
    })
    const onSubmit = vi.fn().mockResolvedValue({ ok: false, error })
    render(
      <EntityForm
        fields={[{ name: 'title', label: 'Título', type: 'text' }]}
        initialValues={{ title: 'X' }}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('El registro está duplicado')
    expect(alert).toHaveTextContent('DUPLICATE_ERROR')
  })

  it('captura los errores lanzados por onSubmit como error genérico', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Sin conexión'))
    render(
      <EntityForm
        fields={[{ name: 'title', label: 'Título', type: 'text' }]}
        initialValues={{ title: 'X' }}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Sin conexión')
  })

  it('llama a onSuccess con los datos cuando la mutación tiene éxito', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue({ ok: true, data: { id: 9 } })
    const onSuccess = vi.fn()
    render(
      <EntityForm
        fields={[{ name: 'title', label: 'Título', type: 'text' }]}
        initialValues={{ title: 'X' }}
        onSubmit={onSubmit}
        onSuccess={onSuccess}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 9 }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('llama a onCancel al pulsar el botón de cancelar', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<EntityForm fields={fields} onSubmit={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('no renderiza el botón de cancelar sin onCancel', () => {
    render(<EntityForm fields={fields} onSubmit={vi.fn()} />)

    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
  })

  it('admite etiquetas de envío personalizadas', () => {
    render(<EntityForm fields={fields} onSubmit={vi.fn()} submitLabel="Crear obra" />)

    expect(screen.getByRole('button', { name: 'Crear obra' })).toBeInTheDocument()
  })
})

describe('EntityForm campos de imagen', () => {
  const UPLOAD_DATA = {
    url: 'https://cdn.test/pintura/abc.jpg',
    thumbnail: 'https://cdn.test/pintura/abc_t.jpg',
    width: 800,
    height: 600,
    format: 'jpg',
  }
  const uploadResponse = {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => ({ data: UPLOAD_DATA }),
  }
  const imageFile = new File(['img'], 'foto.jpg', { type: 'image/jpeg' })

  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(uploadResponse))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('type image: renderiza campo de archivo e incluye la url subida en el payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true })
    render(
      <EntityForm
        fields={[
          { name: 'title', label: 'Título', type: 'text', required: true },
          { name: 'imageUrl', label: 'Imagen', type: 'image', section: 'pintura' },
        ]}
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByLabelText('Imagen')).toHaveAttribute('type', 'file')

    await user.type(screen.getByLabelText('Título'), 'Obra')
    await user.upload(screen.getByLabelText('Imagen'), imageFile)
    await screen.findByAltText('Imagen subida')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ title: 'Obra', imageUrl: UPLOAD_DATA.url }),
    )
  })

  it('type images: añade la imagen subida y expone la lista normalizada', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true })
    render(
      <EntityForm
        fields={[
          { name: 'title', label: 'Título', type: 'text', required: true },
          { name: 'images', label: 'Imágenes', type: 'images', section: 'general' },
        ]}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByLabelText('Título'), 'Expo')
    await user.upload(screen.getByLabelText('Añadir imagen'), imageFile)
    await screen.findByAltText('Imagen 1')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Expo',
        images: [
          {
            url: UPLOAD_DATA.url,
            thumbnail: UPLOAD_DATA.thumbnail,
            width: UPLOAD_DATA.width,
            height: UPLOAD_DATA.height,
          },
        ],
      }),
    )
  })

  it('type images: requerido sin imágenes bloquea el envío', async () => {
    const onSubmit = vi.fn()
    render(
      <EntityForm
        fields={[{ name: 'images', label: 'Imágenes', type: 'images', required: true }]}
        onSubmit={onSubmit}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(screen.getByText('Imágenes es obligatorio')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
