import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from './Pagination.jsx'

describe('Pagination', () => {
  afterEach(cleanup)

  function renderPagination(overrides = {}) {
    const meta = { total: 21, page: 1, limit: 20, pages: 2, ...overrides.meta }
    const props = {
      meta,
      label: 'Paginación de usuarios',
      noun: 'usuarios',
      onPageChange: vi.fn(),
      ...overrides,
    }
    render(<Pagination {...props} />)
    return props
  }

  it('muestra la página actual, el total de páginas y la cifra de elementos', () => {
    renderPagination()

    const nav = screen.getByRole('navigation', { name: 'Paginación de usuarios' })
    expect(within(nav).getByText('Página 1 de 2 · 21 usuarios')).toBeInTheDocument()
  })

  it('deshabilita la página anterior en la primera página', () => {
    renderPagination()

    const nav = screen.getByRole('navigation', { name: 'Paginación de usuarios' })
    expect(within(nav).getByRole('button', { name: 'Página anterior' })).toBeDisabled()
    expect(within(nav).getByRole('button', { name: 'Página siguiente' })).toBeEnabled()
  })

  it('deshabilita la página siguiente en la última página', () => {
    renderPagination({ meta: { total: 21, page: 2, limit: 20, pages: 2 } })

    const nav = screen.getByRole('navigation', { name: 'Paginación de usuarios' })
    expect(within(nav).getByRole('button', { name: 'Página anterior' })).toBeEnabled()
    expect(within(nav).getByRole('button', { name: 'Página siguiente' })).toBeDisabled()
  })

  it('notifica la página solicitada al pulsar las flechas', async () => {
    const user = userEvent.setup()
    const props = renderPagination({ meta: { total: 21, page: 2, limit: 20, pages: 3 } })

    const nav = screen.getByRole('navigation', { name: 'Paginación de usuarios' })
    await user.click(within(nav).getByRole('button', { name: 'Página siguiente' }))
    expect(props.onPageChange).toHaveBeenLastCalledWith(3)

    await user.click(within(nav).getByRole('button', { name: 'Página anterior' }))
    expect(props.onPageChange).toHaveBeenLastCalledWith(1)
  })
})
