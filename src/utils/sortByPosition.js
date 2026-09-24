/**
 * Ordena una lista por `position` ascendente, dejando al final
 * las entradas sin position (null/undefined). No muta el array original.
 *
 * @param {Array<{ position?: number | null }>} items
 * @returns {Array<{ position?: number | null }>}
 */
export function sortByPosition(items) {
  return [...items].sort((a, b) => {
    const pa = a.position ?? Number.MAX_SAFE_INTEGER
    const pb = b.position ?? Number.MAX_SAFE_INTEGER
    return pa - pb
  })
}
