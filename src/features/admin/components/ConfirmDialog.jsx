import { useEffect, useId, useRef } from 'react'
import './ConfirmDialog.scss'

/**
 * Diálogo modal de confirmación accesible (usado antes de borrar).
 *
 * - `role="dialog"` + `aria-modal`, etiquetado por título y mensaje.
 * - Al abrirse mueve el foco al botón de confirmación y lo atrapa dentro
 *   del diálogo (Tab cíclico); Escape y el clic en el fondo cancelan.
 *
 * @param {object} props
 * @param {boolean} props.open si es false no renderiza nada
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {string} [props.confirmLabel]
 * @param {string} [props.cancelLabel]
 * @param {boolean} [props.danger] estiliza la confirmación como acción destructiva
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  const id = useId()
  const dialogRef = useRef(null)
  const confirmRef = useRef(null)

  const titleId = `confirm-dialog-title-${id}`
  const messageId = `confirm-dialog-message-${id}`

  // El foco y el teclado son sistemas externos (DOM/document): entrar al
  // diálogo al abrirlo y escuchar Escape/Tab en document son usos legítimos
  // de un efecto.
  useEffect(() => {
    if (!open) return undefined
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    confirmRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = dialogRef.current?.querySelectorAll('button:not([disabled])') ?? []
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      opener?.focus()
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="confirm-dialog__backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        className="confirm-dialog"
      >
        <h2 id={titleId} className="confirm-dialog__title">
          {title}
        </h2>
        {message && (
          <p id={messageId} className="confirm-dialog__message">
            {message}
          </p>
        )}
        <div className="confirm-dialog__actions">
          <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            className={
              danger
                ? 'confirm-dialog__confirm confirm-dialog__confirm--danger'
                : 'confirm-dialog__confirm'
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
