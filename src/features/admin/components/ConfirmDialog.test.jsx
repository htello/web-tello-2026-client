import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from './ConfirmDialog.jsx'

describe('ConfirmDialog', () => {
  afterEach(cleanup)

  it('no se renderiza cuando está cerrado', () => {
    render(<ConfirmDialog open={false} title="¿Borrar?" onConfirm={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('muestra título y mensaje con role=dialog y aria-modal', () => {
    render(
      <ConfirmDialog
        open
        title="¿Borrar obra?"
        message="Esta acción no se puede deshacer."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('¿Borrar obra?')
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument()
  })

  it('mueve el foco al botón de confirmación al abrirse', async () => {
    render(
      <ConfirmDialog open title="¿Borrar?" confirmLabel="Borrar" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Borrar' })).toHaveFocus(),
    )
  })

  it('llama a onConfirm y a onCancel desde sus botones', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="¿Borrar?" onConfirm={onConfirm} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('cancela con la tecla Escape', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="¿Borrar?" onConfirm={vi.fn()} onCancel={onCancel} />)

    await user.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('atrapa el foco dentro del diálogo al pulsar Tab', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <button type="button">Fuera</button>
        <ConfirmDialog open title="¿Borrar?" onConfirm={vi.fn()} onCancel={vi.fn()} />
      </div>,
    )

    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveFocus()

    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()

    expect(screen.getByRole('button', { name: 'Fuera' })).not.toHaveFocus()
  })

  it('cancela al hacer clic en el fondo', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog open title="¿Borrar?" onConfirm={vi.fn()} onCancel={onCancel} />,
    )

    await user.click(document.querySelector('.confirm-dialog__backdrop'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('no cancela al hacer clic dentro del diálogo', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog open title="¿Borrar?" message="Mensaje" onConfirm={vi.fn()} onCancel={onCancel} />,
    )

    await user.click(screen.getByText('Mensaje'))

    expect(onCancel).not.toHaveBeenCalled()
  })

  it('devuelve el foco al elemento que lo abrió al cerrarse', async () => {
    const user = userEvent.setup()
    const Harness = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Borrar obra
          </button>
          <ConfirmDialog
            open={open}
            title="¿Borrar?"
            onConfirm={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          />
        </>
      )
    }
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Borrar obra' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveFocus())

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Borrar obra' })).toHaveFocus()
  })
})
