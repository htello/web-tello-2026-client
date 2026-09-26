import { useAdminResource } from '@/hooks/useAdminResource.js'
import AdminCrudPage from './components/AdminCrudPage.jsx'
import './AdminPaintings.scss'

const columns = [
  { key: 'title', header: 'Título' },
  { key: 'collection', header: 'Colección', render: (row) => row.collection?.title ?? '—' },
  { key: 'year', header: 'Año' },
]

/**
 * CRUD de pinturas del panel admin: validación cliente de year (1900-2100) y
 * collectionId obligatorios, selector de colección alimentado por
 * GET /admin/collections, filtro por colección, reorder con SOLO orderedIds
 * y subida de imagen en segundo plano (ImageUploadField → POST /admin/upload).
 */
/**
 * Pendiente (server ya soporta ?collectionId= en GET /admin/paintings con meta.total
 * filtrado): pasar el valor del filtro a la query del listado en lugar de
 * filtrar en local la página actual (20 items). Cambiar este `filter` a:
 *   filter={{ id, label, options, param: 'collectionId', emptyMessage }}
 * y en AdminCrudPage incluir `params: { page, limit, ...(isFiltered && filter.param ? { [filter.param]: filterValue } : {}) }`
 * en useAdminCrud + setPage(1) al cambiar el filtro. El filtrado local actual
 * solo ve la página cargada y muestra un número aleatorio de filas por página.
 */
const AdminPaintings = () => {
  const { items: collections } = useAdminResource('collections', { params: { limit: 100 } })
  const collectionOptions = collections.map((collection) => ({
    value: collection.id,
    label: collection.title,
  }))

  const paintingFields = [
    { name: 'title', label: 'Título', type: 'text', required: true },
    {
      name: 'collectionId',
      label: 'Colección',
      type: 'select',
      required: true,
      options: collectionOptions,
    },
    { name: 'year', label: 'Año', type: 'number', required: true, min: 1900, max: 2100 },
    { name: 'dimensions', label: 'Dimensiones', type: 'text' },
    { name: 'technique', label: 'Técnica', type: 'text' },
    { name: 'imageUrl', label: 'Imagen', type: 'image', section: 'pintura' },
    { name: 'isPublished', label: 'Publicada', type: 'checkbox' },
    { name: 'isFeatured', label: 'Destacada', type: 'checkbox' },
  ]

  return (
    <AdminCrudPage
      block="admin-paintings"
      title="Pinturas"
      resource="paintings"
      entityLabel="pintura"
      fields={paintingFields}
      columns={columns}
      toggleFields={['isPublished', 'isFeatured']}
      emptyMessage="No hay pinturas."
      toFormValues={(row) => ({ ...row, collectionId: row.collection?.id })}
      filter={{
        id: 'paintings-collection-filter',
        label: 'Filtrar por colección',
        options: collectionOptions,
        matches: (row, value) => String(row.collection?.id) === value,
        emptyMessage: 'No hay pinturas para este filtro.',
      }}
    />
  )
}

export default AdminPaintings
