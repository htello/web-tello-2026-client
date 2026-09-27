import AdminCrudPage from './components/AdminCrudPage.jsx'
import './AdminIllustrations.scss'

/** Campos del formulario según el schema IllustrationRequest del openapi. */
const ILLUSTRATION_FIELDS = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'imageUrl', label: 'Imagen', type: 'image', section: 'ilustracion' },
  { name: 'isPublished', label: 'Publicada', type: 'checkbox' },
]

const columns = [
  { key: 'title', header: 'Título' },
  {
    key: 'description',
    header: 'Descripción',
    render: (row) => row.description || '—',
  },
]

/**
 * CRUD de ilustraciones del panel admin: listar todo (publicado y no),
 * crear/editar (PUT parcial), toggle inline de published, borrado
 * con confirmación y reorder con SOLO orderedIds.
 */
const AdminIllustrations = () => (
  <AdminCrudPage
    block="admin-illustrations"
    title="Ilustraciones"
    resource="illustrations"
    entityLabel="ilustración"
    fields={ILLUSTRATION_FIELDS}
    columns={columns}
    toggleFields={['isPublished']}
    emptyMessage="No hay ilustraciones."
  />
)

export default AdminIllustrations
