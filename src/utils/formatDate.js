/**
 * Formatea una fecha ISO como texto en español.
 * Acepta tanto `yyyy-mm-dd` como ISO datetime completo (`...T00:00:00.000Z`):
 * usa solo la parte de fecha y la trata como local (T00:00:00) para evitar
 * desfases de zona horaria.
 *
 * @param {string | null | undefined} value
 * @returns {string} Texto localizado o cadena vacía si el valor es inválido.
 */
export function formatDate(value) {
  if (!value) return ''

  const [datePart] = String(value).split('T')
  const date = new Date(`${datePart}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * Formatea el rango de una exposición: "Del <inicio> al <fin>" si hay fecha
 * de fin, o solo la fecha de inicio en caso contrario.
 *
 * @param {string | null | undefined} startDate fecha de inicio (ISO)
 * @param {string | null | undefined} [endDate] fecha de fin (ISO) opcional
 * @returns {string} Rango localizado, fecha única o cadena vacía si el inicio es inválido.
 */
export function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate)
  if (!start) return ''
  const end = formatDate(endDate)
  return end ? `Del ${start} al ${end}` : start
}
