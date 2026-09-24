import { describe, expect, it } from 'vitest'
import { getChangedFields, stripEmptyFields } from './formPayload.js'

describe('stripEmptyFields', () => {
  it('elimina cadenas vacías, null y undefined', () => {
    expect(
      stripEmptyFields({ title: 'Obra', description: '', coverImage: null, position: undefined, isPublished: false }),
    ).toEqual({ title: 'Obra', isPublished: false })
  })

  it('conserva ceros y booleanos falsos', () => {
    expect(stripEmptyFields({ position: 0, isPublished: false, isFeatured: false })).toEqual({
      position: 0,
      isPublished: false,
      isFeatured: false,
    })
  })
})

describe('getChangedFields', () => {
  const original = {
    id: 1,
    title: 'Óleos',
    description: 'Descripción',
    coverImage: null,
    position: 0,
    isPublished: true,
  }

  it('devuelve solo los campos modificados', () => {
    expect(
      getChangedFields(original, {
        title: 'Óleos',
        description: 'Nueva descripción',
        coverImage: '',
        position: 0,
        isPublished: true,
      }),
    ).toEqual({ description: 'Nueva descripción' })
  })

  it('trata "" y undefined como null al comparar (campos sin cambios)', () => {
    expect(getChangedFields(original, { coverImage: '', title: 'Óleos' })).toEqual({})
  })

  it('normaliza a null cuando se vacía un campo con valor', () => {
    expect(getChangedFields(original, { description: '' })).toEqual({ description: null })
  })

  it('detecta cambios en booleanos y numéricos', () => {
    expect(getChangedFields(original, { isPublished: false, position: 3 })).toEqual({
      isPublished: false,
      position: 3,
    })
  })

  it('ignora claves ausentes en el original (nuevas en el payload)', () => {
    expect(getChangedFields({}, { title: 'X' })).toEqual({ title: 'X' })
  })
})
