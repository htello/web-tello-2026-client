import { useCallback, useState } from 'react'
import { adminApi } from '@/services/adminApi.js'

/**
 * Hook de reordenación optimista para recursos admin.
 *
 * `moveUp`/`moveDown` actualizan el orden local al instante y persisten con
 * PUT .../reorder enviando SOLO `{ orderedIds }` (el server ignora
 * `collectionId` en paintings). Si el server responde error (p. ej. 400 por
 * IDs inexistentes), se revierte el orden local y el error queda expuesto
 * para mostrarse en la UI.
 *
 * @param {string} resource uno de REORDERABLE_RESOURCES
 * @param {Array<{ id: number | string }>} items listado en el orden actual
 * @returns {{
 *   items: Array<{ id: number | string }>,
 *   moveUp: (index: number) => void,
 *   moveDown: (index: number) => void,
 *   isSaving: boolean,
 *   error: Error | null,
 * }}
 */
export function useReorder(resource, items) {
  const [ordered, setOrdered] = useState(items)
  const [previousItems, setPreviousItems] = useState(items)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  // Patrón documentado de React: resincronizar el orden local cuando cambia
  // el listado recibido (p. ej. tras un reload) ajustando el estado durante el render.
  if (previousItems !== items) {
    setPreviousItems(items)
    setOrdered(items)
  }

  /**
   * Persiste el nuevo orden y revierte al anterior si falla.
   * @param {Array<{ id: number | string }>} next orden optimista ya aplicado
   * @param {Array<{ id: number | string }>} previous orden al que revertir
   */
  const persist = useCallback(
    async (next, previous) => {
      setIsSaving(true)
      setError(null)
      try {
        await adminApi.reorder(
          resource,
          next.map((item) => item.id),
        )
      } catch (reorderError) {
        setError(reorderError)
        setOrdered(previous)
      } finally {
        setIsSaving(false)
      }
    },
    [resource],
  )

  /**
   * Mueve el elemento en `index` una posición hacia arriba.
   * @param {number} index
   */
  const moveUp = useCallback(
    (index) => {
      if (index <= 0 || index >= ordered.length) return
      const next = [...ordered]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      setOrdered(next)
      persist(next, ordered)
    },
    [ordered, persist],
  )

  /**
   * Mueve el elemento en `index` una posición hacia abajo.
   * @param {number} index
   */
  const moveDown = useCallback(
    (index) => {
      if (index < 0 || index >= ordered.length - 1) return
      const next = [...ordered]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      setOrdered(next)
      persist(next, ordered)
    },
    [ordered, persist],
  )

  return { items: ordered, moveUp, moveDown, isSaving, error }
}
