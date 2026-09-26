import { describe, expect, it } from 'vitest'
import { validatePassword } from './validatePassword.js'

describe('validatePassword', () => {
  it('acepta una contraseña fuerte (≥8, mayúscula y símbolo)', () => {
    expect(validatePassword('Nueva$1234')).toBeNull()
  })

  it('rechaza contraseña vacía', () => {
    expect(validatePassword('')).toBe('La contraseña debe tener al menos 8 caracteres')
  })

  it('rechaza contraseña menor de 8 caracteres', () => {
    expect(validatePassword('Aa1$bbb')).toBe(
      'La contraseña debe tener al menos 8 caracteres',
    )
  })

  it('rechaza contraseña sin mayúscula', () => {
    expect(validatePassword('nueva$1234')).toBe('La contraseña debe incluir una mayúscula')
  })

  it('rechaza contraseña sin símbolo', () => {
    expect(validatePassword('Nueva12345')).toBe('La contraseña debe incluir un símbolo')
  })
})
