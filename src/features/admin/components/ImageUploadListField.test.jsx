import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setAuthToken } from '@/services/api.js'
import ImageUploadListField from './ImageUploadListField.jsx'

const UPLOAD_DATA = {
  url: 'https://cdn.test/general/nueva.jpg',
  thumbnail: 'https://cdn.test/general/nueva_thumb.jpg',
  width: 400,
  height: 300,
  format: 'jpg',
}

const jsonResponse = (payload, ok = true, status = 200) => ({
  ok,
  status,
  headers: { get: () => 'application/json' },
  json: async () => payload,
})

const imageFile = (name = 'foto.jpg', type = 'image/jpeg', size = 1024) =>
  new File([new Uint8Array(size)], name, { type })

const INITIAL = [
  {
    id: 1,
    url: 'https://cdn.test/a.jpg',
    thumbnail: 'https://cdn.test/a_t.jpg',
    width: 100,
    height: 80,
    position: 0,
  },
  { id: 2, url: 'https://cdn.test/b.jpg', thumbnail: null, width: null, height: null, position: 1 },
]

const NORMALIZED_INITIAL = [
  { url: 'https://cdn.test/a.jpg', thumbnail: 'https://cdn.test/a_t.jpg', width: 100, height: 80 },
  { url: 'https://cdn.test/b.jpg', thumbnail: null, width: null, height: null },
]

