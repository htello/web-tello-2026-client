import { useState } from 'react'
import ErrorState from '@/components/ErrorState.jsx'
import { DESIGN_SUBCATEGORIES } from '@/constants/businessRules.js'
import { useAdminResource } from '@/hooks/useAdminResource.js'
import { useReorder } from '@/hooks/useReorder.js'
import { getChangedFields, stripEmptyFields } from '@/utils/formPayload.js'
import AdminTable from './components/AdminTable.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import EntityForm from './components/EntityForm.jsx'
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
  // Campo de imagen como URL de texto; ImageUploadField llega en la fase 13.
  { name: 'imageUrl', label: 'Imagen (URL)', type: 'text' },
  { name: 'isPublished', label: 'Publicado', type: 'checkbox' },
  { name: 'isFeatured', label: 'Destacado', type: 'checkbox' },
]

const columns = [
  { key: 'title', header: 'Título' },
  {
    key: 'subcategory',
    header: 'Subcategoría',
    render: (row) => subcategoryLabel(row.subcategory),
  },
]

const toggles = [
  { field: 'isPublished', header: 'Publicado', ariaLabel: 'Publicar' },
  { field: 'isFeatured', header: 'Destacado', ariaLabel: 'Destacar' },
]

/**
 * CRUD de proyectos de diseño del panel admin: subcategoría obligatoria
 * (enum del contrato), filtro del listado por subcategoría, reorder con SOLO
 * orderedIds y campo de imagen como URL de texto (ImageUploadField, fase 13).
 */
const AdminDesign = () => {
  const { items, loading, error, create, update, remove, saveError } = useAdminResource('design')
  const { items: ordered, moveUp, moveDown, error: reorderError } = useReorder('design', items)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterSubcategory, setFilterSubcategory] = useState('all')

  const isFiltered = filterSubcategory !== 'all'
  const visible = isFiltered
    ? ordered.filter((row) => row.subcategory === filterSubcategory)
    : ordered

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
    <section className="admin-design">
      <header className="admin-design__header">
        <h1 className="admin-design__title">Diseño</h1>
        <button type="button" className="admin-design__new" onClick={openCreate}>
          Nuevo proyecto
        </button>
      </header>

      {error && <ErrorState message={error.message} />}
      {reorderError && <ErrorState message={reorderError.message} />}
      {saveError && !formOpen && <ErrorState message={saveError.message} />}

      {formOpen && (
        <section className="admin-design__form" aria-labelledby="design-form-title">
          <h2 id="design-form-title" className="admin-design__form-title">
            {editing ? 'Editar proyecto' : 'Crear proyecto'}
          </h2>
          <EntityForm
            key={editing?.id ?? 'new'}
            fields={DESIGN_FIELDS}
            initialValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        </section>
      )}

      <div className="admin-design__filter">
        <label className="admin-design__filter-label" htmlFor="design-subcategory-filter">
          Filtrar por subcategoría
        </label>
        <select
          id="design-subcategory-filter"
          className="admin-design__filter-select"
          value={filterSubcategory}
          onChange={(event) => setFilterSubcategory(event.target.value)}
        >
          <option value="all">Todas</option>
          {SUBCATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={columns}
        rows={visible}
        loading={loading}
        emptyMessage={isFiltered ? 'No hay proyectos para este filtro.' : 'No hay proyectos de diseño.'}
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
        title={`¿Borrar el proyecto «${deleteTarget?.title ?? ''}»?`}
        message="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}

export default AdminDesign
