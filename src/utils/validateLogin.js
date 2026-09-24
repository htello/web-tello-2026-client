import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '@/constants/businessRules.js'

/**
 * Validación cliente (UX) del formulario de login admin.
 * @param {{ email?: string, password?: string }} values
 * @returns {Record<string, string>} errores por campo (objeto vacío = válido)
 */
export function validateLogin({ email = '', password = '' }) {
  const errors = {}
  if (!email.trim()) errors.email = 'El email es obligatorio'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Email no válido'
  if (!password) errors.password = 'La contraseña es obligatoria'
  else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
  }
  return errors
}
