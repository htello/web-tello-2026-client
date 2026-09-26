import { MIN_PASSWORD_LENGTH } from '@/constants/businessRules.js'

/**
 * Valida una contraseña nueva fuerte (reset-password):
 * ≥8 caracteres, una mayúscula y un símbolo.
 * @param {string} password
 * @returns {string | null} mensaje de error o null si es válida
 */
export function validatePassword(password) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
  }
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir una mayúscula'
  if (!/[^A-Za-z0-9]/.test(password)) return 'La contraseña debe incluir un símbolo'
  return null
}
