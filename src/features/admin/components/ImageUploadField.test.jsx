import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setAuthToken } from '@/services/api.js'
import ImageUploadField from './ImageUploadField.jsx'

const BASE = 'http://localhost:3000/api/v1'

const UPLOAD_DATA = {
  url: 'https://cdn.test/pintura/abc.jpg',
  thumbnail: 'https://cdn.test/pintura/abc_thumb.jpg',
  width: 800,
  height: 600,
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

describe('ImageUploadField', () => {
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

  it('renderiza un input de archivo con label accesible y formatos admitidos', () => {
    render(<ImageUploadField id="imagen" label="Imagen" onChange={vi.fn()} />)

    const input = screen.getByLabelText('Imagen')
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
  })

  it('rechaza un formato no válido con error visible y sin llamada de red', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const onChange = vi.fn()
    const userNoAccept = userEvent.setup({ applyAccept: false })
    render(<ImageUploadField id="imagen" label="Imagen" onChange={onChange} />)

    await userNoAccept.upload(screen.getByLabelText('Imagen'), imageFile('foto.gif', 'image/gif'))

    expect(await screen.findByRole('alert')).toHaveTextContent('Formato no válido')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('rechaza imágenes de más de 5 MB con error visible y sin llamada de red', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const onChange = vi.fn()
    render(<ImageUploadField id="imagen" label="Imagen" onChange={onChange} />)

    await user.upload(
      screen.getByLabelText('Imagen'),
      imageFile('grande.jpg', 'image/jpeg', 6 * 1024 * 1024),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent('supera el máximo de 5 MB')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('sube al seleccionar con estado de carga y expone la url por onChange', async () => {
    let resolveFetch
    const fetchMock = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const onChange = vi.fn()
    render(<ImageUploadField id="imagen" label="Imagen" section="pintura" onChange={onChange} />)

    await user.upload(screen.getByLabelText('Imagen'), imageFile())

    expect(await screen.findByText('Subiendo imagen…')).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()

    resolveFetch(jsonResponse({ data: UPLOAD_DATA }))

    expect(await screen.findByAltText('Imagen subida')).toHaveAttribute(
      'src',
      UPLOAD_DATA.thumbnail,
    )
    expect(screen.getByText('foto.jpg · 800 × 600 px')).toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith(UPLOAD_DATA.url)

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/admin/upload`)
    expect(options.method).toBe('POST')
    expect(options.headers.Authorization).toBe('Bearer token-admin')
    expect(options.headers).not.toHaveProperty('Content-Type')
    expect(options.body.get('section')).toBe('pintura')
    expect(options.body.get('file')).toBeInstanceOf(File)
  })

  it('usa section "general" por defecto', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: UPLOAD_DATA }))
    vi.stubGlobal('fetch', fetchMock)
    render(<ImageUploadField id="imagen" label="Imagen" onChange={vi.fn()} />)

    await user.upload(screen.getByLabelText('Imagen'), imageFile())

    await screen.findByAltText('Imagen subida')
    expect(fetchMock.mock.calls[0][1].body.get('section')).toBe('general')
  })

  it('muestra el error del server si falla la subida', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(
            { error: 'Formato de imagen no válido', code: 'VALIDATION_ERROR' },
            false,
            400,
          ),
        ),
    )
    render(<ImageUploadField id="imagen" label="Imagen" onChange={vi.fn()} />)

    await user.upload(screen.getByLabelText('Imagen'), imageFile())

    expect(await screen.findByRole('alert')).toHaveTextContent('Formato de imagen no válido')
  })

  it('precarga la imagen existente y la limpia con "Quitar imagen"', async () => {
    const onChange = vi.fn()
    render(
      <ImageUploadField
        id="imagen"
        label="Imagen"
        value="https://cdn.test/actual.jpg"
        onChange={onChange}
      />,
    )

    expect(screen.getByAltText('Imagen actual')).toHaveAttribute('src', 'https://cdn.test/actual.jpg')

    await user.click(screen.getByRole('button', { name: 'Quitar imagen' }))

    expect(onChange).toHaveBeenLastCalledWith('')
    expect(screen.queryByAltText('Imagen actual')).not.toBeInTheDocument()
  })

  it('sustituye la imagen precargada por una subida nueva', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: UPLOAD_DATA })))
    const onChange = vi.fn()
    render(
      <ImageUploadField
        id="imagen"
        label="Imagen"
        value="https://cdn.test/actual.jpg"
        onChange={onChange}
      />,
    )

    await user.upload(screen.getByLabelText('Imagen'), imageFile('nueva.png', 'image/png'))

    expect(await screen.findByAltText('Imagen subida')).toHaveAttribute(
      'src',
      UPLOAD_DATA.thumbnail,
    )
    expect(onChange).toHaveBeenLastCalledWith(UPLOAD_DATA.url)
  })
})
