import './SectionHeader.scss'

/**
 * Encabezado de sección pública: h1 con título, descripción opcional debajo
 * y acción opcional a la derecha (p. ej. el enlace a exposiciones en Pintura).
 *
 * @param {{ title: string, description?: string, action?: import('react').ReactNode }} props
 */
const SectionHeader = ({ title, description, action }) => (
  <header className="section-header">
    <div className="section-header__text">
      <h1 className="section-header__title">{title}</h1>
      {description && <p className="section-header__description">{description}</p>}
    </div>
    {action}
  </header>
)

export default SectionHeader
