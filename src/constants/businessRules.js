/** Nombre del artista, usado en la identidad visual y textos. */
export const ARTIST_NAME = 'Antonio Tello'

/** Subcategorías de diseño aceptadas por la API (GET /design?subcategory=). */
export const DESIGN_SUBCATEGORIES = [
  { key: 'imagen-corporativa', label: 'Imagen corporativa' },
  { key: 'packaging-expositores', label: 'Packaging y Expositores' },
  { key: 'carteleria', label: 'Cartelería' },
  { key: 'editorial', label: 'Editorial' },
]

/** Secciones públicas del portfolio y sus rutas. */
export const NAV_SECTIONS = [
  { label: 'Pintura', to: '/painting' },
  { label: 'Ilustración', to: '/illustration' },
  { label: 'Diseño', to: '/design' },
  { label: 'Biografía', to: '/biography' },
  { label: 'Contacto', to: '/contact' },
]

// eslint-disable-next-line sonarjs/super-linear-regex -- patrón lineal de email, sin backtracking super-lineal
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const NOT_FOUND_STATUS = 404
export const NOT_FOUND_CODE = 'NOT_FOUND'

/** Longitud mínima de contraseña (login y reset). */
export const MIN_PASSWORD_LENGTH = 8

/** Timeout por defecto de las peticiones (el server tiene cold start de ~50 s). */
export const API_TIMEOUT_MS = 90000

/**
 * Indica si un error de la API corresponde a "recurso no encontrado".
 * @param {{ status?: number, code?: string } | null | undefined} error
 * @returns {boolean}
 */
export function isNotFound(error) {
  return error?.status === NOT_FOUND_STATUS || error?.code === NOT_FOUND_CODE
}
