import './Skeleton.scss'

/**
 * Placeholder de carga progresiva con shimmer.
 *
 * Por defecto anuncia su presencia (`role=status`); con `decorative` queda
 * `aria-hidden` (para agrupaciones donde el contenedor ya anuncia la carga).
 *
 * @param {object} props
 * @param {'text' | 'rectangular' | 'circular'} [props.variant]
 * @param {boolean} [props.decorative] oculta el elemento a lectores de pantalla
 * @param {string} [props.width] ancho CSS (p. ej. '100%', '12rem')
 * @param {string} [props.height] alto CSS
 * @param {string} [props.className] clases adicionales
 */
const Skeleton = ({ variant = 'text', decorative = false, width, height, className = '' }) => {
  const accessibility = decorative
    ? { 'aria-hidden': 'true' }
    : { role: 'status', 'aria-label': 'Cargando…' }

  return (
    <span
      className={`skeleton skeleton--${variant} ${className}`.trim()}
      style={{ width, height }}
      {...accessibility}
    />
  )
}

export default Skeleton
