/** Nombre del artista, usado en la identidad visual y textos. */
export const ARTIST_NAME = 'Antonio Tello'

/** Descripción por defecto para SEO y Open Graph. */
export const SITE_DESCRIPTION =
  'Pintura, ilustración y diseño de Antonio Tello: colecciones, exposiciones y proyectos.'

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

/** Secciones del panel de administración y sus rutas. */
export const ADMIN_NAV_SECTIONS = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Colecciones', to: '/admin/collections' },
  { label: 'Pinturas', to: '/admin/paintings' },
  { label: 'Exhibiciones', to: '/admin/exhibitions' },
  { label: 'Diseño', to: '/admin/design' },
  { label: 'Ilustración', to: '/admin/illustrations' },
  { label: 'Biografía', to: '/admin/biography' },
  { label: 'Usuarios', to: '/admin/users' },
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
