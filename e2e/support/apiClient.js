const API_BASE = process.env.E2E_API_URL ?? 'http://localhost:3000/api/v1'

/** Recursos admin limpiables; el orden importa (paintings antes que collections). */
const CLEANUP_RESOURCES = ['paintings', 'collections', 'exhibitions', 'design', 'illustrations']

/**
 * Llamada directa a la API real (fuera del navegador).
 * @param {string} method
 * @param {string} path ruta relativa a la base de la API
 * @param {{ token?: string, body?: object }} [options]
 * @returns {Promise<{ status: number, body: any }>}
 */
export async function apiRequest(method, path, { token, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await response.text()
  let parsed
  try {
    parsed = text ? JSON.parse(text) : null
  } catch {
    parsed = text
  }
  return { status: response.status, body: parsed }
}

/**
 * Inicia sesión con las credenciales E2E del `.env` (nunca hardcodeadas).
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function loginAdmin() {
  const { status, body } = await apiRequest('POST', '/auth/login', {
    body: { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD },
  })
  if (status !== 200) {
    throw new Error(`Login E2E falló (${status}): ${body?.error ?? 'sin respuesta'}`)
  }
  return body.data
}

/**
 * Borra por API los restos de ejecuciones E2E (títulos con prefijo `E2E` y
 * usuarios con email `e2e-`), para que un fallo a mitad no deje basura.
 *
 * @param {{ titlePrefix?: string, emailPrefix?: string, token?: string }} [options]
 *   `token` reutiliza una sesión ya abierta (el login tiene rate limit 10/min).
 * @returns {Promise<string[]>} recursos borrados
 */
export async function cleanupE2EData({ titlePrefix = 'E2E', emailPrefix = 'e2e-', token: given } = {}) {
  const token = given ?? (await loginAdmin()).token
  const removed = []

  for (const resource of CLEANUP_RESOURCES) {
    const { body } = await apiRequest('GET', `/admin/${resource}`, { token })
    for (const item of body?.data ?? []) {
      if (!String(item.title ?? '').startsWith(titlePrefix)) continue
      const { status } = await apiRequest('DELETE', `/admin/${resource}/${item.id}`, { token })
      removed.push(`${resource}:${item.id}:${status}`)
    }
  }

  const { body } = await apiRequest('GET', '/admin/users?limit=100', { token })
  for (const user of body?.data ?? []) {
    if (!String(user.email ?? '').startsWith(emailPrefix)) continue
    const { status } = await apiRequest('DELETE', `/admin/users/${user.id}`, { token })
    removed.push(`users:${user.id}:${status}`)
  }

  return removed
}
