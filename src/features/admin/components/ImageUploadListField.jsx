import { useState } from 'react'
import { adminApi } from '@/services/adminApi.js'
import { ACCEPT_ATTR, validateImageFile } from './imageUpload.js'
import './ImageUploadListField.scss'

/**
 * Normaliza una imagen (del server o de una subida) al formato
 * ExhibitionImageInput del contrato: { url, thumbnail, width, height }.
 * @param {{ url: string, thumbnail?: string | null, width?: number | null, height?: number | null }} image
 * @returns {{ url: string, thumbnail: string | null, width: number | null, height: number | null }}
 */
const toInput = ({ url, thumbnail, width, height }) => ({
  url,
  thumbnail: thumbnail ?? null,
  width: width ?? null,
  height: height ?? null,
})

/**
 * Campo de imágenes múltiples para exhibiciones: añadir (selección múltiple
 * con subida secuencial en segundo plano), quitar y reordenar. Expone la lista
 * completa vía onChange porque el PUT del contrato reemplaza todas las
 * imágenes (el orden define position).
 *
 * @param {object} props
 * @param {string} props.id id base del campo
 * @param {string} props.label etiqueta del grupo
 * @param {Array<object>} [props.value] imágenes existentes (admiten id/position del server)
 * @param {string} [props.section] pintura | ilustracion | diseno | general
 * @param {(images: Array<{ url: string, thumbnail: string | null, width: number | null, height: number | null }>) => void} props.onChange
 */
const ImageUploadListField = ({ id, label, value = [], section = 'general', onChange }) => {
  const [images, setImages] = useState(() => value.map(toInput))
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const inputId = `${id}-add`
  const errorId = `${id}-error`

  const emit = (next) => {
    setImages(next)
    onChange(next.map(toInput))
  }

  const handleSelect = async (event) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0 || isUploading) return

    const accepted = []
    const messages = []
    for (const file of files) {
      const validation = validateImageFile(file)
      if (validation) messages.push(`${file.name}: ${validation}`)
      else accepted.push(file)
    }
    setError(messages.join(' · '))
    if (accepted.length === 0) return

    setIsUploading(true)
    try {
      let next = [...images]
      for (const file of accepted) {
        try {
          const { data } = await adminApi.upload(file, section)
          next = [...next, toInput(data)]
          emit(next)
        } catch (uploadError) {
          messages.push(uploadError.message)
          setError(messages.join(' · '))
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = (index) => emit(images.filter((_, i) => i !== index))

  const handleMove = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    emit(next)
  }

  return (
    <div className="image-upload-list">
      <span className="image-upload-list__label" id={`${id}-label`}>
        {label}
      </span>

      {images.length === 0 && <p className="image-upload-list__empty">Sin imágenes.</p>}

      <ul className="image-upload-list__items" aria-labelledby={`${id}-label`}>
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`} className="image-upload-list__item">
            <img
              className="image-upload-list__thumb"
              src={image.thumbnail ?? image.url}
              alt={`Imagen ${index + 1}`}
            />
            <div className="image-upload-list__actions">
              {index > 0 && (
                <button type="button" onClick={() => handleMove(index, -1)}>
                  Subir imagen {index + 1}
                </button>
              )}
              {index < images.length - 1 && (
                <button type="button" onClick={() => handleMove(index, 1)}>
                  Bajar imagen {index + 1}
                </button>
              )}
              <button type="button" onClick={() => handleRemove(index)}>
                Quitar imagen {index + 1}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <label className="image-upload-list__add-label" htmlFor={inputId}>
        Añadir imagen
      </label>
      <input
        className="image-upload-list__input"
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        onChange={handleSelect}
        disabled={isUploading}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
      />

      {isUploading && (
        <p className="image-upload-list__status" role="status">
          Subiendo imagen…
        </p>
      )}
      {error && (
        <p className="image-upload-list__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default ImageUploadListField
