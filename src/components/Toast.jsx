import { useEffect } from 'react'
import './Toast.scss'

/**
 * Notificación transitoria con cierre manual y automático.
 *
 * - `error` → `role=alert` + `aria-live=assertive` (interrumpe al momento).
 * - `success`/`info` → `role=status` + `aria-live=polite` (no interrumpe).
 *
 * @param {object} props
 * @param {'success' | 'error' | 'info'} [props.variant]
 * @param {string} props.message texto de la notificación
 * @param {() => void} [props.onClose]
 * @param {number} [props.duration] ms para el auto-cierre; 0 lo desactiva
 */
const Toast = ({ variant = 'info', message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!duration) return undefined
    const timer = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const isError = variant === 'error'

  return (
    <div
      className={`toast toast--${variant}`}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <p className="toast__message">{message}</p>
      <button
        type="button"
        className="toast__close"
        aria-label="Cerrar notificación"
        onClick={() => onClose?.()}
      >
        ×
      </button>
    </div>
  )
}

export default Toast
