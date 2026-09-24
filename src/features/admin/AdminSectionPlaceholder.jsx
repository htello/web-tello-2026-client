import './AdminSection.scss'

/**
 * Placeholder de las secciones CRUD que se implementan en las fases 11-14.
 * @param {{ title: string }} props
 */
const AdminSectionPlaceholder = ({ title }) => (
  <section className="admin-section">
    <h1 className="admin-section__title">{title}</h1>
    <p className="admin-section__note">Sección en construcción (próximas fases del panel).</p>
  </section>
)

export default AdminSectionPlaceholder
