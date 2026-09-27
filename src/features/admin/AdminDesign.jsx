import { DESIGN_SUBCATEGORIES } from '@/constants/businessRules.js'
import AdminCrudPage from './components/AdminCrudPage.jsx'
import './AdminDesign.scss'

const SUBCATEGORY_OPTIONS = DESIGN_SUBCATEGORIES.map(({ key, label }) => ({
  value: key,
  label,
}))

const subcategoryLabel = (key) =>
  DESIGN_SUBCATEGORIES.find((item) => item.key === key)?.label ?? key

/** Campos del formulario según el schema DesignRequest del openapi. */
const DESIGN_FIELDS = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  {
    name: 'subcategory',
    label: 'Subcategoría',
    type: 'select',
    required: true,
    options: SUBCATEGORY_OPTIONS,
  },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'imageUrl', label: 'Imagen', type: 'image', section: 'diseno' },
  { name: 'isPublished', label: 'Publicado', type: 'checkbox' },
]

const columns = [
  { key: 'title', header: 'Título' },
  {
    key: 'subcategory',
    header: 'Subcategoría',
    render: (row) => subcategoryLabel(row.subcategory),
  },
]

/**
 * CRUD de proyectos de diseño del panel admin: subcategoría obligatoria
 * (enum del contrato), filtro del listado server-side (`?subcategory=` con
 * meta.total filtrado), reorder con SOLO orderedIds y subida de imagen
 * en segundo plano (ImageUploadField).
 */
const AdminDesign = () => (
  <AdminCrudPage
    block="admin-design"
    title="Diseño"
    entityPlural="proyectos"
    resource="design"
    entityLabel="proyecto"
    gender="masculine"
    fields={DESIGN_FIELDS}
    columns={columns}
    toggleFields={['isPublished']}
    emptyMessage="No hay proyectos de diseño."
    filter={{
      id: 'design-subcategory-filter',
      label: 'Filtrar por subcategoría',
      options: SUBCATEGORY_OPTIONS,
      param: 'subcategory',
      emptyMessage: 'No hay proyectos para este filtro.',
    }}
  />
)

export default AdminDesign
