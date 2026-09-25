import { useState } from 'react'
import ErrorState from '@/components/ErrorState.jsx'
import { useAdminResource } from '@/hooks/useAdminResource.js'
import { useReorder } from '@/hooks/useReorder.js'
import { getChangedFields, stripEmptyFields } from '@/utils/formPayload.js'
import AdminTable from './components/AdminTable.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import EntityForm from './components/EntityForm.jsx'
import './AdminCollections.scss'

/** Campos del formulario según el schema CollectionRequest del openapi. */
const COLLECTION_FIELDS = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'coverImage', label: 'Imagen de portada (URL)', type: 'text' },
  { name: 'position', label: 'Posición', type: 'number', min: 0 },
  { name: 'isPublished', label: 'Publicada', type: 'checkbox' },
]

const columns = [{ key: 'title', header: 'Título' }]

const toggles = [{ field: 'isPublished', header: 'Publicada', ariaLabel: 'Publicar' }]

/**
 * CRUD de colecciones del panel admin: listar (publicadas y no), crear,
 * editar (PUT parcial), borrar con confirmación y reordenar.
 */
const AdminCollections = () => {
  const { items, loading, error, create, update, remove, saveError } =
    useAdminResource('collections')
  const { items: ordered, moveUp, moveDown, error: reorderError } = useReorder(
    'collections',
    items,
  )
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
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
    // PUT /admin/collections/:id valida con CollectionRequest (openapi):
    // `title` es obligatorio en cada PUT, aunque no haya cambiado.
    return update(editing.id, { title: values.title, ...changed })
  }

  const handleDelete = async () => {
    const target = deleteTarget
    setDeleteTarget(null)
    await remove(target.id)
  }

  // PUT /admin/collections/:id valida con CollectionRequest: `title` es
  // obligatorio en cada envío, también al alternar solo isPublished.
  const handleToggle = (row, field, nextValue) =>
    update(row.id, { title: row.title, [field]: nextValue })

  return (
    <section className="admin-collections">
      <header className="admin-collections__header">
        <h1 className="admin-collections__title">Colecciones</h1>
        <button type="button" className="admin-collections__new" onClick={openCreate}>
          Nueva colección
        </button>
      </header>

      {error && <ErrorState message={error.message} />}
      {reorderError && <ErrorState message={reorderError.message} />}
      {saveError && !formOpen && <ErrorState message={saveError.message} />}

      {formOpen && (
        <section className="admin-collections__form" aria-labelledby="collections-form-title">
          <h2 id="collections-form-title" className="admin-collections__form-title">
            {editing ? 'Editar colección' : 'Crear colección'}
          </h2>
          <EntityForm
            key={editing?.id ?? 'new'}
            fields={COLLECTION_FIELDS}
            initialValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        </section>
      )}

      <AdminTable
        columns={columns}
        rows={ordered}
        loading={loading}
        emptyMessage="No hay colecciones."
        rowLabel={(row) => row.title}
        toggles={toggles}
        onToggle={handleToggle}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        onMoveUp={(row, index) => moveUp(index)}
        onMoveDown={(row, index) => moveDown(index)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`¿Borrar la colección «${deleteTarget?.title ?? ''}»?`}
        message="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}

export default AdminCollections
