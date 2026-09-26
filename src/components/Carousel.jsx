import { Children, useEffect, useRef, useState } from 'react'
import './Carousel.scss'

/**
 * Carrusel deslizable accesible: flechas en escritorio (1 página por salto),
 * dots que representan cada imagen con la activa marcada, y deslizamiento
 * nativo con scroll-snap en móvil. Los hijos directos son las imágenes.
 *
 * @param {{ label: string, children: import('react').ReactNode }} props
 */
const Carousel = ({ label, children }) => {
  const items = Children.toArray(children)
  const trackRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // El scroll es un sistema externo (evento del DOM): se escucha para sincronizar
  // el dot activo al deslizar a mano.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    function handleScroll() {
      let nearest = 0
      let minDistance = Number.POSITIVE_INFINITY
      for (let index = 0; index < track.children.length; index += 1) {
        const distance = Math.abs(track.children[index].offsetLeft - track.scrollLeft)
        if (distance < minDistance) {
          minDistance = distance
          nearest = index
        }
      }
      setActiveIndex(nearest)
    }

    track.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => track.removeEventListener('scroll', handleScroll)
  }, [items.length])

  function imagesPerView() {
    const track = trackRef.current
    const first = track?.firstElementChild
    if (!track || !first || !first.offsetWidth || !track.clientWidth) return 1
    return Math.max(1, Math.round(track.clientWidth / first.offsetWidth))
  }

  function scrollToIndex(index) {
    const track = trackRef.current
    const child = track?.children[index]
    if (!track || !child) return
    setActiveIndex(index)
    const left = child.offsetLeft - track.offsetLeft
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left, behavior: 'smooth' })
    } else {
      track.scrollLeft = left
    }
  }

  function handlePrev() {
    scrollToIndex(Math.max(0, activeIndex - imagesPerView()))
  }

  function handleNext() {
    scrollToIndex(Math.min(items.length - 1, activeIndex + imagesPerView()))
  }

  const single = items.length <= 1

  return (
    <div className="carousel" role="group" aria-label={label}>
      <div className="carousel__viewport">
        {!single && (
          <button
            type="button"
            className="carousel__arrow carousel__arrow--prev"
            aria-label="Anterior"
            onClick={handlePrev}
          >
            ‹
          </button>
        )}
        <div className="carousel__track" ref={trackRef}>
          {items}
        </div>
        {!single && (
          <button
            type="button"
            className="carousel__arrow carousel__arrow--next"
            aria-label="Siguiente"
            onClick={handleNext}
          >
            ›
          </button>
        )}
      </div>
      {!single && (
        <div className="carousel__dots">
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              className={
                index === activeIndex ? 'carousel__dot carousel__dot--active' : 'carousel__dot'
              }
              aria-label={`Ver imagen ${index + 1} de ${items.length}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel
