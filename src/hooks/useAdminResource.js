import { useCallback, useState } from 'react'
import { adminApi } from '@/services/adminApi.js'
import { useAsyncData } from './useAsyncData.js'

/** Lista vacía estable para evitar nuevas identidades en cada render. */
const EMPTY_ITEMS = []

/**
 * Resultado de una mutación (create/update/remove).
 * Nunca lanza: el error se devuelve en el objeto y se expone en `saveError`.
 * @typedef {{ ok: true, data: unknown } | { ok: false, error: Error }} MutationResult
 */

/**
 * Hook de gestión CRUD de un recurso admin.
 *
 * - Listado vía `useAsyncData` (estados loading/error/success + `reload`).
 * - Mutaciones `create`, `update` (parcial) y `remove` que recargan el listado
 *   al terminar con éxito y exponen `isSaving`/`saveError` para la UI.
 *
 * @param {string} resource uno de ADMIN_RESOURCES (p. ej. 'collections')
 * @returns {{
 *   items: unknown[],
 *   meta: { total: number, page: number, limit: number, pages: number } | null,
 *   loading: boolean,
 *   error: Error | null,
 *   reload: () => void,
 *   create: (payload: object) => Promise<MutationResult>,
 *   update: (id: number | string, payload: object) => Promise<MutationResult>,
 *   remove: (id: number | string) => Promise<MutationResult>,
 *   isSaving: boolean,
 *   saveError: Error | null,
 * }}
 */
export function useAdminResource(resource) {
  const { data, loading, error, reload } = useAsyncData(
    (signal) => adminApi.list(resource, { signal }),
    [resource],
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  /**
   * Ejecuta una mutación, recarga el listado si tiene éxito y normaliza el resultado.
   * @param {() => Promise<{ data?: unknown } | null>} mutation
   * @returns {Promise<MutationResult>}
   */
  const runMutation = useCallback(
    async (mutation) => {
      setIsSaving(true)
      setSaveError(null)
      try {
        const result = await mutation()
        reload()
        return { ok: true, data: result?.data ?? null }
      } catch (mutationError) {
        setSaveError(mutationError)
        return { ok: false, error: mutationError }
      } finally {
        setIsSaving(false)
      }
    },
    [reload],
  )

  const create = useCallback(
    (payload) => runMutation(() => adminApi.create(resource, payload)),
    [resource, runMutation],
  )

  const update = useCallback(
    (id, payload) => runMutation(() => adminApi.update(resource, id, payload)),
    [resource, runMutation],
  )

  const remove = useCallback(
    (id) => runMutation(() => adminApi.remove(resource, id)),
    [resource, runMutation],
  )

  return {
    items: data?.data ?? EMPTY_ITEMS,
    meta: data?.meta ?? null,
    loading,
    error,
    reload,
    create,
    update,
    remove,
    isSaving,
    saveError,
  }
}
