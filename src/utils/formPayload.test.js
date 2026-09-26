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

  it('elimina arrays vacíos y conserva los no vacíos', () => {
    const images = [{ url: 'https://cdn.test/a.jpg' }]
    expect(stripEmptyFields({ title: 'Expo', images: [] })).toEqual({ title: 'Expo' })
    expect(stripEmptyFields({ images })).toEqual({ images })
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

describe('getChangedFields con listas de imágenes', () => {
  const serverImages = [
    {
      id: 1,
      url: 'https://cdn.test/a.jpg',
      thumbnail: 'https://cdn.test/a_t.jpg',
      width: 100,
      height: 80,
      position: 0,
    },
    { id: 2, url: 'https://cdn.test/b.jpg', thumbnail: null, width: null, height: null, position: 1 },
  ]
  const normalized = [
    {
      url: 'https://cdn.test/a.jpg',
      thumbnail: 'https://cdn.test/a_t.jpg',
      width: 100,
      height: 80,
    },
    { url: 'https://cdn.test/b.jpg', thumbnail: null, width: null, height: null },
  ]

  it('omite imágenes sin cambios ignorando id/position del server', () => {
    expect(getChangedFields({ images: serverImages }, { images: normalized })).toEqual({})
  })

  it('trata undefined y [] como equivalentes', () => {
    expect(getChangedFields({}, { images: [] })).toEqual({})
    expect(getChangedFields({ images: null }, { images: [] })).toEqual({})
  })

  it('detecta cambios de orden y envía la lista normalizada completa', () => {
    expect(getChangedFields({ images: serverImages }, { images: [normalized[1], normalized[0]] })).toEqual({
      images: [normalized[1], normalized[0]],
    })
  })

  it('detecta cambios de url o dimensiones', () => {
    const edited = [{ ...normalized[0], width: 999 }, normalized[1]]
    expect(getChangedFields({ images: serverImages }, { images: edited })).toEqual({
      images: edited,
    })
  })

  it('envía images: [] cuando se quitan todas las imágenes', () => {
    expect(getChangedFields({ images: serverImages }, { images: [] })).toEqual({ images: [] })
  })
})
