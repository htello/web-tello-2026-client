import { describe, expect, it } from 'vitest'
import { filterBySubcategory } from './filterBySubcategory.js'

const items = [
  { id: 1, subcategory: 'editorial' },
  { id: 2, subcategory: 'carteleria' },
  { id: 3, subcategory: 'editorial' },
]

describe('filterBySubcategory', () => {
  it('devuelve todos los items sin filtro', () => {
    expect(filterBySubcategory(items)).toEqual(items)
    expect(filterBySubcategory(items, '')).toEqual(items)
  })

  it('filtra por subcategoría válida', () => {
    expect(filterBySubcategory(items, 'editorial')).toEqual([
      { id: 1, subcategory: 'editorial' },
      { id: 3, subcategory: 'editorial' },
    ])
  })

  it('devuelve vacío para una subcategoría inexistente', () => {
    expect(filterBySubcategory(items, 'no-existe')).toEqual([])
  })
})
