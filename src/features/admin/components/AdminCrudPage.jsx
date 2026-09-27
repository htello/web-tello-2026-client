import { useState } from 'react'
import ErrorState from '@/components/ErrorState.jsx'
import Pagination from '@/components/Pagination.jsx'
import Toast from '@/components/Toast.jsx'
import { useAdminCrud } from '@/hooks/useAdminCrud.js'
import AdminTable from './AdminTable.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import EntityForm from './EntityForm.jsx'

/** Entidades por página de los listados admin (el server admite hasta 100). */
const PAGE_LIMIT = 20

/** Etiquetas de los toggles de tabla por campo y género gramatical. */
const TOGGLE_LABELS = {
  isPublished: { feminine: 'Publicada', masculine: 'Publicado', ariaLabel: 'Publicar' },
  isFeatured: { feminine: 'Destacada', masculine: 'Destacado', ariaLabel: 'Destacar' },
}

const ARTICLES = { feminine: 'la', masculine: 'el' }
const NEW_LABELS = { feminine: 'Nueva', masculine: 'Nuevo' }

/** Participios de los mensajes de éxito según el género gramatical. */
const PARTICIPLES = {
  feminine: { created: 'creada', updated: 'actualizada', deleted: 'borrada' },
  masculine: { created: 'creado', updated: 'actualizado', deleted: 'borrado' },
}

/**
 * @param {string} text
 * @returns {string} texto con la primera letra en mayúscula
 */
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

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
 * @param {string} [props.entityPlural] plural de la entidad para el resumen de
 *   la paginación ('colecciones'); por defecto, el título en minúsculas.
 * @param {'feminine' | 'masculine'} [props.gender] género de `entityLabel`
 * @param {Array<object>} props.fields campos del EntityForm
 * @param {Array<object>} props.columns columnas del AdminTable
 * @param {Array<'isPublished' | 'isFeatured'>} [props.toggleFields]
 * @param {string} props.emptyMessage mensaje de listado vacío
 * @param {{
 *   id: string,
 *   label: string,
 *   options: Array<{ value: unknown, label: string }>,
 *   param: string,
 *   emptyMessage: string,
 * }} [props.filter] filtro server-side opcional: el `value` del select se envía
 *   como query param (`?collectionId=`, `?subcategory=`) al GET del listado.
 *   El reorder SOLO está disponible con el filtro activo: pinturas y diseño se
 *   ordenan DENTRO de su colección/subcategoría (no globalmente), así que los
 *   `orderedIds` que se envían son siempre los del subconjunto visible filtrado.
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
  entityPlural = title.toLowerCase(),
  fields,
  columns,
  toggleFields = [],
  emptyMessage,
  filter,
  rowLabel = (row) => row.title,
  requiredUpdateFields,
  toFormValues,
}) => {
  const [page, setPage] = useState(1)
  const [filterValue, setFilterValue] = useState('all')
  const isFiltered = Boolean(filter) && filterValue !== 'all'
  const params = isFiltered
    ? { page, limit: PAGE_LIMIT, [filter.param]: filterValue }
    : { page, limit: PAGE_LIMIT }

  const {
    loading,
    error,
    saveError,
    ordered,
    meta,
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
  } = useAdminCrud(resource, {
    params,
    requiredUpdateFields,
    toFormValues,
  })

  const canReorder = !filter || isFiltered
  const [toastMessage, setToastMessage] = useState(null)

  /**
   * @param {Record<string, unknown>} values
   * @returns {Promise<{ ok: boolean, data?: unknown, error?: Error }>}
   */
  const handleSubmitWithToast = async (values) => {
    const wasEditing = Boolean(editing)
    const result = await handleSubmit(values)
    if (result.ok) {
      setToastMessage(
        `${capitalize(entityLabel)} ${wasEditing ? PARTICIPLES[gender].updated : PARTICIPLES[gender].created}`,
      )
    }
    return result
  }

  /**
   * @returns {Promise<{ ok: boolean, data?: unknown, error?: Error }>}
   */
  const handleDeleteWithToast = async () => {
    const result = await handleDelete()
    if (result.ok) {
      setToastMessage(`${capitalize(entityLabel)} ${PARTICIPLES[gender].deleted}`)
    }
    return result
  }

  /**
   * @param {object} row
   * @param {string} field
   * @param {boolean} nextValue
   * @returns {Promise<{ ok: boolean, data?: unknown, error?: Error }>}
   */
  const handleToggleWithToast = async (row, field, nextValue) => {
    const result = await handleToggle(row, field, nextValue)
    if (result.ok) {
      setToastMessage(`«${rowLabel(row)}» ${PARTICIPLES[gender].updated}`)
    }
    return result
  }

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
            onSubmit={handleSubmitWithToast}
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
            onChange={(event) => {
              setFilterValue(event.target.value)
              setPage(1)
            }}
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
        rows={ordered}
        loading={loading}
        emptyMessage={isFiltered ? filter.emptyMessage : emptyMessage}
        rowLabel={rowLabel}
        toggles={toggles}
        onToggle={handleToggleWithToast}
        onEdit={openEdit}
        onDelete={requestDelete}
        onMoveUp={canReorder ? (row, index) => moveUp(index) : undefined}
        onMoveDown={canReorder ? (row, index) => moveDown(index) : undefined}
      />

      {meta && (
        <Pagination
          meta={meta}
          label={`Paginación de ${entityPlural}`}
          noun={entityPlural}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`¿Borrar ${ARTICLES[gender]} ${entityLabel} «${deleteTarget?.title ?? ''}»?`}
        message="Esta acción no se puede deshacer."
        confirmLabel="Borrar"
        danger
        onConfirm={handleDeleteWithToast}
        onCancel={cancelDelete}
      />

      {toastMessage && (
        <Toast variant="success" message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </section>
  )
}

export default AdminCrudPage
