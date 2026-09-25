import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
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

  it('renderiza un checkbox accesible por toggle que refleja el estado de la fila', () => {
    const toggleRows = [
      { id: 1, title: 'Obra A', isPublished: true, isFeatured: false },
      { id: 2, title: 'Obra B', isPublished: false, isFeatured: true },
    ]
    const toggles = [
      { field: 'isPublished', header: 'Publicada', ariaLabel: 'Publicar' },
      { field: 'isFeatured', header: 'Destacada', ariaLabel: 'Destacar' },
    ]
    render(
      <AdminTable
        columns={columns}
        rows={toggleRows}
        rowLabel={rowLabel}
        toggles={toggles}
        onToggle={vi.fn()}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Publicada' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Destacada' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Publicar Obra A' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Destacar Obra A' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Publicar Obra B' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Destacar Obra B' })).toBeChecked()
  })

  it('llama a onToggle con la fila, el campo y el siguiente valor', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    const toggleRows = [{ id: 2, title: 'Obra B', isPublished: false }]
    render(
      <AdminTable
        columns={columns}
        rows={toggleRows}
        rowLabel={rowLabel}
        toggles={[{ field: 'isPublished', header: 'Publicada', ariaLabel: 'Publicar' }]}
        onToggle={onToggle}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Publicar Obra B' }))

    expect(onToggle).toHaveBeenCalledWith(toggleRows[0], 'isPublished', true)
  })

  it('deshabilita los toggles sin onToggle y usa el rowLabel por defecto', () => {
    render(
      <AdminTable
        columns={columns}
        rows={[{ id: 5, title: 'Obra C' }]}
        toggles={[{ field: 'isPublished', header: 'Publicada', ariaLabel: 'Publicar' }]}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'Publicar 5' })).toBeDisabled()
  })

  it('no renderiza checkboxes sin la prop toggles', () => {
    render(<AdminTable columns={columns} rows={rows} rowLabel={rowLabel} onEdit={vi.fn()} />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('devuelve el foco al botón de la fila movida tras reordenar', async () => {
    const user = userEvent.setup()
    render(
      <AdminTable
        columns={columns}
        rows={rows}
        rowLabel={rowLabel}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Bajar Obra A' }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Bajar Obra A' })).toHaveFocus(),
    )
  })
})
