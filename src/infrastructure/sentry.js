/**
 * Observabilidad Sentry: inicialización controlada y utilidades seguras.
 * Sin VITE_SENTRY_DSN no inicializa nada (las utilidades siguen siendo no-op).
 * Nunca envía password, Authorization, tokens ni contenido del formulario de contacto.
 */

import { useEffect } from 'react'
import * as Sentry from '@sentry/react'
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom'

/** Claves cuyo valor se sustituye por '[Filtered]' antes de enviar nada. */
const SENSITIVE_KEY_PATTERN =
  /authorization|password|token|jwt|secret|cookie|session|credit.?card/i

const MAX_DEPTH = 4

/**
 * Elimina valores sensibles de una estructura (copia profunda, no muta el original).
 * @param {unknown} value
 * @param {number} [depth]
 * @returns {unknown}
 */
export function scrubSensitive(value, depth = 0) {
  if (depth >= MAX_DEPTH) return '[Filtered]'
  if (Array.isArray(value)) return value.map((item) => scrubSensitive(item, depth + 1))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? '[Filtered]' : scrubSensitive(item, depth + 1),
      ]),
    )
  }
  return value
}

/**
 * Inicializa Sentry solo si existe VITE_SENTRY_DSN. Sample rates conservadores
 * en producción; tracing completo en desarrollo.
 * @returns {boolean} true si se inicializó
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return false
  const isProduction = import.meta.env.VITE_ENV === 'production'

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_ENV || 'development',
    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({ useSentryUser: false }),
    ],
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    replaysSessionSampleRate: isProduction ? 0.05 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) event.request.headers = scrubSensitive(event.request.headers)
      if (event.extra) event.extra = scrubSensitive(event.extra)
      return event
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data) breadcrumb.data = scrubSensitive(breadcrumb.data)
      return breadcrumb
    },
  })
  return true
}

/**
 * Registra un breadcrumb. Sin DSN es un no-op seguro.
 * @param {{ category: string, message: string, data?: Record<string, unknown>, level?: 'info' | 'warning' | 'error' }} crumb
 */
export const addBreadcrumb = ({ category, message, data, level = 'info' }) => {
  Sentry.addBreadcrumb({ category, message, data, level })
}

/**
 * Captura una excepción inesperada del cliente con contexto adicional.
 * @param {unknown} error
 * @param {Record<string, unknown>} [context]
 */
export const captureError = (error, context = {}) => {
  Sentry.captureException(error, { extra: scrubSensitive(context) })
}

/**
 * Asocia el evento al admin autenticado: solo id y rol, nunca email ni nombre.
 * @param {{ id: number | string, role?: string }} user
 */
export const setUserContext = ({ id, role }) => {
  Sentry.setUser({ id: String(id) })
  if (role) Sentry.setTag('userRole', role)
}

/** Desvincula al usuario tras logout o sesión expirada. */
export const clearUserContext = () => {
  Sentry.setUser(null)
}
