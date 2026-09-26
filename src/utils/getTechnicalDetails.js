const FIELDS = [
  { label: 'Dimensiones', key: 'dimensions' },
  { label: 'Técnica', key: 'technique' },
  { label: 'Año', key: 'year' },
]

/**
 * Devuelve los datos técnicos presentes de una pintura como pares label/value,
 * en el orden dimensions, technique, year y omitiendo campos null/undefined/vacíos.
 *
 * @param {{ dimensions?: string, technique?: string, year?: number }} painting
 * @returns {Array<{ label: string, value: string | number }>}
 */
export function getTechnicalDetails(painting) {
  return FIELDS.filter(({ key }) => painting[key]).map(({ label, key }) => ({
    label,
    value: painting[key],
  }))
}
