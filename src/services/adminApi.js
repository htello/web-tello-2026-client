/**
 * Cliente de la API de administración (/admin/...).
 *
 * Capa fina sobre el cliente HTTP genérico (`api.js`), que ya gestiona:
 * - `Authorization: Bearer <token>` (token registrado por AuthContext),
 * - traducción de `{ error, code }` a `ApiError` (mensaje en español + code),
 * - limpieza de sesión vía `unauthorizedHandler` en 401/403 de rutas /admin
 *   (ProtectedRoute redirige a /admin/login al quedar sin sesión),
 * - timeout generoso de 90 s (`API_TIMEOUT_MS`) por el cold start de Render,
 * - y nunca loguea el token ni la cabecera Authorization.
 *
 * Fuente de verdad del contrato: server/docs/openapi.yaml.
 */

import { api, ApiError } from './api.js'
import { addBreadcrumb } from '@/infrastructure/sentry.js'

/**
 * Breadcrumb de acción del panel admin: registra la intención (recurso, id,
 * sección) pero nunca payloads, credenciales ni datos personales.
 *
 * @param {string} action p. ej. 'collections:create'
 * @param {Record<string, unknown>} [data]
 */
const adminBreadcrumb = (action, data) =>
  addBreadcrumb({ category: 'admin', message: `admin:${action}`, data })

/** Recursos admin con CRUD estándar. */
export const ADMIN_RESOURCES = [
  'collections',
  'paintings',
  'exhibitions',
  'design',
  'illustrations',
  'users',
]

/** Recursos que admiten PUT .../reorder. */
export const REORDERABLE_RESOURCES = [
  'collections',
  'paintings',
  'exhibitions',
  'design',
  'illustrations',
]

/** Secciones válidas para POST /admin/upload. */
export const UPLOAD_SECTIONS = ['pintura', 'ilustracion', 'diseno', 'general']

/**
 * Error de validación local (antes de llamar a la red).
 * @param {string} message mensaje en español
 * @returns {ApiError}
 */
const validationError = (message) => new ApiError(message, 400, 'VALIDATION_ERROR')

/**
 * Valida el recurso y devuelve su ruta base admin.
 * @param {string} resource
 * @returns {string} ruta `/admin/<recurso>`
 */
const resourcePath = (resource) => {
  if (!ADMIN_RESOURCES.includes(resource)) {
    throw validationError(`Recurso de administración no válido: ${resource}`)
  }
  return `/admin/${resource}`
}

/**
 * Valida que un payload de actualización parcial tenga al menos 1 campo.
 * @param {object} payload
 */
const assertPartialPayload = (payload) => {
  if (!payload || Object.keys(payload).length === 0) {
    throw validationError('Envía al menos un campo para actualizar')
  }
}

/**
 * Convierte un objeto de parámetros en query string.
 * @param {Record<string, string | number> | undefined} params
 * @returns {string} sufijo con `?` inicial o cadena vacía
 */
const toQueryString = (params) => {
  if (!params) return ''
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.append(key, String(value))
  }
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

/**
 * Lista el recurso (publicado y no publicado, ordenado por position asc).
 * En `users` admite `params: { page, limit }` y devuelve `{ data, meta }`.
 *
 * @param {string} resource uno de ADMIN_RESOURCES
 * @param {{ signal?: AbortSignal, params?: Record<string, string | number> }} [options]
 * @returns {Promise<{ data: unknown[], meta?: unknown }>}
 */
const list = async (resource, { signal, params } = {}) =>
  api.get(`${resourcePath(resource)}${toQueryString(params)}`, { signal })

/**
 * Crea una entidad del recurso.
 * @param {string} resource uno de ADMIN_RESOURCES
 * @param {object} payload campos de la entidad (en paintings, `year` y `collectionId` obligatorios)
 * @returns {Promise<{ data: unknown }>} entidad creada
 */
const create = async (resource, payload) => {
  adminBreadcrumb(`${resource}:create`)
  return api.post(resourcePath(resource), payload)
}

