import { useEffect, useRef } from 'react'
import ProtectedArtworkImage from '@/components/ProtectedArtworkImage.jsx'
import './Lightbox.scss'

const Lightbox = ({ isOpen, image, onClose }) => {
  const dialogRef = useRef(null)

  // El foco y el teclado son sistemas externos (DOM/document): capturar el
  // elemento abridor, atraparlo en el diálogo y restaurarlo al cerrar son
  // usos legítimos de un efecto.
  useEffect(() => {
    if (!isOpen) return undefined

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusables = dialogRef.current?.querySelectorAll('button:not([disabled])') ?? []
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const onDialog = document.activeElement === dialogRef.current

      if (event.shiftKey && (document.activeElement === first || onDialog)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || onDialog)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      opener?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dialogRef}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      tabIndex={-1}
    >
      <button type="button" className="lightbox__close" onClick={onClose}>
        Cerrar
      </button>
      <ProtectedArtworkImage
        className="lightbox__image"
        src={image.src}
        alt={image.alt}
        objectFit="contain"
        loading="eager"
      />
    </div>
  )
}

export default Lightbox
