import './SectionHeader.scss'

const SectionHeader = ({ title, subtitle }) => (
  <header className="section-header">
    <h2 className="section-header__title">{title}</h2>
    {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
  </header>
)

export default SectionHeader
