import { useState } from 'react'
import ErrorState from '@/components/ErrorState.jsx'
import { useAdminCrud } from '@/hooks/useAdminCrud.js'
import AdminTable from './AdminTable.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import EntityForm from './EntityForm.jsx'

/** Etiquetas de los toggles de tabla por campo y género gramatical. */
const TOGGLE_LABELS = {
  isPublished: { feminine: 'Publicada', masculine: 'Publicado', ariaLabel: 'Publicar' },
  isFeatured: { feminine: 'Destacada', masculine: 'Destacado', ariaLabel: 'Destacar' },
}

const ARTICLES = { feminine: 'la', masculine: 'el' }
const NEW_LABELS = { feminine: 'Nueva', masculine: 'Nuevo' }

/**
 * Sección CRUD declarativa del panel admin: header con botón de alta, errores,
 * formulario EntityForm (crear/editar), filtro opcional del listado, tabla
 * AdminTable con toggles/reorder y ConfirmDialog de borrado.
 *
 * El DOM generado replica el de las vistas originales (clases BEM del `block`,
 * textos y aria), de modo que los tests unitarios y el E2E existentes pasan
 * sin cambios.
 *
 * @param {object} props
 * @param {string} props.block bloque BEM raíz (p. ej. 'admin-collections')
 * @param {string} props.title título de la sección (h1)
 * @param {string} props.resource recurso de adminApi (p. ej. 'collections')
 * @param {string} props.entityLabel sustantivo de la entidad ('colección')
 * @param {'feminine' | 'masculine'} [props.gender] género de `entityLabel`
 * @param {Array<object>} props.fields campos del EntityForm
 * @param {Array<object>} props.columns columnas del AdminTable
 * @param {Array<'isPublished' | 'isFeatured'>} [props.toggleFields]
 * @param {string} props.emptyMessage mensaje de listado vacío
 * @param {{
 *   id: string,
 *   label: string,
 *   options: Array<{ value: unknown, label: string }>,
 *   matches: (row: object, value: string) => boolean,
 *   emptyMessage: string,
 * }} [props.filter] filtro opcional del listado (deshabilita el reorder)
 * @param {(row: object) => string} [props.rowLabel]
 * @param {string[]} [props.requiredUpdateFields] ver useAdminCrud
 * @param {(row: object) => object} [props.toFormValues] ver useAdminCrud
 */
const AdminCrudPage = ({
  block,
  title,
  resource,
  entityLabel,
  gender = 'feminine',
  fields,
  columns,
  toggleFields = [],
  emptyMessage,
  filter,
  rowLabel = (row) => row.title,
  requiredUpdateFields,
  toFormValues,
}) => {
  const {
    loading,
    error,
    saveError,
    ordered,
    moveUp,
    moveDown,
    reorderError,
    formOpen,
    editing,
    deleteTarget,
    openCreate,
    openEdit,
    closeForm,
    requestDelete,
    cancelDelete,
    handleSubmit,
    handleDelete,
    handleToggle,
  } = useAdminCrud(resource, { requiredUpdateFields, toFormValues })

  const [filterValue, setFilterValue] = useState('all')
  const isFiltered = Boolean(filter) && filterValue !== 'all'
  const visible = isFiltered ? ordered.filter((row) => filter.matches(row, filterValue)) : ordered

  const toggles = toggleFields.map((field) => ({
    field,
    header: TOGGLE_LABELS[field][gender],
    ariaLabel: TOGGLE_LABELS[field].ariaLabel,
  }))

  return (
    <section className={block}>
      <header className={`${block}__header`}>
        <h1 className={`${block}__title`}>{title}</h1>
        <button type="button" className={`${block}__new`} onClick={openCreate}>
          {`${NEW_LABELS[gender]} ${entityLabel}`}
        </button>
      </header>

      {error && <ErrorState message={error.message} />}
      {reorderError && <ErrorState message={reorderError.message} />}
      {saveError && !formOpen && <ErrorState message={saveError.message} />}

      {formOpen && (
        <section className={`${block}__form`} aria-labelledby={`${resource}-form-title`}>
          <h2 id={`${resource}-form-title`} className={`${block}__form-title`}>
            {`${editing ? 'Editar' : 'Crear'} ${entityLabel}`}
          </h2>
          <EntityForm
            key={editing?.id ?? 'new'}
            fields={fields}
            initialValues={editing ?? undefined}
            onSubmit={handleSubmit}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        </section>
      )}

      {filter && (
        <div className={`${block}__filter`}>
          <label className={`${block}__filter-label`} htmlFor={filter.id}>
            {filter.label}
          </label>
          <select
            id={filter.id}
            className={`${block}__filter-select`}
            value={filterValue}
            onChange={(event) => setFilterValue(event.target.value)}
          >
            <option value="all">Todas</option>
            {filter.options.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <AdminTable
        columns={columns}
        rows={visible}
        loading={loading}
        emptyMessage={isFiltered ? filter.emptyMessage : emptyMessage}
        rowLabel={rowLabel}
        toggles={toggles}
        onToggle={handleToggle}
        onEdit={openEdit}
        onDelete={requestDelete}
        onMoveUp={isFiltered ? undefined : (row, index) => moveUp(index)}
        onMoveDown={isFiltered ? undefined : (row, index) => moveDown(index)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`¿Borrar ${ARTICLES[gender]} ${entityLabel} «${deleteTarget?.title ?? ''}»?`}
        message="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        danger
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />
    </section>
  )
}

export default AdminCrudPage
