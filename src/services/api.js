/**
 * Cliente HTTP reutilizable del portfolio.
 * Fuente de verdad del contrato: server/docs/openapi.yaml.
 */

import { API_TIMEOUT_MS } from '@/constants/businessRules.js'
import { addBreadcrumb } from '@/infrastructure/sentry.js'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

let authToken = null
let unauthorizedHandler = null

/**
 * Registra un callback invocado cuando una ruta /admin responde 401/403
 * (token inválido/expirado o sin rol ADMIN). Pasa `null` para desregistrarlo.
 *
 * @param {((error: ApiError) => void) | null} handler
 */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

/**
 * Error de la API con status y code (código del body de error del server).
 * @param {string} message
 * @param {number} status
 * @param {string} [code]
 */
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/**
 * Establece el token JWT que se adjunta como `Authorization: Bearer` en
 * las peticiones. Pasa `null` para limpiarlo (logout).
 *
 * @param {string | null} token
 */
export function setAuthToken(token) {
  authToken = token
}

/**
 * @param {string} method
 * @param {string} path
 * @param {{ body?: unknown, timeout?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<{ data: unknown, meta?: unknown }>}
 */
async function request(method, path, { body, timeout = API_TIMEOUT_MS, signal } = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  const abortFromCaller = () => controller.abort()
  signal?.addEventListener('abort', abortFromCaller, { once: true })

  const headers = {}
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const options = { method, signal: controller.signal, headers }

  if (body instanceof FormData) {
    options.body = body
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options)
    const isJson = response.headers.get('content-type')?.includes('application/json')
    const payload = isJson ? await response.json() : null

    if (!response.ok) {
      addBreadcrumb({
        category: 'http',
        message: `${method} ${path}`,
        data: { status: response.status, code: payload?.code },
        level: 'error',
      })
      const error = new ApiError(
        payload?.error ?? `Error ${response.status}`,
        response.status,
        payload?.code,
      )
      if (path.startsWith('/admin') && (error.status === 401 || error.status === 403)) {
        unauthorizedHandler?.(error)
      }
      throw error
    }

    return payload
  } catch (error) {
    if (error.name === 'AbortError') {
      addBreadcrumb({
        category: 'http',
        message: `${method} ${path}`,
        data: { status: 'TIMEOUT' },
        level: 'error',
      })
      throw new ApiError('La petición excedió el tiempo de espera', 0, 'TIMEOUT')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}

/**
 * @param {string} path
 * @param {object} [options]
 * @returns {Promise<{ data: unknown, meta?: unknown }>}
 */
const get = (path, options) => request('GET', path, options)

/** @param {string} path @param {unknown} body @param {object} [options] */
const post = (path, body, options) => request('POST', path, { ...options, body })

/** @param {string} path @param {unknown} body @param {object} [options] */
const put = (path, body, options) => request('PUT', path, { ...options, body })

/** @param {string} path @param {object} [options] */
const del = (path, options) => request('DELETE', path, options)

export const api = { get, post, put, del }
