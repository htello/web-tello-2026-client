import { useState } from 'react'
import { getChangedFields, stripEmptyFields } from '@/utils/formPayload.js'
import { useAdminResource } from './useAdminResource.js'
import { useReorder } from './useReorder.js'

/**
 * Estado y manejadores compartidos por las secciones CRUD del panel admin.
 *
 * Combina `useAdminResource` (listado + mutaciones) y `useReorder` (reorden
 * optimista) con el estado de formulario y diálogo de borrado común a todas
 * las vistas:
 *
 * - `formOpen`/`editing`/`deleteTarget` y sus aperturas/cierres.
 * - `handleSubmit`: create (POST omitiendo vacíos) o update (PUT parcial con
 *   solo los campos cambiados; sin cambios no llama a la API).
 * - `handleDelete`: borra la fila en confirmación y cierra el diálogo.
 * - `handleToggle`: alterna un campo booleano inline en la tabla.
 *
 * @param {string} resource uno de ADMIN_RESOURCES (p. ej. 'collections')
 * @param {object} [options]
 * @param {Record<string, string | number>} [options.params] query del listado
 *   paginado y filtrable (`{ page, limit }` según el contrato de los GET admin,
 *   más filtros como `collectionId` o `subcategory`).
 * @param {string[]} [options.requiredUpdateFields] campos que el contrato
 *   exige en CADA PUT aunque no cambien (p. ej. `title` en colecciones, ver
 *   CollectionRequest en openapi). En `handleSubmit` se toman de los valores
 *   del formulario y en `handleToggle` de la fila.
 * @param {(row: object) => object} [options.toFormValues] transforma la fila
 *   del server en los valores iniciales del formulario (p. ej. paintings
 *   extrae `collectionId` de `collection`).
 * @returns {{
 *   loading: boolean,
 *   error: Error | null,
 *   saveError: Error | null,
 *   items: object[],
 *   meta: { total: number, page: number, limit: number, pages: number } | null,
 *   moveUp: (index: number) => void,
 *   moveDown: (index: number) => void,
 *   reorderError: Error | null,
 *   formOpen: boolean,
 *   editing: object | null,
 *   deleteTarget: object | null,
 *   openCreate: () => void,
 *   openEdit: (row: object) => void,
 *   closeForm: () => void,
 *   requestDelete: (row: object) => void,
 *   cancelDelete: () => void,
 *   handleSubmit: (values: Record<string, unknown>) => Promise<{ ok: boolean, data?: unknown, error?: Error }>,
 *   handleDelete: () => Promise<{ ok: boolean, data?: unknown, error?: Error }>,
 *   handleToggle: (row: object, field: string, nextValue: boolean) => Promise<{ ok: boolean, data?: unknown, error?: Error }>,
 * }}
 */
export function useAdminCrud(resource, { params, requiredUpdateFields = [], toFormValues } = {}) {
  const { items, meta, loading, error, create, update, remove, saveError } =
    useAdminResource(resource, { params })
  const { items: ordered, moveUp, moveDown, error: reorderError } = useReorder(resource, items)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (row) => {
    setEditing(toFormValues ? toFormValues(row) : row)
    setFormOpen(true)
  }

  const closeForm = () => setFormOpen(false)

  const requestDelete = (row) => setDeleteTarget(row)

  const cancelDelete = () => setDeleteTarget(null)

  /**
   * Campos que el contrato exige en cada PUT, tomados de `source`.
   * @param {Record<string, unknown>} source
   * @returns {Record<string, unknown>}
   */
  const pickRequired = (source) =>
    Object.fromEntries(requiredUpdateFields.map((name) => [name, source[name]]))

  /**
   * @param {Record<string, unknown>} values payload tipado del EntityForm
   * @returns {Promise<{ ok: boolean, data?: unknown, error?: Error }>}
   */
  const handleSubmit = (values) => {
    if (!editing) return create(stripEmptyFields(values))
    const changed = getChangedFields(editing, values)
    if (Object.keys(changed).length === 0) return Promise.resolve({ ok: true, data: editing })
    return update(editing.id, { ...pickRequired(values), ...changed })
  }

  const handleDelete = async () => {
    const target = deleteTarget
    setDeleteTarget(null)
    return remove(target.id)
  }

  const handleToggle = (row, field, nextValue) =>
    update(row.id, { ...pickRequired(row), [field]: nextValue })

  return {
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
  }
}
