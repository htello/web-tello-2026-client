import './MasterDetail.scss'

/**
 * Layout master-detail: columna lateral de elementos seleccionables
 * (nav + botones con aria-current) y panel de detalle como <section>.
 *
 * @param {{ items: Array<{ id: string|number, title: string }>, selectedId: string|number, onSelect: (id: string|number) => void, label: string, detailClassName?: string, children: import('react').ReactNode }} props
 */
const MasterDetail = ({ items, selectedId, onSelect, label, detailClassName = '', children }) => (
  <div className="master-detail">
    <nav className="master-detail__sidebar" aria-label={label}>
      <ul className="master-detail__items">
        {items.map(({ id, title }) => (
          <li key={id}>
            <button
              type="button"
              className={
                id === selectedId
                  ? 'master-detail__item master-detail__item--active'
                  : 'master-detail__item'
              }
              aria-current={id === selectedId ? 'true' : undefined}
              onClick={() => onSelect(id)}
            >
              {title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
    <section
      className={
        detailClassName ? `master-detail__detail ${detailClassName}` : 'master-detail__detail'
      }
    >
      {children}
    </section>
  </div>
)

export default MasterDetail
