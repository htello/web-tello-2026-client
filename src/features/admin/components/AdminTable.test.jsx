import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminTable from './AdminTable.jsx'

const columns = [
  { key: 'title', header: 'Título' },
  { key: 'year', header: 'Año', render: (row) => `(${row.year})` },
]

const rows = [
  { id: 1, title: 'Obra A', year: 2001 },
  { id: 2, title: 'Obra B', year: 2002 },
]

const rowLabel = (row) => row.title

describe('AdminTable', () => {
  afterEach(cleanup)

  it('renderiza cabeceras y datos de las columnas', () => {
    render(<AdminTable columns={columns} rows={rows} />)

    expect(screen.getByRole('columnheader', { name: 'Título' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Año' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Obra A' })).toBeInTheDocument()
  })

  it('usa la función render de la columna cuando existe', () => {
    render(<AdminTable columns={columns} rows={rows} />)

    expect(screen.getByRole('cell', { name: '(2001)' })).toBeInTheDocument()
  })

  it('muestra el estado de carga', () => {
    render(<AdminTable columns={columns} rows={rows} loading />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('muestra el estado vacío con su mensaje', () => {
    render(<AdminTable columns={columns} rows={[]} emptyMessage="Sin colecciones." />)

    expect(screen.getByText('Sin colecciones.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('no renderiza la columna de acciones sin manejadores', () => {
    render(<AdminTable columns={columns} rows={rows} />)

    expect(screen.queryByRole('columnheader', { name: 'Acciones' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('expone acciones editar y borrar accesibles y llama con la fila', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(
      <AdminTable columns={columns} rows={rows} rowLabel={rowLabel} onEdit={onEdit} onDelete={onDelete} />,
    )

    await user.click(screen.getByRole('button', { name: 'Editar Obra B' }))
    await user.click(screen.getByRole('button', { name: 'Borrar Obra A' }))

    expect(onEdit).toHaveBeenCalledWith(rows[1], 1)
    expect(onDelete).toHaveBeenCalledWith(rows[0], 0)
  })

  it('expone acciones subir y bajar, deshabilitadas en los extremos', async () => {
    const user = userEvent.setup()
    const onMoveUp = vi.fn()
    const onMoveDown = vi.fn()
    render(
      <AdminTable
        columns={columns}
        rows={rows}
        rowLabel={rowLabel}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />,
    )

    expect(screen.getByRole('button', { name: 'Subir Obra A' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Bajar Obra B' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Bajar Obra A' }))
    await user.click(screen.getByRole('button', { name: 'Subir Obra B' }))

    expect(onMoveDown).toHaveBeenCalledWith(rows[0], 0)
    expect(onMoveUp).toHaveBeenCalledWith(rows[1], 1)
  })
})
