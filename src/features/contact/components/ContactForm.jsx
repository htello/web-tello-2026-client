import { useState } from 'react'
import { api } from '@/services/api.js'
import { addBreadcrumb } from '@/infrastructure/sentry.js'
import { validateContact } from '@/utils/validateContact.js'
import { ARTIST_NAME } from '@/constants/businessRules.js'
import SeoMeta from '@/components/SeoMeta.jsx'
import './ContactForm.scss'

const ContactForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const next = validateContact({ name, email, subject, message })
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setStatus('loading')
    addBreadcrumb({ category: 'form', message: 'contact:submit' })
    try {
      await api.post('/contact', { name, email, subject, message })
      addBreadcrumb({ category: 'form', message: 'contact:success' })
      setStatus('success')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      addBreadcrumb({
        category: 'form',
        message: 'contact:error',
        data: { code: err.code },
        level: 'error',
      })
      setStatus('error')
      setErrorMessage(
        err.code === 'RATE_LIMITED' || err.code === 'EMAIL_ERROR'
          ? 'No se pudo enviar el mensaje. Inténtalo de nuevo.'
          : err.message || 'No se pudo enviar el mensaje.',
      )
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <SeoMeta title={`Contacto — ${ARTIST_NAME}`} path="/contact" />
      <h1 className="contact-form__title">Contacto</h1>
      <div className="contact-form__field">
        <label htmlFor="contact-name">Nombre</label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
        />
        {errors.name && (
          <p id="contact-name-error" className="contact-form__error" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
        />
        {errors.email && (
          <p id="contact-email-error" className="contact-form__error" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-subject">Asunto</label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
        />
        {errors.subject && (
          <p id="contact-subject-error" className="contact-form__error" role="alert">
            {errors.subject}
          </p>
        )}
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-message">Mensaje</label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {errors.message && (
          <p id="contact-message-error" className="contact-form__error" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <button type="submit" className="contact-form__submit" disabled={status === 'loading'}>
        Enviar
      </button>

      {status === 'success' && (
        <p className="contact-form__success" role="status">
          Mensaje enviado. Gracias por escribir.
        </p>
      )}
      {status === 'error' && (
        <p className="contact-form__error" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  )
}

export default ContactForm
