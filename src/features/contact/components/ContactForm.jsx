import { useState } from 'react'
import { api } from '@/services/api.js'
import { validateContact } from '@/utils/validateContact.js'
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
    try {
      await api.post('/contact', { name, email, subject, message })
      setStatus('success')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
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
      <div className="contact-form__field">
        <label htmlFor="contact-name">Nombre</label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="contact-form__error">{errors.name}</p>}
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="contact-form__error">{errors.email}</p>}
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-subject">Asunto</label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        {errors.subject && <p className="contact-form__error">{errors.subject}</p>}
      </div>

      <div className="contact-form__field">
        <label htmlFor="contact-message">Mensaje</label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {errors.message && <p className="contact-form__error">{errors.message}</p>}
      </div>

      <button type="submit" className="contact-form__submit" disabled={status === 'loading'}>
        Enviar
      </button>

      {status === 'success' && (
        <p className="contact-form__success">Mensaje enviado. Gracias por escribir.</p>
      )}
      {status === 'error' && <p className="contact-form__error">{errorMessage}</p>}
    </form>
  )
}

export default ContactForm
