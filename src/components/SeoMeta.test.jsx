import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import SeoMeta from './SeoMeta.jsx'
import { ARTIST_NAME, SITE_DESCRIPTION } from '@/constants/businessRules.js'

const metaContent = (selector) => document.head.querySelector(selector)?.getAttribute('content')

const removeSeoTags = () => {
  document.head
    .querySelectorAll(
      'meta[property^="og:"], meta[name="description"], meta[name="robots"], link[rel="canonical"]',
    )
    .forEach((tag) => tag.remove())
}

describe('SeoMeta', () => {
  afterEach(() => {
    cleanup()
    removeSeoTags()
  })

  it('define el título y las etiquetas SEO y Open Graph básicas', () => {
    render(<SeoMeta title="Pintura — Antonio Tello" path="/painting" />)

    expect(document.title).toBe('Pintura — Antonio Tello')
    expect(metaContent('meta[name="description"]')).toBe(SITE_DESCRIPTION)
    expect(metaContent('meta[property="og:title"]')).toBe('Pintura — Antonio Tello')
    expect(metaContent('meta[property="og:description"]')).toBe(SITE_DESCRIPTION)
    expect(metaContent('meta[property="og:site_name"]')).toBe(ARTIST_NAME)
    expect(metaContent('meta[property="og:type"]')).toBe('website')
    expect(metaContent('meta[property="og:url"]')).toBe(
      `${window.location.origin}/painting`,
    )
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${window.location.origin}/painting`,
    )
    expect(metaContent('meta[property="og:image"]')).toContain('prueba-camisa')
  })

  it('reutiliza las etiquetas sin duplicarlas al cambiar de props', () => {
    const { rerender } = render(<SeoMeta title="A — Antonio Tello" path="/a" />)
    rerender(<SeoMeta title="B — Antonio Tello" description="Nueva" path="/b" />)

    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1)
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(document.title).toBe('B — Antonio Tello')
    expect(metaContent('meta[name="description"]')).toBe('Nueva')
  })

  it('convierte imágenes relativas al bundle en absolutas y respeta las remotas', () => {
    const { rerender } = render(<SeoMeta title="X" path="/x" image="/assets/obra.jpg" />)
    expect(metaContent('meta[property="og:image"]')).toBe(
      `${window.location.origin}/assets/obra.jpg`,
    )

    rerender(<SeoMeta title="X" path="/x" image="https://cdn.example.com/obra.jpg" />)
    expect(metaContent('meta[property="og:image"]')).toBe('https://cdn.example.com/obra.jpg')
  })

  it('conserva intactos los valores con comillas (escapado vía DOM)', () => {
    render(<SeoMeta title={'Obras "azules" — <Antonio>'} path="/quotes" />)

    expect(metaContent('meta[property="og:title"]')).toBe('Obras "azules" — <Antonio>')
  })

  it('aplica noindex y lo retira al volver a una vista pública', () => {
    const { rerender } = render(<SeoMeta title="Panel de administración" noindex />)

    expect(metaContent('meta[name="robots"]')).toBe('noindex, nofollow')
    expect(document.head.querySelector('link[rel="canonical"]')).not.toBeInTheDocument()

    rerender(<SeoMeta title="Pintura — Antonio Tello" path="/painting" />)
    expect(document.head.querySelector('meta[name="robots"]')).not.toBeInTheDocument()
    expect(document.head.querySelector('link[rel="canonical"]')).toBeInTheDocument()
  })
})
