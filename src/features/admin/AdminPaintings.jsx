import { useState } from 'react'
import ErrorState from '@/components/ErrorState.jsx'
import { useAdminResource } from '@/hooks/useAdminResource.js'
import { useReorder } from '@/hooks/useReorder.js'
import { getChangedFields, stripEmptyFields } from '@/utils/formPayload.js'
import AdminTable from './components/AdminTable.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import EntityForm from './components/EntityForm.jsx'
import './AdminPaintings.scss'

const columns = [
  { key: 'title', header: 'Título' },
  { key: 'collection', header: 'Colección', render: (row) => row.collection?.title ?? '—' },
  { key: 'year', header: 'Año' },
]

const toggles = [
  { field: 'isPublished', header: 'Publicada', ariaLabel: 'Publicar' },
  { field: 'isFeatured', header: 'Destacada', ariaLabel: 'Destacar' },
]

/**
 * CRUD de pinturas del panel admin: validación cliente de year (1900-2100) y
 * collectionId obligatorios, selector de colección alimentado por
 * GET /admin/collections, filtro por colección, reorder con SOLO orderedIds
 * y subida de imagen en segundo plano (ImageUploadField → POST /admin/upload).
 */
const AdminPaintings = () => {
  const { items: collections } = useAdminResource('collections')
  const { items, loading, error, create, update, remove, saveError } =
    useAdminResource('paintings')
  const { items: ordered, moveUp, moveDown, error: reorderError } = useReorder('paintings', items)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterCollectionId, setFilterCollectionId] = useState('all')

  const paintingFields = [
    { name: 'title', label: 'Título', type: 'text', required: true },
    {
      name: 'collectionId',
      label: 'Colección',
      type: 'select',
      required: true,
      options: collections.map((collection) => ({
        value: collection.id,
        label: collection.title,
      })),
    },
    { name: 'year', label: 'Año', type: 'number', required: true, min: 1900, max: 2100 },
    { name: 'dimensions', label: 'Dimensiones', type: 'text' },
    { name: 'technique', label: 'Técnica', type: 'text' },
    { name: 'imageUrl', label: 'Imagen', type: 'image', section: 'pintura' },
    { name: 'isPublished', label: 'Publicada', type: 'checkbox' },
    { name: 'isFeatured', label: 'Destacada', type: 'checkbox' },
  ]

  const isFiltered = filterCollectionId !== 'all'
  const visible = isFiltered
    ? ordered.filter((row) => String(row.collection?.id) === filterCollectionId)
    : ordered

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setEditing({ ...row, collectionId: row.collection?.id })
    setFormOpen(true)
  }

  const closeForm = () => setFormOpen(false)

  /**
   * @param {Record<string, unknown>} values payload tipado del EntityForm
   * @returns {Promise<{ ok: boolean, data?: unknown, error?: Error }>}
   */
  const handleSubmit = (values) => {
    if (!editing) return create(stripEmptyFields(values))
    const changed = getChangedFields(editing, values)
    if (Object.keys(changed).length === 0) return Promise.resolve({ ok: true, data: editing })
    return update(editing.id, changed)
  }

  const handleDelete = async () => {
    const target = deleteTarget
    setDeleteTarget(null)
    await remove(target.id)
  }

  const handleToggle = (row, field, nextValue) => update(row.id, { [field]: nextValue })

  return (
    <section className="admin-paintings">
      <header className="admin-paintings__header">
        <h1 className="admin-paintings__title">Pinturas</h1>
        <button type="button" className="admin-paintings__new" onClick={openCreate}>
          Nueva pintura
        </button>
      </header>

      {error && <ErrorState message={error.message} />}
      {reorderError && <ErrorState message={reorderError.message} />}
      {saveError && !formOpen && <ErrorState message={saveError.message} />}

      {formOpen && (
        <section className="admin-paintings__form" aria-labelledby="paintings-form-title">
          <h2 id="paintings-form-title" className="admin-paintings__form-title">
            {editing ? 'Editar pintura' : 'Crear pintura'}
          </h2>
          <EntityForm
            key={editing?.id ?? 'new'}
            fields={paintingFields}
            initialValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        </section>
      )}

      <div className="admin-paintings__filter">
        <label className="admin-paintings__filter-label" htmlFor="paintings-collection-filter">
          Filtrar por colección
        </label>
        <select
          id="paintings-collection-filter"
          className="admin-paintings__filter-select"
          value={filterCollectionId}
          onChange={(event) => setFilterCollectionId(event.target.value)}
        >
          <option value="all">Todas</option>
          {collections.map((collection) => (
            <option key={collection.id} value={String(collection.id)}>
              {collection.title}
            </option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={columns}
        rows={visible}
        loading={loading}
        emptyMessage={isFiltered ? 'No hay pinturas para este filtro.' : 'No hay pinturas.'}
        rowLabel={(row) => row.title}
        toggles={toggles}
        onToggle={handleToggle}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        onMoveUp={isFiltered ? undefined : (row, index) => moveUp(index)}
        onMoveDown={isFiltered ? undefined : (row, index) => moveDown(index)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`¿Borrar la pintura «${deleteTarget?.title ?? ''}»?`}
        message="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}

export default AdminPaintings
