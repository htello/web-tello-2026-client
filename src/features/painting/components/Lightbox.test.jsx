import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Lightbox from './Lightbox.jsx'

describe('Lightbox', () => {
  afterEach(() => {
    cleanup()
  })

  it('no renderiza nada cuando está cerrado', () => {
    render(<Lightbox isOpen={false} image={{ src: 'https://example.com/x.jpg', alt: 'X' }} onClose={() => {}} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('muestra la imagen y el diálogo accesible al abrir', () => {
    render(<Lightbox isOpen image={{ src: 'https://example.com/x.jpg', alt: 'Obra X' }} onClose={() => {}} />)

    expect(screen.getByRole('dialog', { name: 'Obra X' })).toBeInTheDocument()
    const img = screen.getByRole('img', { name: 'Obra X' })
    expect(img).toHaveAttribute('draggable', 'false')
  })

  it('cierra con el botón close', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Lightbox isOpen image={{ src: 'https://example.com/x.jpg', alt: 'Obra X' }} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /cerrar/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('cierra al pulsar Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Lightbox isOpen image={{ src: 'https://example.com/x.jpg', alt: 'Obra X' }} onClose={onClose} />)

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('mueve el foco al diálogo al abrir', () => {
    render(<Lightbox isOpen image={{ src: 'https://example.com/x.jpg', alt: 'Obra X' }} onClose={() => {}} />)

    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('mantiene el foco atrapado al pulsar Tab', async () => {
    const user = userEvent.setup()
    render(<Lightbox isOpen image={{ src: 'https://example.com/x.jpg', alt: 'Obra X' }} onClose={() => {}} />)

    const close = screen.getByRole('button', { name: /cerrar/i })
    close.focus()
    await user.tab()

    expect(close).toHaveFocus()
  })

  it('devuelve el foco al botón que lo abrió al cerrarse', async () => {
    const user = userEvent.setup()
    const Harness = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Abrir obra
          </button>
          <Lightbox
            isOpen={open}
            image={{ src: 'https://example.com/x.jpg', alt: 'Obra X' }}
            onClose={() => setOpen(false)}
          />
        </>
      )
    }
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Abrir obra' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Abrir obra' })).toHaveFocus()
  })
})
