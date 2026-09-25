import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '@/services/api.js'
import { validatePassword } from '@/utils/validatePassword.js'
import { ARTIST_NAME } from '@/constants/businessRules.js'
import SeoMeta from '@/components/SeoMeta.jsx'
import './AuthForm.scss'

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
  return 'No se pudo restablecer la contraseña.'
}

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const passwordError = validatePassword(password)
  const canSubmit = Boolean(token) && passwordError === null

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!token) {
      setStatus('error')
      setErrorMessage('El enlace de recuperación no es válido o ha caducado.')
      return
    }
    if (passwordError) {
      setFieldError(passwordError)
      return
    }

    setStatus('loading')
    setErrorMessage('')
    try {
      await api.post('/auth/reset-password', { token, password })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(toUserMessage(err))
    }
  }

  return (
    <main className="auth-form">
      <SeoMeta title={`Nueva contraseña — ${ARTIST_NAME}`} noindex />
      <h1 className="auth-form__title">Nueva contraseña</h1>
      {!token && (
        <p className="auth-form__error" role="alert">
          El enlace no incluye un token de recuperación.
        </p>
      )}
      {status === 'success' ? (
        <>
          <p className="auth-form__success" role="status">
            Contraseña actualizada. Ya puedes iniciar sesión.
          </p>
          <Link className="auth-form__link" to="/admin/login">
            Ir al acceso
          </Link>
        </>
      ) : (
        <form className="auth-form__form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="reset-password">Nueva contraseña</label>
            <input
              id="reset-password"
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="auth-form__hint">Mínimo 8 caracteres, una mayúscula y un símbolo</p>
            {fieldError && <p className="auth-form__error">{fieldError}</p>}
          </div>

          <button
            type="submit"
            className="auth-form__submit"
            disabled={!canSubmit || status === 'loading'}
          >
            {status === 'loading' ? 'Guardando…' : 'Restablecer'}
          </button>

          {status === 'error' && (
            <p className="auth-form__error" role="alert">
              {errorMessage}
            </p>
          )}
        </form>
      )}
    </main>
  )
}

export default ResetPasswordForm
