import { describe, expect, it } from 'vitest'
import { EMAIL_REGEX, isNotFound } from './businessRules.js'

describe('businessRules', () => {
  it('isNotFound detecta 404 o NOT_FOUND', () => {
    expect(isNotFound({ status: 404 })).toBe(true)
    expect(isNotFound({ code: 'NOT_FOUND' })).toBe(true)
    expect(isNotFound({ status: 400, code: 'VALIDATION_ERROR' })).toBe(false)
    expect(isNotFound(null)).toBe(false)
    expect(isNotFound(undefined)).toBe(false)
  })

  it('EMAIL_REGEX valida emails', () => {
    expect(EMAIL_REGEX.test('ana@example.com')).toBe(true)
    expect(EMAIL_REGEX.test('no-es-email')).toBe(false)
  })
})
