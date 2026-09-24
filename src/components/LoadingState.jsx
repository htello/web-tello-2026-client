import './LoadingState.scss'

const LoadingState = ({ message = 'Cargando…' }) => (
  <p className="loading-state" role="status">
    {message}
  </p>
)

export default LoadingState
