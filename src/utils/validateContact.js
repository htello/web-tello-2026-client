import { EMAIL_REGEX } from '@/constants/businessRules.js'

/**
 * Validación cliente (UX) del formulario de contacto.
 * @param {{ name?: string, email?: string, subject?: string, message?: string }} values
 * @returns {Record<string, string>} errores por campo (objeto vacío = válido)
 */
export function validateContact({ name = '', email = '', subject = '', message = '' }) {
  const errors = {}
  if (!name.trim()) errors.name = 'El nombre es obligatorio'
  if (!email.trim()) errors.email = 'El email es obligatorio'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Email no válido'
  if (!subject.trim()) errors.subject = 'El asunto es obligatorio'
  if (!message.trim()) errors.message = 'El mensaje es obligatorio'
  return errors
}
