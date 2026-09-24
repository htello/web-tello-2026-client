/**
 * Formatea una fecha ISO (yyyy-mm-dd) como texto en español.
 * Trata la fecha como local (T00:00:00) para evitar el desfase de zona horaria.
 *
 * @param {string | null | undefined} value
 * @returns {string} Texto localizado o cadena vacía si el valor es inválido.
 */
export function formatDate(value) {
  if (!value) return ''

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
