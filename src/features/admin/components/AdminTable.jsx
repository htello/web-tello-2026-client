import { useRef } from 'react'
import EmptyState from '@/components/EmptyState.jsx'
import LoadingState from '@/components/LoadingState.jsx'
import './AdminTable.scss'

/**
 * Tabla de administración con columnas configurables y acciones por fila.
 *
 * - `loading` muestra LoadingState y `rows` vacío muestra EmptyState.
 * - Las acciones (editar/borrar/subir/bajar) solo se renderizan si se pasa su
 *   manejador, con nombres accesibles construidos desde `rowLabel`.
 * - Subir está deshabilitado en la primera fila y Bajar en la última.
 * - Tras mover una fila, el foco sigue a su botón (las filas intercambian
 *   posiciones bajo el cursor; sin esto, el siguiente clic pulsaría el botón
 *   de otra fila y deshacería el movimiento percibido).
 *
 * @param {object} props
 * @param {Array<{ key: string, header: string, render?: (row: object) => import('react').ReactNode }>} props.columns
 * @param {object[]} props.rows filas con `id`
 * @param {boolean} [props.loading]
 * @param {string} [props.emptyMessage]
 * @param {(row: object) => string} [props.rowLabel] etiqueta accesible de la fila
 * @param {(row: object, index: number) => void} [props.onEdit]
 * @param {(row: object, index: number) => void} [props.onDelete]
 * @param {(row: object, index: number) => void} [props.onMoveUp]
 * @param {(row: object, index: number) => void} [props.onMoveDown]
 */
const AdminTable = ({
  columns,
  rows,
  loading = false,
  emptyMessage = 'No hay elementos.',
  rowLabel = (row) => String(row.id),
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const moveButtonRefs = useRef({})

  const registerMoveRef = (key) => (node) => {
    moveButtonRefs.current[key] = node
  }

  /**
   * Ejecuta el movimiento y devuelve el foco al botón de la fila movida
   * (tras el re-render con claves estables el nodo viaja con su fila).
   * @param {'up' | 'down'} direction
   * @param {object} row
   * @param {number} index
   * @param {(row: object, index: number) => void} handler
   */
  const handleMove = (direction, row, index, handler) => {
    handler(row, index)
    const focusMovedButton = () => {
      moveButtonRefs.current[`${row.id}-${direction}`]?.focus()
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(focusMovedButton)
    } else {
      focusMovedButton()
    }
  }

  if (loading) return <LoadingState message="Cargando elementos…" />
  if (rows.length === 0) return <EmptyState message={emptyMessage} />

  const hasActions = Boolean(onEdit || onDelete || onMoveUp || onMoveDown)

  return (
    <table className="admin-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col" className="admin-table__header">
              {column.header}
            </th>
          ))}
          {hasActions && (
            <th scope="col" className="admin-table__header">
              Acciones
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id} className="admin-table__row">
            {columns.map((column) => (
              <td key={column.key} className="admin-table__cell">
                {column.render ? column.render(row) : row[column.key]}
              </td>
            ))}
            {hasActions && (
              <td className="admin-table__cell admin-table__cell--actions">
                {onMoveUp && (
                  <button
                    type="button"
                    ref={registerMoveRef(`${row.id}-up`)}
                    className="admin-table__action"
                    aria-label={`Subir ${rowLabel(row)}`}
                    disabled={index === 0}
                    onClick={() => handleMove('up', row, index, onMoveUp)}
                  >
                    ↑
                  </button>
                )}
                {onMoveDown && (
                  <button
                    type="button"
                    ref={registerMoveRef(`${row.id}-down`)}
                    className="admin-table__action"
                    aria-label={`Bajar ${rowLabel(row)}`}
                    disabled={index === rows.length - 1}
                    onClick={() => handleMove('down', row, index, onMoveDown)}
                  >
                    ↓
                  </button>
                )}
                {onEdit && (
                  <button
                    type="button"
                    className="admin-table__action"
                    aria-label={`Editar ${rowLabel(row)}`}
                    onClick={() => onEdit(row, index)}
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="admin-table__action admin-table__action--danger"
                    aria-label={`Borrar ${rowLabel(row)}`}
                    onClick={() => onDelete(row, index)}
                  >
                    Borrar
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default AdminTable
