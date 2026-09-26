import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from './Toast.jsx'

describe('Toast', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('variante error usa role=alert y aria-live assertive', () => {
    render(<Toast variant="error" message="Ha fallado" />)
    const toast = screen.getByRole('alert')
    expect(toast).toHaveTextContent('Ha fallado')
    expect(toast).toHaveAttribute('aria-live', 'assertive')
    expect(toast).toHaveClass('toast--error')
  })

  it('variante success usa role=status y aria-live polite', () => {
    render(<Toast variant="success" message="Guardado" />)
    const toast = screen.getByRole('status')
    expect(toast).toHaveAttribute('aria-live', 'polite')
    expect(toast).toHaveClass('toast--success')
  })

  it('variante info es la predeterminada', () => {
    render(<Toast message="Información" />)
    expect(screen.getByRole('status')).toHaveClass('toast--info')
  })

  it('el cierre manual llama a onClose', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Toast variant="success" message="Guardado" onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Cerrar notificación' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('se cierra automáticamente tras la duración indicada', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<Toast message="Info" onClose={onClose} duration={4000} />)
    vi.advanceTimersByTime(3999)
    expect(onClose).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('la duración por defecto es 5000 ms', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<Toast message="Info" onClose={onClose} />)
    vi.advanceTimersByTime(5000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('con duration 0 no se cierra automáticamente', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<Toast message="Info" onClose={onClose} duration={0} />)
    vi.advanceTimersByTime(60_000)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('cancela el temporizador al desmontarse', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const { unmount } = render(<Toast message="Info" onClose={onClose} />)
    unmount()
    vi.advanceTimersByTime(5000)
    expect(onClose).not.toHaveBeenCalled()
  })
})
