import { describe, expect, it } from 'vitest'
import { sortByPosition } from './sortByPosition.js'

describe('sortByPosition', () => {
  it('ordena por position ascendente', () => {
    const items = [
      { id: 3, position: 3 },
      { id: 1, position: 1 },
      { id: 2, position: 2 },
    ]

    expect(sortByPosition(items).map((i) => i.id)).toEqual([1, 2, 3])
  })

  it('coloca al final las entradas sin position', () => {
    const items = [
      { id: 2, position: 2 },
      { id: 'sin', position: null },
      { id: 1, position: 1 },
    ]

    expect(sortByPosition(items).map((i) => i.id)).toEqual([1, 2, 'sin'])
  })

  it('no muta el array original', () => {
    const items = [{ id: 2, position: 2 }, { id: 1, position: 1 }]
    sortByPosition(items)
    expect(items.map((i) => i.id)).toEqual([2, 1])
  })
})
