/**
 * Cliente HTTP reutilizable del portfolio.
 * Fuente de verdad del contrato: server/docs/openapi.yaml.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

// Timeout generoso: el server en Render tiene cold start de ~50 s.
const DEFAULT_TIMEOUT = 90000

let authToken = null

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
async function request(method, path, { body, timeout = DEFAULT_TIMEOUT, signal } = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  const abortFromCaller = () => controller.abort()
  signal?.addEventListener('abort', abortFromCaller, { once: true })

  const headers = {}
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const options = { method, signal: controller.signal, headers }

  if (body !== undefined) {
    if (body instanceof FormData) {
      options.body = body
    } else {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(body)
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options)
    const isJson = response.headers.get('content-type')?.includes('application/json')
    const payload = isJson ? await response.json() : null

    if (!response.ok) {
      throw new ApiError(
        payload?.error ?? `Error ${response.status}`,
        response.status,
        payload?.code,
      )
    }

    return payload
  } catch (error) {
    if (error.name === 'AbortError') {
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
