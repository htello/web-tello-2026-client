/**
 * Utilidades de payload para los formularios del panel admin.
 * El contrato exige PUT parciales (solo campos modificados, mínimo 1 campo)
 * y en POST conviene omitir opcionales vacíos.
 */

/**
 * Elimina campos vacíos ('' , null o undefined) de un payload de creación.
 * Conserva ceros y booleanos falsos (valores significativos).
 *
 * @param {Record<string, unknown>} values
 * @returns {Record<string, unknown>} payload sin campos vacíos
 */
export function stripEmptyFields(values) {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined,
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
 * Calcula los campos modificados entre la entidad original del server y el
 * payload del formulario, para enviar un PUT parcial (mínimo 1 campo).
 * Los textos vaciados se envían como null.
 *
 * @param {Record<string, unknown>} original entidad precargada en el formulario
 * @param {Record<string, unknown>} values payload candidato
 * @returns {Record<string, unknown>} solo los campos que cambian
 */
export function getChangedFields(original, values) {
  const changed = {}
  for (const [key, value] of Object.entries(values)) {
    const next = normalize(value)
    if (normalize(original[key]) !== next) {
      changed[key] = next
    }
  }
  return changed
}
