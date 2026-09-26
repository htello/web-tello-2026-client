import './SectionHeader.scss'

/**
 * Encabezado de sección pública: h1 con título y acción opcional a la derecha
 * (p. ej. el enlace a exposiciones en Pintura).
 *
 * @param {{ title: string, action?: import('react').ReactNode }} props
 */
const SectionHeader = ({ title, action }) => (
  <header className="section-header">
    <h1 className="section-header__title">{title}</h1>
    {action}
  </header>
)

export default SectionHeader
