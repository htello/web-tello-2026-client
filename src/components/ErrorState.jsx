import './ErrorState.scss'

const ErrorState = ({ message = 'No se pudieron cargar los datos.' }) => (
  <p className="error-state" role="alert">
    {message}
  </p>
)

export default ErrorState