describe('ImageUploadListField', () => {
  let user

  beforeEach(() => {
    setAuthToken('token-admin')
    user = userEvent.setup()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    setAuthToken(null)
  })

  it('renderiza las imágenes existentes en orden con botones accesibles', () => {
    render(
      <ImageUploadListField id="imagenes" label="Imágenes" value={INITIAL} onChange={vi.fn()} />,
    )

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', 'https://cdn.test/a_t.jpg')
    expect(images[1]).toHaveAttribute('src', 'https://cdn.test/b.jpg')
    expect(screen.getByLabelText('Añadir imagen')).toBeInTheDocument()
    expect(screen.getByLabelText('Añadir imagen')).toHaveAttribute('multiple')
    expect(screen.getAllByRole('button', { name: /quitar imagen/i })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Subir imagen 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bajar imagen 1' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Subir imagen 1' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Bajar imagen 2' })).not.toBeInTheDocument()
  })

  it('sube una imagen nueva y la añade al final exponiendo la lista normalizada', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: UPLOAD_DATA })))
    const onChange = vi.fn()
    render(
      <ImageUploadListField id="imagenes" label="Imágenes" value={INITIAL} onChange={onChange} />,
    )

    await user.upload(screen.getByLabelText('Añadir imagen'), imageFile())

    await screen.findByAltText('Imagen 3')
    expect(onChange).toHaveBeenLastCalledWith([
      ...NORMALIZED_INITIAL,
      {
        url: UPLOAD_DATA.url,
        thumbnail: UPLOAD_DATA.thumbnail,
        width: UPLOAD_DATA.width,
        height: UPLOAD_DATA.height,
      },
    ])
  })

  it('selecciona varias imágenes a la vez y las añade en orden', async () => {
    const UPLOAD_DATA_2 = {
      url: 'https://cdn.test/general/otra.png',
      thumbnail: 'https://cdn.test/general/otra_thumb.png',
      width: 640,
      height: 480,
      format: 'png',
    }
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ data: UPLOAD_DATA }))
        .mockResolvedValueOnce(jsonResponse({ data: UPLOAD_DATA_2 })),
    )
    const onChange = vi.fn()
    render(
      <ImageUploadListField id="imagenes" label="Imágenes" value={INITIAL} onChange={onChange} />,
    )

    await user.upload(screen.getByLabelText('Añadir imagen'), [
      imageFile('foto.jpg', 'image/jpeg'),
      imageFile('otra.png', 'image/png'),
    ])

    await screen.findByAltText('Imagen 4')
    expect(onChange).toHaveBeenLastCalledWith([
      ...NORMALIZED_INITIAL,
      {
        url: UPLOAD_DATA.url,
        thumbnail: UPLOAD_DATA.thumbnail,
        width: UPLOAD_DATA.width,
        height: UPLOAD_DATA.height,
      },
      {
        url: UPLOAD_DATA_2.url,
        thumbnail: UPLOAD_DATA_2.thumbnail,
        width: UPLOAD_DATA_2.width,
        height: UPLOAD_DATA_2.height,
      },
    ])
  })

  it('selección mixta: sube las válidas y muestra el error de las rechazadas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: UPLOAD_DATA }))
    vi.stubGlobal('fetch', fetchMock)
    const userNoAccept = userEvent.setup({ applyAccept: false })
    const onChange = vi.fn()
    render(
      <ImageUploadListField id="imagenes" label="Imágenes" value={INITIAL} onChange={onChange} />,
    )

    await userNoAccept.upload(screen.getByLabelText('Añadir imagen'), [
      imageFile('foto.gif', 'image/gif'),
      imageFile('foto.jpg', 'image/jpeg'),
    ])

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'foto.gif: Formato no válido: usa JPEG, PNG o WebP',
    )
    await screen.findByAltText('Imagen 3')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith([
      ...NORMALIZED_INITIAL,
      {
        url: UPLOAD_DATA.url,
        thumbnail: UPLOAD_DATA.thumbnail,
        width: UPLOAD_DATA.width,
        height: UPLOAD_DATA.height,
      },
    ])
  })

  it('fallo de server a mitad de lote: conserva las subidas correctas', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ data: UPLOAD_DATA }))
        .mockResolvedValueOnce(
          jsonResponse(
            { error: 'Solo imágenes JPEG, PNG o WebP', code: 'VALIDATION_ERROR' },
            false,
            400,
          ),
        ),
    )
    const onChange = vi.fn()
    render(
      <ImageUploadListField id="imagenes" label="Imágenes" value={INITIAL} onChange={onChange} />,
    )

    await user.upload(screen.getByLabelText('Añadir imagen'), [
      imageFile('foto.jpg', 'image/jpeg'),
      imageFile('falsa.jpg', 'image/jpeg'),
    ])

    expect(await screen.findByRole('alert')).toHaveTextContent('Solo imágenes JPEG, PNG o WebP')
    await screen.findByAltText('Imagen 3')
    expect(screen.queryByAltText('Imagen 4')).not.toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith([
      ...NORMALIZED_INITIAL,
      {
        url: UPLOAD_DATA.url,
        thumbnail: UPLOAD_DATA.thumbnail,
        width: UPLOAD_DATA.width,
        height: UPLOAD_DATA.height,
      },
    ])
  })

  it('quitar una imagen la excluye de la lista expuesta', async () => {
    const onChange = vi.fn()
    render(
      <ImageUploadListField id="imagenes" label="Imágenes" value={INITIAL} onChange={onChange} />,
    )

    await user.click(screen.getByRole('button', { name: 'Quitar imagen 1' }))

    expect(onChange).toHaveBeenLastCalledWith([NORMALIZED_INITIAL[1]])
  })

  it('reordenar con Subir expone la lista en el nuevo orden', async () => {
    const onChange = vi.fn()
    render(
      <ImageUploadListField id="imagenes" label="Imágenes" value={INITIAL} onChange={onChange} />,
    )

    await user.click(screen.getByRole('button', { name: 'Subir imagen 2' }))

    expect(onChange).toHaveBeenLastCalledWith([NORMALIZED_INITIAL[1], NORMALIZED_INITIAL[0]])
  })

  it('rechaza formato inválido o más de 5 MB sin llamada de red', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const onChange = vi.fn()
    const userNoAccept = userEvent.setup({ applyAccept: false })
    render(<ImageUploadListField id="imagenes" label="Imágenes" value={[]} onChange={onChange} />)

    await userNoAccept.upload(screen.getByLabelText('Añadir imagen'), imageFile('foto.gif', 'image/gif'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Formato no válido')

    await user.upload(
      screen.getByLabelText('Añadir imagen'),
      imageFile('grande.jpg', 'image/jpeg', 6 * 1024 * 1024),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('supera el máximo de 5 MB')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('muestra el error del server si falla la subida', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { error: 'Solo imágenes JPEG, PNG o WebP', code: 'VALIDATION_ERROR' },
            false,
            400,
          ),
        ),
    )
    render(<ImageUploadListField id="imagenes" label="Imágenes" value={[]} onChange={vi.fn()} />)

    await user.upload(screen.getByLabelText('Añadir imagen'), imageFile())

    expect(await screen.findByRole('alert')).toHaveTextContent('Solo imágenes JPEG, PNG o WebP')
  })
})
