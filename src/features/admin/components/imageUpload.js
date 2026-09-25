/** Tipos de imagen aceptados por POST /admin/upload (contrato del server). */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Valor del atributo `accept` del input de archivo. */
export const ACCEPT_ATTR = ACCEPTED_IMAGE_TYPES.join(',')

/** Tamaño máximo admitido (5 MB), igual que el límite del server. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * Valida un archivo de imagen antes de subirlo (sin llamada de red).
 * @param {File} file
 * @returns {string} mensaje de error ('' si es válido)
 */
export const validateImageFile = (file) => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Formato no válido: usa JPEG, PNG o WebP'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'La imagen supera el máximo de 5 MB'
  }
  return ''
}
