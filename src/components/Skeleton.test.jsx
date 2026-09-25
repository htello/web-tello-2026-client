import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import Skeleton from './Skeleton.jsx'
import PaintingCardSkeleton from './PaintingCardSkeleton.jsx'
import CollectionSkeleton from './CollectionSkeleton.jsx'
import GallerySkeleton from './GallerySkeleton.jsx'

describe('Skeleton', () => {
  afterEach(cleanup)

  it('renderiza la variante text con role=status por defecto', () => {
    render(<Skeleton />)
    expect(screen.getByRole('status', { name: 'Cargando…' })).toHaveClass('skeleton--text')
  })

  it('renderiza la variante rectangular', () => {
    render(<Skeleton variant="rectangular" />)
    expect(screen.getByRole('status')).toHaveClass('skeleton--rectangular')
  })

  it('renderiza la variante circular', () => {
    render(<Skeleton variant="circular" />)
    expect(screen.getByRole('status')).toHaveClass('skeleton--circular')
  })

  it('en modo decorativo se oculta a lectores de pantalla', () => {
    const { container } = render(<Skeleton decorative />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('aplica width, height y clase adicional', () => {
    render(<Skeleton variant="rectangular" width="200px" height="100px" className="extra" />)
    const skeleton = screen.getByRole('status')
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' })
    expect(skeleton).toHaveClass('extra')
  })
})

describe('Skeletons compuestos', () => {
  afterEach(cleanup)

  it('PaintingCardSkeleton es decorativo', () => {
    const { container } = render(<PaintingCardSkeleton />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('GallerySkeleton anuncia la carga una sola vez y repite tarjetas', () => {
    render(<GallerySkeleton count={3} />)
    const gallery = screen.getByRole('status', { name: 'Cargando galería…' })
    expect(gallery.querySelectorAll('.painting-card-skeleton')).toHaveLength(3)
    const hint = screen.getByText('Cargando…')
    expect(hint).toHaveAttribute('aria-hidden', 'true')
  })

  it('CollectionSkeleton anuncia la carga e incluye título y tarjetas', () => {
    render(<CollectionSkeleton count={2} />)
    const collection = screen.getByRole('status', { name: 'Cargando colección…' })
    expect(collection.querySelector('.collection-skeleton__title')).toBeInTheDocument()
    expect(collection.querySelectorAll('.painting-card-skeleton')).toHaveLength(2)
    expect(screen.getByText('Cargando…')).toHaveAttribute('aria-hidden', 'true')
  })
})
