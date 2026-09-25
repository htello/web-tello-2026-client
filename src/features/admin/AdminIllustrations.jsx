import { useState } from 'react'
import ErrorState from '@/components/ErrorState.jsx'
import { useAdminResource } from '@/hooks/useAdminResource.js'
import { useReorder } from '@/hooks/useReorder.js'
import { getChangedFields, stripEmptyFields } from '@/utils/formPayload.js'
import AdminTable from './components/AdminTable.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import EntityForm from './components/EntityForm.jsx'
import './AdminIllustrations.scss'

/** Campos del formulario según el schema IllustrationRequest del openapi. */
const ILLUSTRATION_FIELDS = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  // Campo de imagen como URL de texto; ImageUploadField llega en la fase 13.
  { name: 'imageUrl', label: 'Imagen (URL)', type: 'text' },
  { name: 'isPublished', label: 'Publicada', type: 'checkbox' },
  { name: 'isFeatured', label: 'Destacada', type: 'checkbox' },
]

const columns = [
  { key: 'title', header: 'Título' },
  {
    key: 'description',
    header: 'Descripción',
    render: (row) => row.description || '—',
  },
]

const toggles = [
  { field: 'isPublished', header: 'Publicada', ariaLabel: 'Publicar' },
  { field: 'isFeatured', header: 'Destacada', ariaLabel: 'Destacar' },
]

/**
 * CRUD de ilustraciones del panel admin: listar todo (publicado y no),
 * crear/editar (PUT parcial), toggles inline de published/featured, borrado
 * con confirmación y reorder con SOLO orderedIds.
 */
const AdminIllustrations = () => {
  const { items, loading, error, create, update, remove, saveError } =
    useAdminResource('illustrations')
  const { items: ordered, moveUp, moveDown, error: reorderError } = useReorder(
    'illustrations',
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
    return update(editing.id, changed)
  }

  const handleDelete = async () => {
    const target = deleteTarget
    setDeleteTarget(null)
    await remove(target.id)
  }

  const handleToggle = (row, field, nextValue) => update(row.id, { [field]: nextValue })

  return (
    <section className="admin-illustrations">
      <header className="admin-illustrations__header">
        <h1 className="admin-illustrations__title">Ilustraciones</h1>
        <button type="button" className="admin-illustrations__new" onClick={openCreate}>
          Nueva ilustración
        </button>
      </header>

      {error && <ErrorState message={error.message} />}
      {reorderError && <ErrorState message={reorderError.message} />}
      {saveError && !formOpen && <ErrorState message={saveError.message} />}

      {formOpen && (
        <section
          className="admin-illustrations__form"
          aria-labelledby="illustrations-form-title"
        >
          <h2 id="illustrations-form-title" className="admin-illustrations__form-title">
            {editing ? 'Editar ilustración' : 'Crear ilustración'}
          </h2>
          <EntityForm
            key={editing?.id ?? 'new'}
            fields={ILLUSTRATION_FIELDS}
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
        emptyMessage="No hay ilustraciones."
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
        title={`¿Borrar la ilustración «${deleteTarget?.title ?? ''}»?`}
        message="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}

export default AdminIllustrations
