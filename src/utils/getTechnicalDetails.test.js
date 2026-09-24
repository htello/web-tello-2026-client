import { describe, expect, it } from 'vitest'
import { getTechnicalDetails } from './getTechnicalDetails.js'

describe('getTechnicalDetails', () => {
  it('devuelve los pares label/value en el orden dimensions, technique, year', () => {
    const painting = { dimensions: '80 x 100 cm', technique: 'Óleo', year: 2020 }

    expect(getTechnicalDetails(painting)).toEqual([
      { label: 'Dimensiones', value: '80 x 100 cm' },
      { label: 'Técnica', value: 'Óleo' },
      { label: 'Año', value: 2020 },
    ])
  })

  it('omite campos null, undefined o vacíos', () => {
    const painting = { dimensions: '', technique: null, year: undefined }

    expect(getTechnicalDetails(painting)).toEqual([])
  })

  it('incluye solo los campos presentes', () => {
    const painting = { technique: 'Acuarela' }

    expect(getTechnicalDetails(painting)).toEqual([
      { label: 'Técnica', value: 'Acuarela' },
    ])
  })
})
