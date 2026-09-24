import { useState } from 'react'
import ErrorState from '@/components/ErrorState.jsx'
import { useAdminResource } from '@/hooks/useAdminResource.js'
import { useReorder } from '@/hooks/useReorder.js'
import { getChangedFields, stripEmptyFields } from '@/utils/formPayload.js'
import AdminTable from './components/AdminTable.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import EntityForm from './components/EntityForm.jsx'
import './AdminExhibitions.scss'

/** Campos del formulario según el schema ExhibitionRequest del openapi. */
const EXHIBITION_FIELDS = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'date', label: 'Fecha', type: 'date', required: true },
  { name: 'location', label: 'Localización', type: 'text' },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'position', label: 'Posición', type: 'number', min: 0 },
  { name: 'isPublished', label: 'Publicada', type: 'checkbox' },
]

const columns = [
  { key: 'title', header: 'Título' },
  { key: 'date', header: 'Fecha' },
  { key: 'location', header: 'Localización', render: (row) => row.location ?? '—' },
  {
    key: 'status',
    header: 'Estado',
    render: (row) => (row.isPublished ? 'Publicada' : 'Borrador'),
  },
]

/**
 * CRUD de exhibiciones del panel admin: listar, crear, editar (PUT parcial),
 * borrar con confirmación y reordenar.
 */
const AdminExhibitions = () => {
  const { items, loading, error, create, update, remove, saveError } =
    useAdminResource('exhibitions')
  const { items: ordered, moveUp, moveDown, error: reorderError } = useReorder(
    'exhibitions',
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

  return (
    <section className="admin-exhibitions">
      <header className="admin-exhibitions__header">
        <h1 className="admin-exhibitions__title">Exhibiciones</h1>
        <button type="button" className="admin-exhibitions__new" onClick={openCreate}>
          Nueva exhibición
        </button>
      </header>

      {error && <ErrorState message={error.message} />}
      {reorderError && <ErrorState message={reorderError.message} />}
      {saveError && !formOpen && <ErrorState message={saveError.message} />}

      {formOpen && (
        <section className="admin-exhibitions__form" aria-labelledby="exhibitions-form-title">
          <h2 id="exhibitions-form-title" className="admin-exhibitions__form-title">
            {editing ? 'Editar exhibición' : 'Crear exhibición'}
          </h2>
          <EntityForm
            key={editing?.id ?? 'new'}
            fields={EXHIBITION_FIELDS}
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
        emptyMessage="No hay exhibiciones."
        rowLabel={(row) => row.title}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
        onMoveUp={(row, index) => moveUp(index)}
        onMoveDown={(row, index) => moveDown(index)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`¿Borrar la exhibición «${deleteTarget?.title ?? ''}»?`}
        message="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}

export default AdminExhibitions
