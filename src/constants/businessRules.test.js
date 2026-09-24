import { describe, expect, it } from 'vitest'
import {
  API_TIMEOUT_MS,
  DESIGN_SUBCATEGORIES,
  EMAIL_REGEX,
  NAV_SECTIONS,
  NOT_FOUND_CODE,
  NOT_FOUND_STATUS,
  isNotFound,
} from './businessRules.js'

describe('businessRules', () => {
  it('expone las constantes de dominio', () => {
    expect(API_TIMEOUT_MS).toBe(90000)
    expect(NOT_FOUND_STATUS).toBe(404)
    expect(NOT_FOUND_CODE).toBe('NOT_FOUND')
    expect(DESIGN_SUBCATEGORIES).toHaveLength(4)
    expect(NAV_SECTIONS).toHaveLength(5)
  })

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
