import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate.js'

describe('formatDate', () => {
  it('formatea una fecha ISO válida en español', () => {
    const result = formatDate('2024-05-15')

    expect(result).toContain('15')
    expect(result).toContain('mayo')
    expect(result).toContain('2024')
  })

  it('devuelve un texto seguro para valores vacíos o inválidos', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('no-es-una-fecha')).toBe('')
  })
})
