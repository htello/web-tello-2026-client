import AdminCrudPage from './components/AdminCrudPage.jsx'
import './AdminExhibitions.scss'

/** Campos del formulario según el schema ExhibitionRequest del openapi. */
const EXHIBITION_FIELDS = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'date', label: 'Fecha', type: 'date', required: true },
  { name: 'endDate', label: 'Fecha de fin', type: 'date' },
  { name: 'location', label: 'Localización', type: 'text' },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'images', label: 'Imágenes', type: 'images', section: 'general' },
  { name: 'position', label: 'Posición', type: 'number', min: 0 },
  { name: 'isPublished', label: 'Publicada', type: 'checkbox' },
]

const columns = [
  { key: 'title', header: 'Título' },
  { key: 'date', header: 'Fecha' },
  { key: 'location', header: 'Localización', render: (row) => row.location ?? '—' },
]

/**
 * CRUD de exhibiciones del panel admin: listar, crear, editar (PUT parcial),
 * borrar con confirmación, reordenar y gestionar imágenes múltiples
 * (el orden de la lista define position; el PUT la reemplaza completa).
 */
const AdminExhibitions = () => (
  <AdminCrudPage
    block="admin-exhibitions"
    title="Exhibiciones"
    resource="exhibitions"
    entityLabel="exhibición"
    fields={EXHIBITION_FIELDS}
    columns={columns}
    toggleFields={['isPublished']}
    emptyMessage="No hay exhibiciones."
  />
)

export default AdminExhibitions
