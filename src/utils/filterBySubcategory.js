/**
 * Filtra una lista de proyectos de diseño por subcategoría.
 * Sin subcategoría devuelve la lista completa (misma referencia).
 *
 * @param {Array<{ subcategory: string }>} items
 * @param {string} [subcategory]
 * @returns {Array<{ subcategory: string }>}
 */
export function filterBySubcategory(items, subcategory) {
  if (!subcategory) return items
  return items.filter((item) => item.subcategory === subcategory)
}
