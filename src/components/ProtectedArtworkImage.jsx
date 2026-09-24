import { getImageProtectionProps } from '@/utils/getImageProtectionProps.js'
import './ProtectedArtworkImage.scss'

/**
 * Imagen de obra con protección visual básica contra descarga casual:
 * `draggable=false`, bloqueo de `contextmenu` y overlay transparente.
 * NOTA: es una barrera de interfaz; NO sustituye controles de derechos de autor.
 *
 * @param {{ src: string, alt: string, className?: string, objectFit?: string, loading?: string }} props
 */
const ProtectedArtworkImage = ({ src, alt, className = '', objectFit = 'cover', loading = 'lazy' }) => (
  <span className={`protected-artwork ${className}`}>
    <img
      className="protected-artwork__image"
      style={{ objectFit }}
      {...getImageProtectionProps(alt)}
      src={src}
      loading={loading}
    />
    <span className="protected-artwork__overlay" aria-hidden="true" />
  </span>
)

export default ProtectedArtworkImage
