/**
 * Utilidades de payload para los formularios del panel admin.
 * El contrato exige PUT parciales (solo campos modificados, mínimo 1 campo)
 * y en POST conviene omitir opcionales vacíos.
 */

/**
 * Elimina campos vacíos ('' , null, undefined o arrays vacíos) de un payload de
 * creación. Conserva ceros y booleanos falsos (valores significativos).
 *
 * @param {Record<string, unknown>} values
 * @returns {Record<string, unknown>} payload sin campos vacíos
 */
export function stripEmptyFields(values) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0),
    ),
  )
}

/**
 * Normaliza un valor para comparación ('' y undefined equivalen a null).
 * @param {unknown} value
 * @returns {unknown}
 */
const normalize = (value) => (value === '' || value === undefined ? null : value)

/**
 * Normaliza una lista de imágenes al formato ExhibitionImageInput del contrato
 * (sin id/position), con null en los campos ausentes. Lo que no sea array se
 * trata como lista vacía: una entidad sin imágenes y [] son equivalentes.
 *
 * @param {unknown} value
 * @returns {Array<{ url: string, thumbnail: string | null, width: number | null, height: number | null }>}
 */
const normalizeImages = (value) =>
  Array.isArray(value)
    ? value.map(({ url, thumbnail, width, height }) => ({
        url,
        thumbnail: thumbnail ?? null,
        width: width ?? null,
        height: height ?? null,
      }))
    : []

/**
 * Calcula los campos modificados entre la entidad original del server y el
 * payload del formulario, para enviar un PUT parcial (mínimo 1 campo).
 * Los textos vaciados se envían como null. Las listas de imágenes se comparan
 * normalizadas (ignorando id/position) y, si cambian, se envía la lista
 * completa normalizada (el PUT del contrato la reemplaza entera).
 *
 * @param {Record<string, unknown>} original entidad precargada en el formulario
 * @param {Record<string, unknown>} values payload candidato
 * @returns {Record<string, unknown>} solo los campos que cambian
 */
export function getChangedFields(original, values) {
  const changed = {}
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      const nextImages = normalizeImages(value)
      if (JSON.stringify(normalizeImages(original[key])) !== JSON.stringify(nextImages)) {
        changed[key] = nextImages
      }
      continue
    }
    const next = normalize(value)
    if (normalize(original[key]) !== next) {
      changed[key] = next
    }
  }
  return changed
}
