import { describe, expect, it } from 'vitest'
import { validateContact } from './validateContact.js'

const VALID = {
  name: 'Ana',
  email: 'ana@example.com',
  subject: 'Consulta',
  message: 'Hola, quiero información.',
}

describe('validateContact', () => {
  it('acepta todos los campos válidos', () => {
    expect(validateContact(VALID)).toEqual({})
  })

  it('marca name vacío como obligatorio', () => {
    const errors = validateContact({ ...VALID, name: '   ' })
    expect(errors.name).toBe('El nombre es obligatorio')
  })

  it('marca email vacío como obligatorio', () => {
    const errors = validateContact({ ...VALID, email: '' })
    expect(errors.email).toBe('El email es obligatorio')
  })

  it('marca email inválido', () => {
    const errors = validateContact({ ...VALID, email: 'ana@' })
    expect(errors.email).toBe('Email no válido')
  })

  it('marca subject vacío como obligatorio', () => {
    const errors = validateContact({ ...VALID, subject: '' })
    expect(errors.subject).toBe('El asunto es obligatorio')
  })

  it('marca message vacío como obligatorio', () => {
    const errors = validateContact({ ...VALID, message: ' ' })
    expect(errors.message).toBe('El mensaje es obligatorio')
  })

  it('tolera campos ausentes', () => {
    const errors = validateContact({})
    expect(Object.keys(errors).sort()).toEqual(['email', 'message', 'name', 'subject'])
  })
})
