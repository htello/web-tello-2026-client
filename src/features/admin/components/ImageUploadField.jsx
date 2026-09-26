import { useState } from 'react'
import { adminApi } from '@/services/adminApi.js'
import { ACCEPT_ATTR, validateImageFile } from './imageUpload.js'
import './ImageUploadField.scss'

/**
 * Campo de subida de imagen única (paso transparente del contrato en 2 pasos):
 * elegir archivo → POST /admin/upload en segundo plano → miniatura, y expone
 * la url obtenida al formulario padre vía onChange para el JSON del create/update.
 *
 * @param {object} props
 * @param {string} props.id id del input (asociado al label)
 * @param {string} props.label etiqueta accesible
 * @param {string} [props.value] url de la imagen existente (modo edición)
 * @param {string} [props.section] pintura | ilustracion | diseno | general
 * @param {(url: string) => void} props.onChange notifica la url ('' al quitarla)
 */
const ImageUploadField = ({ id, label, value = '', section = 'general', onChange }) => {
  const [current, setCurrent] = useState(() => (value ? { url: value } : null))
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const errorId = `${id}-error`

  const handleSelect = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || isUploading) return

    const validation = validateImageFile(file)
    if (validation) {
      setError(validation)
      return
    }

    setIsUploading(true)
    setError('')
    try {
      const { data } = await adminApi.upload(file, section)
      setCurrent({
        url: data.url,
        thumbnail: data.thumbnail,
        width: data.width,
        height: data.height,
        name: file.name,
      })
      onChange(data.url)
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setCurrent(null)
    setError('')
    onChange('')
  }

  return (
    <div className="image-upload-field">
      <label className="image-upload-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        className="image-upload-field__input"
        id={id}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={handleSelect}
        disabled={isUploading}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
      />

      {isUploading && (
        <p className="image-upload-field__status" role="status">
          Subiendo imagen…
        </p>
      )}

      {error && (
        <p className="image-upload-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}

      {current && (
        <figure className="image-upload-field__preview">
          <img
            className="image-upload-field__thumb"
            src={current.thumbnail ?? current.url}
            alt={current.thumbnail ? `${label} subida` : `${label} actual`}
          />
          {current.name && (
            <figcaption className="image-upload-field__meta">
              {current.name} · {current.width} × {current.height} px
            </figcaption>
          )}
          <button type="button" className="image-upload-field__remove" onClick={handleRemove}>
            Quitar imagen
          </button>
        </figure>
      )}
    </div>
  )
}

export default ImageUploadField
