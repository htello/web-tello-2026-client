import './MasonryGrid.scss'

const MasonryGrid = ({ label, children }) => (
  <div className="masonry-grid" role="group" aria-label={label}>
    {children}
  </div>
)

export default MasonryGrid
