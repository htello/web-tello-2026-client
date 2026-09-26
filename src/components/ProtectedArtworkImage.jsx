import { useState } from 'react'
import { getImageProtectionProps } from '@/utils/getImageProtectionProps.js'
import './ProtectedArtworkImage.scss'

/**
 * Imagen de obra con protección visual básica contra descarga casual:
 * `draggable=false`, bloqueo de `contextmenu` y overlay transparente.
 * Si falla la carga, muestra un fallback visual y oculta la imagen rota
 * (conserva el layout y el `alt` en el árbol de accesibilidad).
 * NOTA: es una barrera de interfaz; NO sustituye controles de derechos de autor.
 *
 * @param {{ src: string, alt: string, className?: string, objectFit?: string, loading?: string, fetchPriority?: string }} props
 */
const ProtectedArtworkImage = ({
  src,
  alt,
  className = '',
  objectFit = 'cover',
  loading = 'lazy',
  fetchPriority,
}) => {
  const [failed, setFailed] = useState(false)

  return (
    <span className={`protected-artwork ${className}`}>
      <img
        className="protected-artwork__image"
        style={{ objectFit, opacity: failed ? 0 : undefined }}
        {...getImageProtectionProps(alt)}
        alt={alt}
        src={src}
        loading={loading}
        fetchPriority={fetchPriority}
        onError={() => setFailed(true)}
      />
      {failed && (
        <span className="protected-artwork__fallback" aria-hidden="true">
          Imagen no disponible
        </span>
      )}
      <span className="protected-artwork__overlay" aria-hidden="true" />
    </span>
  )
}

export default ProtectedArtworkImage
