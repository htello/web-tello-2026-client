import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  setUser: vi.fn(),
  setTag: vi.fn(),
  replayIntegration: vi.fn(() => 'REPLAY'),
  feedbackIntegration: vi.fn(() => 'FEEDBACK'),
  reactRouterV7BrowserTracingIntegration: vi.fn(() => 'TRACING'),
}))

import * as Sentry from '@sentry/react'
import {
  addBreadcrumb,
  captureError,
  clearUserContext,
  initSentry,
  scrubSensitive,
  setUserContext,
} from './sentry.js'

const DSN = 'https://publickey@o0.ingest.sentry.io/1234'

/**
 * Devuelve la configuración pasada a la última llamada de Sentry.init.
 * @returns {object}
 */
const initConfig = () => Sentry.init.mock.calls.at(-1)[0]

describe('scrubSensitive', () => {
  it('sustituye valores de claves sensibles sin importar mayúsculas', () => {
    const scrubbed = scrubSensitive({
      Authorization: 'Bearer eyJhbGci',
      password: 'p4ss',
      jwt: 'x',
      cookie: 'a=b',
      sessionId: 7,
      safe: 'visible',
    })
    expect(scrubbed).toEqual({
      Authorization: '[Filtered]',
      password: '[Filtered]',
      jwt: '[Filtered]',
      cookie: '[Filtered]',
      sessionId: '[Filtered]',
      safe: 'visible',
    })
  })

  it('filtra en objetos anidados y arrays', () => {
    const scrubbed = scrubSensitive({
      headers: [{ Token: 'abc' }],
      nested: { deep: { secretKey: 'x', ok: 1 } },
    })
    expect(scrubbed).toEqual({
      headers: [{ Token: '[Filtered]' }],
      nested: { deep: { secretKey: '[Filtered]', ok: 1 } },
    })
  })

  it('devuelve los primitivos tal cual', () => {
    expect(scrubSensitive('texto')).toBe('texto')
    expect(scrubSensitive(42)).toBe(42)
    expect(scrubSensitive(null)).toBeNull()
  })

  it('filtra estructuras más profundas que el límite de profundidad', () => {
    const deep = { a: { b: { c: { d: { e: 'x' } } } } }
    expect(scrubSensitive(deep)).toEqual({ a: { b: { c: { d: '[Filtered]' } } } })
  })

  it('no muta el objeto original', () => {
    const original = { password: 'p4ss' }
    scrubSensitive(original)
    expect(original).toEqual({ password: 'p4ss' })
  })
})

describe('initSentry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('no inicializa cuando falta VITE_SENTRY_DSN', () => {
    vi.stubEnv('VITE_SENTRY_DSN', '')

    expect(initSentry()).toBe(false)
    expect(Sentry.init).not.toHaveBeenCalled()
  })

  it('inicializa con sample rates conservadores en producción', () => {
    vi.stubEnv('VITE_SENTRY_DSN', DSN)
    vi.stubEnv('VITE_ENV', 'production')

    expect(initSentry()).toBe(true)
    const config = initConfig()
    expect(config.dsn).toBe(DSN)
    expect(config.environment).toBe('production')
    expect(config.tracesSampleRate).toBeCloseTo(0.1)
    expect(config.replaysSessionSampleRate).toBeCloseTo(0.05)
    expect(config.replaysOnErrorSampleRate).toBe(1.0)
    expect(config.sendDefaultPii).toBe(false)
    expect(config.integrations).toEqual(['TRACING', 'REPLAY', 'FEEDBACK'])
    expect(Sentry.feedbackIntegration).toHaveBeenCalledWith({ useSentryUser: false })
  })

  it('usa entorno development y tracing completo por defecto', () => {
    vi.stubEnv('VITE_SENTRY_DSN', DSN)
    vi.stubEnv('VITE_ENV', '')

    expect(initSentry()).toBe(true)
    const config = initConfig()
    expect(config.environment).toBe('development')
    expect(config.tracesSampleRate).toBe(1.0)
    expect(config.replaysSessionSampleRate).toBeCloseTo(0.1)
  })

  it('beforeSend filtra headers y extra sensibles', () => {
    vi.stubEnv('VITE_SENTRY_DSN', DSN)
    initSentry()
    const { beforeSend } = initConfig()

    const event = beforeSend({
      request: { headers: { Authorization: 'Bearer x', Accept: 'json' } },
      extra: { password: 'p4ss', ok: true },
    })
    expect(event.request.headers).toEqual({ Authorization: '[Filtered]', Accept: 'json' })
    expect(event.extra).toEqual({ password: '[Filtered]', ok: true })
  })

  it('beforeSend tolera eventos sin request ni extra', () => {
    vi.stubEnv('VITE_SENTRY_DSN', DSN)
    initSentry()
    const { beforeSend } = initConfig()

    expect(beforeSend({ message: 'sin cabeceras' })).toEqual({ message: 'sin cabeceras' })
  })

  it('beforeBreadcrumb filtra data sensible y deja pasar breadcrumbs sin data', () => {
    vi.stubEnv('VITE_SENTRY_DSN', DSN)
    initSentry()
    const { beforeBreadcrumb } = initConfig()

    expect(beforeBreadcrumb({ data: { token: 'jwt' } })).toEqual({ data: { token: '[Filtered]' } })
    expect(beforeBreadcrumb({ message: 'navegación' })).toEqual({ message: 'navegación' })
  })
})

describe('utilidades de observabilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('addBreadcrumb delega con level info por defecto', () => {
    addBreadcrumb({ category: 'ui', message: 'painting:open', data: { paintingId: 3 } })

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
      category: 'ui',
      message: 'painting:open',
      data: { paintingId: 3 },
      level: 'info',
    })
  })

  it('addBreadcrumb respeta el level indicado', () => {
    addBreadcrumb({ category: 'http', message: 'GET /x', level: 'error' })

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'error' }),
    )
  })

  it('captureError envía la excepción con contexto filtrado', () => {
    const error = new Error('fallo')
    captureError(error, { where: 'lightbox', password: 'p4ss' })

    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      extra: { where: 'lightbox', password: '[Filtered]' },
    })
  })

  it('captureError sin contexto envía extra vacío', () => {
    const error = new Error('fallo')
    captureError(error)

    expect(Sentry.captureException).toHaveBeenCalledWith(error, { extra: {} })
  })

  it('setUserContext envía solo id y rol', () => {
    setUserContext({ id: 7, role: 'ADMIN', email: 'admin@example.com' })

    expect(Sentry.setUser).toHaveBeenCalledWith({ id: '7' })
    expect(Sentry.setTag).toHaveBeenCalledWith('userRole', 'ADMIN')
  })

  it('setUserContext sin rol no fija tag', () => {
    setUserContext({ id: 7 })

    expect(Sentry.setUser).toHaveBeenCalledWith({ id: '7' })
    expect(Sentry.setTag).not.toHaveBeenCalled()
  })

  it('clearUserContext limpia el usuario', () => {
    clearUserContext()

    expect(Sentry.setUser).toHaveBeenCalledWith(null)
  })
})
