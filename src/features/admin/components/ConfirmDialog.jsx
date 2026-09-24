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

  // El foco es un sistema externo (DOM): entrar al diálogo al abrirlo es un
  // uso legítimo de un efecto.
  useEffect(() => {
    if (open) confirmRef.current?.focus()
  }, [open])

  if (!open) return null

  const handleKeyDown = (event) => {
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

  return (
    <div className="confirm-dialog__backdrop" onClick={onCancel}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        className="confirm-dialog"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
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
