import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth.js'
import { validateLogin } from '@/utils/validateLogin.js'
import './AdminLogin.scss'

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Credenciales inválidas',
  RATE_LIMITED: 'Demasiados intentos. Espera un minuto antes de reintentar.',
}

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const isValid = Object.keys(validateLogin({ email, password })).length === 0

  const handleSubmit = async (event) => {
    event.preventDefault()

    const next = validateLogin({ email, password })
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setStatus('loading')
    setErrorMessage('')
    try {
      await login(email, password)
      setStatus('success')
      navigate('/admin')
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        ERROR_MESSAGES[err.code] ?? 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      )
    }
  }

  return (
    <main className="admin-login">
      <h1 className="admin-login__title">Acceso administración</h1>
      <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
        <div className="admin-login__field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            autoComplete="username"
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="admin-login__error">{errors.email}</p>}
        </div>

        <div className="admin-login__field">
          <label htmlFor="admin-password">Contraseña</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="admin-login__error">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="admin-login__submit"
          disabled={!isValid || status === 'loading'}
        >
          {status === 'loading' ? 'Entrando…' : 'Entrar'}
        </button>

        {status === 'error' && (
          <p className="admin-login__error" role="alert">
            {errorMessage}
          </p>
        )}
        {status === 'success' && <p className="admin-login__success">Sesión iniciada</p>}
      </form>
      <Link className="admin-login__forgot" to="/admin/forgot-password">
        He olvidado mi contraseña
      </Link>
    </main>
  )
}

export default AdminLogin
