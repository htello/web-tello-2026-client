import { Component, useEffect, useRef } from 'react'
import * as Sentry from '@sentry/react'
import './SentryErrorBoundary.scss'

/**
 * Abre el formulario de feedback de Sentry si la integración está disponible.
 * @returns {Promise<void>}
 */
const openFeedback = async () => {
  const form = await Sentry.getFeedback()?.createForm({
    messagePlaceholder: 'Describe qué ha pasado (no incluyas contraseñas ni datos personales)',
  })
  form?.appendToDom()
  form?.open()
}

const ErrorFallback = ({ onRetry }) => {
  const retryRef = useRef(null)

  useEffect(() => {
    retryRef.current?.focus()
  }, [])

  return (
    <section className="sentry-error" role="alert" aria-labelledby="sentry-error-title">
      <h1 id="sentry-error-title" className="sentry-error__title">
        Algo ha ido mal
      </h1>
      <p className="sentry-error__text">
        Ha ocurrido un error inesperado en esta página. Puedes reintentar o, si el problema
        continúa, enviarnos un aviso.
      </p>
      <div className="sentry-error__actions">
        <button type="button" ref={retryRef} className="sentry-error__retry" onClick={onRetry}>
          Reintentar
        </button>
        {Sentry.getFeedback() && (
          <button type="button" className="sentry-error__feedback" onClick={openFeedback}>
            Reportar problema
          </button>
        )}
      </div>
    </section>
  )
}

/**
 * Error boundary que reporta fallos de render a Sentry (captureReactException)
 * y muestra una pantalla de recuperación accesible sin datos del error.
 * Componente de clase obligatorio: React no ofrece error boundaries con hooks.
 */
class SentryErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
    this.handleRetry = this.handleRetry.bind(this)
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureReactException(error, errorInfo)
  }

  handleRetry() {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) return <ErrorFallback onRetry={this.handleRetry} />
    return this.props.children
  }
}

export default SentryErrorBoundary
