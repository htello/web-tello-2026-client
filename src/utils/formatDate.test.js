import { describe, expect, it } from 'vitest'
import { formatDate, formatDateRange } from './formatDate.js'

describe('formatDate', () => {
  it('formatea una fecha ISO válida en español', () => {
    const result = formatDate('2024-05-15')

    expect(result).toContain('15')
    expect(result).toContain('mayo')
    expect(result).toContain('2024')
  })

  it('formatea un ISO datetime completo usando solo la parte de fecha', () => {
    const result = formatDate('2025-07-20T00:00:00.000Z')

    expect(result).toContain('20')
    expect(result).toContain('julio')
    expect(result).toContain('2025')
  })

  it('devuelve un texto seguro para valores vacíos o inválidos', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('no-es-una-fecha')).toBe('')
  })
})

describe('formatDateRange', () => {
  it('con endDate devuelve el rango "Del X al Y"', () => {
    expect(formatDateRange('2000-08-10', '2000-09-30')).toBe(
      'Del 10 de agosto de 2000 al 30 de septiembre de 2000',
    )
  })

  it('sin endDate devuelve solo la fecha de inicio', () => {
    expect(formatDateRange('2000-08-10', null)).toBe('10 de agosto de 2000')
  })

  it('devuelve cadena vacía si la fecha de inicio es inválida', () => {
    expect(formatDateRange('', '2000-09-30')).toBe('')
    expect(formatDateRange(null, null)).toBe('')
  })
})
