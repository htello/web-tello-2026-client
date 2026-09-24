import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api.js'
import { EMAIL_REGEX } from '@/constants/businessRules.js'
import './AuthForm.scss'

/**
 * @param {string} email
 * @returns {string | null} error de validación o null si el email es válido
 */
const getEmailError = (email) => {
  if (!email.trim()) return 'El email es obligatorio'
  if (!EMAIL_REGEX.test(email)) return 'Email no válido'
  return null
}

/**
 * Traduce un error de la API a un mensaje seguro para la usuaria.
 * @param {{ code?: string, status?: number, message?: string }} err
 * @returns {string}
 */
const toUserMessage = (err) => {
  if (err.code === 'RATE_LIMITED') {
    return 'Has superado el límite de intentos. Vuelve a probar más tarde.'
  }
  if (err.status === 400) return err.message
  return 'No se pudo procesar la solicitud.'
}

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const emailError = getEmailError(email)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (emailError) return

    setStatus('loading')
    setErrorMessage('')
    try {
      await api.post('/auth/forgot-password', { email })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(toUserMessage(err))
    }
  }

  return (
    <main className="auth-form">
      <h1 className="auth-form__title">Recuperar contraseña</h1>
      {status === 'success' ? (
        <p className="auth-form__success">
          Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
        </p>
      ) : (
        <form className="auth-form__form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="auth-form__submit"
            disabled={Boolean(emailError) || status === 'loading'}
          >
            {status === 'loading' ? 'Enviando…' : 'Enviar enlace'}
          </button>

          {status === 'error' && (
            <p className="auth-form__error" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      )}
      <Link className="auth-form__link" to="/admin/login">
        Volver al acceso
      </Link>
    </main>
  )
}

export default ForgotPasswordForm
