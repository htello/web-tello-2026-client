import './Pagination.scss'

/**
 * Navegación de paginación server-side: botón de página anterior/siguiente con
 * deshabilitado en los extremos y resumen «Página X de Y · N {noun}».
 *
 * @param {{
 *   meta: { total: number, page: number, pages: number },
 *   label: string,
 *   noun: string,
 *   onPageChange: (page: number) => void,
 * }} props
 */
const Pagination = ({ meta, label, noun, onPageChange }) => (
  <nav className="pagination" aria-label={label}>
    <button
      type="button"
      className="pagination__page"
      disabled={meta.page <= 1}
      onClick={() => onPageChange(meta.page - 1)}
    >
      Página anterior
    </button>
    <p className="pagination__info">
      Página {meta.page} de {meta.pages} · {meta.total} {noun}
    </p>
    <button
      type="button"
      className="pagination__page"
      disabled={meta.page >= meta.pages}
      onClick={() => onPageChange(meta.page + 1)}
    >
      Página siguiente
    </button>
  </nav>
)

export default Pagination
