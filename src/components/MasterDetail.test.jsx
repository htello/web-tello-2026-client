import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MasterDetail from './MasterDetail.jsx'

const items = [
  { id: 'a', title: 'Alpha' },
  { id: 'b', title: 'Beta' },
]

describe('MasterDetail', () => {
  afterEach(cleanup)

  it('renderiza la lista con etiqueta accesible y resalta la selección', () => {
    render(
      <MasterDetail items={items} selectedId="a" onSelect={() => {}} label="Lista de prueba">
        <p>Contenido</p>
      </MasterDetail>,
    )

    const nav = screen.getByRole('navigation', { name: 'Lista de prueba' })
    expect(within(nav).getByRole('button', { name: 'Alpha' })).toHaveAttribute('aria-current', 'true')
    expect(within(nav).getByRole('button', { name: 'Beta' })).not.toHaveAttribute('aria-current')
  })

  it('llama a onSelect con el id pulsado', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <MasterDetail items={items} selectedId="a" onSelect={onSelect} label="Lista de prueba">
        <p>Contenido</p>
      </MasterDetail>,
    )

    await user.click(screen.getByRole('button', { name: 'Beta' }))

    expect(onSelect).toHaveBeenCalledWith('b')
  })

  it('renderiza los children dentro de una section de detalle', () => {
    const { container } = render(
      <MasterDetail
        items={items}
        selectedId="a"
        onSelect={() => {}}
        label="Lista de prueba"
        detailClassName="extra-clase"
      >
        <h2>Título</h2>
        <p>Contenido</p>
      </MasterDetail>,
    )

    const detail = container.querySelector('section.master-detail__detail')
    expect(detail).toBeInTheDocument()
    expect(detail).toHaveClass('extra-clase')
    expect(within(detail).getByRole('heading', { name: 'Título' })).toBeInTheDocument()
    expect(within(detail).getByText('Contenido')).toBeInTheDocument()
  })
})
