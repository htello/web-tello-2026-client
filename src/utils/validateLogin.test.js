import { describe, expect, it } from 'vitest'
import { validateLogin } from './validateLogin.js'

describe('validateLogin', () => {
  it('acepta email válido y password de 8 o más caracteres', () => {
    expect(validateLogin({ email: 'admin@example.com', password: '12345678' })).toEqual({})
  })

  it('marca email vacío como obligatorio', () => {
    const errors = validateLogin({ email: '  ', password: '12345678' })
    expect(errors.email).toBe('El email es obligatorio')
  })

  it('marca email inválido', () => {
    const errors = validateLogin({ email: 'no-es-un-email', password: '12345678' })
    expect(errors.email).toBe('Email no válido')
  })

  it('marca password vacío como obligatorio', () => {
    const errors = validateLogin({ email: 'admin@example.com', password: '' })
    expect(errors.password).toBe('La contraseña es obligatoria')
  })

  it('marca password menor de 8 caracteres', () => {
    const errors = validateLogin({ email: 'admin@example.com', password: '1234567' })
    expect(errors.password).toBe('La contraseña debe tener al menos 8 caracteres')
  })

  it('acumula errores de email y password a la vez', () => {
    const errors = validateLogin({ email: '', password: '' })
    expect(errors.email).toBeDefined()
    expect(errors.password).toBeDefined()
  })

  it('tolera campos ausentes', () => {
    const errors = validateLogin({})
    expect(errors.email).toBe('El email es obligatorio')
    expect(errors.password).toBe('La contraseña es obligatoria')
  })
})
