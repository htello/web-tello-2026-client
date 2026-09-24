import { useEffect, useRef } from 'react'
import ProtectedArtworkImage from '@/components/ProtectedArtworkImage.jsx'
import './Lightbox.scss'

const Lightbox = ({ isOpen, image, onClose }) => {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    dialogRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
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
