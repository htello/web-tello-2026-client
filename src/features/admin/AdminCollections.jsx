import AdminCrudPage from './components/AdminCrudPage.jsx'
import './AdminCollections.scss'

/** Campos del formulario según el schema CollectionRequest del openapi. */
const COLLECTION_FIELDS = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'coverImage', label: 'Imagen de portada', type: 'image', section: 'pintura' },
  { name: 'position', label: 'Posición', type: 'number', min: 0 },
  { name: 'isPublished', label: 'Publicada', type: 'checkbox' },
]

const columns = [{ key: 'title', header: 'Título' }]

/**
 * CRUD de colecciones del panel admin: listar (publicadas y no), crear,
 * editar (PUT parcial), borrar con confirmación y reordenar.
 * PUT /admin/collections/:id valida con CollectionRequest (openapi): `title`
 * es obligatorio en cada envío, también al alternar solo isPublished
 * (requiredUpdateFields).
 */
const AdminCollections = () => (
  <AdminCrudPage
    block="admin-collections"
    title="Colecciones"
    resource="collections"
    entityLabel="colección"
    fields={COLLECTION_FIELDS}
    columns={columns}
    toggleFields={['isPublished']}
    emptyMessage="No hay colecciones."
    requiredUpdateFields={['title']}
  />
)

export default AdminCollections
