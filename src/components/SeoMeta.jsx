import { useEffect } from 'react'
import { ARTIST_NAME, SITE_DESCRIPTION } from '@/constants/businessRules.js'
import heroImage from '@/assets/prueba-camisa-1200.jpg'

/**
 * Actualiza `<title>`, meta description, canonical y Open Graph de la vista.
 *
 * Renderiza `null`: aplica los valores sobre `document.head` con la DOM API
 * (`setAttribute`), que los escapa de forma segura, y reutiliza las etiquetas
 * existentes (nunca duplica). Con `noindex` marca la página para motores de
 * búsqueda y omite canonical/OG; la siguiente vista pública retira la marca.
 *
 * @param {object} props
 * @param {string} props.title título completo de la página
 * @param {string} [props.description] usa SITE_DESCRIPTION si se omite
 * @param {string} [props.path] ruta canónica relativa (p. ej. '/painting')
 * @param {string} [props.image] URL absoluta o ruta del bundle ('/assets/…');
 *   por defecto la imagen del hero
 * @param {boolean} [props.noindex] añade `<meta name="robots" content="noindex, nofollow">`
 */
const SeoMeta = ({ title, description = SITE_DESCRIPTION, path, image, noindex = false }) => {
  useEffect(() => {
    const { origin } = window.location

    document.title = title

    /**
     * @param {'name' | 'property'} attribute
     * @param {string} key
     * @param {string} content
     */
    const upsertMeta = (attribute, key, content) => {
      let tag = document.head.querySelector(`meta[${attribute}="${key}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attribute, key)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow')
      return
    }
    document.head.querySelector('meta[name="robots"]')?.remove()
    if (!path) return

    const canonicalUrl = `${origin}${path}`
    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    const toAbsolute = (url) => (url.startsWith('http') ? url : `${origin}${url}`)

    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:site_name', ARTIST_NAME)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:image', toAbsolute(image ?? heroImage))
  }, [title, description, path, image, noindex])

  return null
}

export default SeoMeta