/**
 * Actualización parcial: enviar solo los campos a cambiar (mínimo 1 campo).
 * @param {string} resource uno de ADMIN_RESOURCES
 * @param {number | string} id
 * @param {object} payload solo los campos modificados
 * @returns {Promise<{ data: unknown }>} entidad actualizada
 */
const update = async (resource, id, payload) => {
  assertPartialPayload(payload)
  adminBreadcrumb(`${resource}:update`, { id })
  return api.put(`${resourcePath(resource)}/${id}`, payload)
}

/**
 * Borra una entidad del recurso.
 * @param {string} resource uno de ADMIN_RESOURCES
 * @param {number | string} id
 * @returns {Promise<{ data: unknown } | null>}
 */
const remove = async (resource, id) => {
  adminBreadcrumb(`${resource}:remove`, { id })
  return api.del(`${resourcePath(resource)}/${id}`)
}

/**
 * Reordena entidades: PUT .../reorder con SOLO `{ orderedIds }`.
 * (El server ignora `collectionId` en paintings; no enviarlo.)
 *
 * @param {string} resource uno de REORDERABLE_RESOURCES
 * @param {Array<number | string>} orderedIds IDs en el nuevo orden
 * @returns {Promise<{ data: unknown } | null>}
 */
const reorder = async (resource, orderedIds) => {
  if (!REORDERABLE_RESOURCES.includes(resource)) {
    throw validationError(`El recurso no admite reordenación: ${resource}`)
  }
  adminBreadcrumb(`${resource}:reorder`, { count: orderedIds.length })
  return api.put(`${resourcePath(resource)}/reorder`, { orderedIds })
}

/**
 * Sube una imagen (paso 1 de 2): la `url` devuelta se envía después como
 * `imageUrl`/`coverImage` en el JSON del create/update.
 *
 * @param {File} file imagen a subir
 * @param {string} [section] pintura | ilustracion | diseno | general
 * @returns {Promise<{ data: { url: string, thumbnail: string, width: number, height: number, format: string } }>}
 */
const upload = async (file, section = 'general') => {
  const safeSection = UPLOAD_SECTIONS.includes(section) ? section : 'general'
  adminBreadcrumb('upload', { section: safeSection })
  const formData = new FormData()
  formData.append('file', file)
  formData.append('section', safeSection)
  return api.post('/admin/upload', formData)
}

/**
 * Detalle de un usuario admin.
 * @param {number | string} id
 * @returns {Promise<{ data: unknown }>}
 */
const getUser = async (id) => api.get(`/admin/users/${id}`)

/**
 * Registra un nuevo ADMIN (requiere token de admin existente).
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<{ data: unknown }>}
 */
const registerUser = async (payload) => {
  adminBreadcrumb('users:register')
  return api.post('/admin/users/register', payload)
}

/**
 * Cambia la contraseña de un usuario.
 * @param {number | string} id
 * @param {{ password: string }} payload password fuerte (≥8, mayúscula y símbolo)
 * @returns {Promise<{ data: unknown } | null>}
 */
const updateUserPassword = async (id, payload) => {
  adminBreadcrumb('users:password', { id })
  return api.put(`/admin/users/${id}/password`, payload)
}

/**
 * Crea la biografía (solo existe una; el front trata el 404 público como "sin biografía").
 * @param {object} payload
 * @returns {Promise<{ data: unknown }>}
 */
const createBiography = async (payload) => {
  adminBreadcrumb('biography:create')
  return api.post('/admin/biography', payload)
}

/**
 * Actualización parcial de la biografía (mínimo 1 campo).
 * @param {object} payload
 * @returns {Promise<{ data: unknown }>}
 */
const updateBiography = async (payload) => {
  assertPartialPayload(payload)
  adminBreadcrumb('biography:update')
  return api.put('/admin/biography', payload)
}

export const adminApi = {
  list,
  create,
  update,
  remove,
  reorder,
  upload,
  getUser,
  registerUser,
  updateUserPassword,
  createBiography,
  updateBiography,
}
