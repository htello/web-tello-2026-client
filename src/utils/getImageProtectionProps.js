/**
 * Devuelve props para aplicar protección visual básica a una imagen
 * (barrera de interfaz, no garantía de seguridad absoluta contra capturas).
 *
 * @param {string} alt
 * @returns {{ draggable: boolean, alt: string, onContextMenu: (e: Event) => void }}
 */
export function getImageProtectionProps(alt) {
  return {
    draggable: false,
    alt,
    onContextMenu: (event) => event.preventDefault(),
  }
}
