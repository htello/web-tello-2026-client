import { useState } from 'react'
import './EntityForm.scss'

/**
 * Construye el estado inicial de valores a partir de los campos.
 * @param {Array<object>} fields
 * @param {object} [initialValues]
 * @returns {Record<string, unknown>}
 */
const buildInitialValues = (fields, initialValues = {}) =>
  Object.fromEntries(
    fields.map((field) => [
      field.name,
      initialValues[field.name] ?? (field.type === 'checkbox' ? false : ''),
    ]),
  )

/**
 * Valida un campo numérico (rango min/max).
 * @param {object} field
 * @param {unknown} value valor no vacío
 * @returns {string} mensaje de error ('' si es válido)
 */
const validateNumber = (field, value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return `${field.label} debe ser un número`
  if (field.min !== undefined && numeric < field.min) {
    return `${field.label} no puede ser menor que ${field.min}`
  }
  if (field.max !== undefined && numeric > field.max) {
    return `${field.label} no puede ser mayor que ${field.max}`
  }
  return ''
}

/**
 * Valida un campo y devuelve el mensaje de error ('' si es válido).
 * @param {object} field definición del campo
 * @param {unknown} value valor actual
 * @returns {string}
 */
const validateField = (field, value) => {
  const isEmptyValue = value === '' || value === undefined || value === null

  if (field.type === 'checkbox') {
    return field.validate ? (field.validate(value) ?? '') : ''
  }

  if (field.required && isEmptyValue) return `${field.label} es obligatorio`
  if (isEmptyValue) return ''

  if (field.type === 'number') {
    const numberError = validateNumber(field, value)
    if (numberError) return numberError
  }

  if (field.validate) return field.validate(value) ?? ''
  return ''
}

/**
 * Convierte los valores del formulario al tipo que espera la API.
 * @param {Array<object>} fields
 * @param {Record<string, unknown>} values
 * @returns {Record<string, unknown>}
 */
const buildPayload = (fields, values) =>
  Object.fromEntries(
    fields.map((field) => {
      const value = values[field.name]
      if (field.type === 'checkbox') return [field.name, Boolean(value)]
      if (field.type === 'number') return [field.name, value === '' ? null : Number(value)]
      if (field.type === 'select') {
        const option = field.options?.find((item) => String(item.value) === String(value))
        return [field.name, option ? option.value : value]
      }
      return [field.name, String(value).trim()]
    }),
  )

/**
 * Renderiza el control del campo según su tipo.
 * @param {object} field
 * @param {string} id
 * @param {Record<string, unknown>} values
 * @param {Record<string, string>} errors
 * @param {(field: object) => (event: object) => void} onChange
 * @returns {import('react').ReactNode}
 */
const renderControl = (field, id, values, errors, onChange) => {
  const shared = {
    id,
    name: field.name,
    className: 'entity-form__control',
    'aria-invalid': errors[field.name] ? 'true' : undefined,
    'aria-describedby': errors[field.name] ? `${id}-error` : undefined,
    onChange: onChange(field),
  }
  const value = values[field.name]

  if (field.type === 'textarea') {
    return <textarea {...shared} rows={4} value={value ?? ''} />
  }
  if (field.type === 'select') {
    return (
      <select {...shared} value={value ?? ''}>
        <option value="">Selecciona…</option>
        {(field.options ?? []).map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
  if (field.type === 'checkbox') {
    return <input {...shared} type="checkbox" checked={Boolean(value)} />
  }
  return <input {...shared} type={field.type ?? 'text'} value={value ?? ''} />
}

/**
 * Formulario de entidad configurable para los CRUD del panel admin.
 *
 * - Campos por configuración (text, number, textarea, select, checkbox) con
 *   validación cliente (requeridos, rango numérico, `validate` personalizado).
 * - Submit deshabilitado mientras guarda.
 * - Errores del server visibles (message + code) cuando `onSubmit` devuelve
 *   `{ ok: false, error }`; en éxito llama a `onSuccess(data)`.
 * - Modo edición precargando `initialValues`.
 *
 * @param {object} props
 * @param {Array<{ name: string, label: string, type?: string, required?: boolean, min?: number, max?: number, options?: Array<{ value: unknown, label: string }>, validate?: (value: unknown) => string | null | undefined }>} props.fields
 * @param {object} [props.initialValues] valores precargados (modo edición)
 * @param {(values: Record<string, unknown>) => Promise<{ ok: boolean, data?: unknown, error?: Error }>} props.onSubmit
 * @param {(data: unknown) => void} [props.onSuccess]
 * @param {() => void} [props.onCancel] si se pasa, muestra el botón de cancelar
 * @param {string} [props.submitLabel]
 * @param {string} [props.cancelLabel]
 */
const EntityForm = ({
  fields,
  initialValues,
  onSubmit,
  onSuccess,
  onCancel,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
}) => {
  const [values, setValues] = useState(() => buildInitialValues(fields, initialValues))
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field) => (event) => {
    const value = field.type === 'checkbox' ? event.target.checked : event.target.value
    setValues((current) => ({ ...current, [field.name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {}
    for (const field of fields) {
      const message = validateField(field, values[field.name])
      if (message) nextErrors[field.name] = message
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSaving(true)
    setServerError(null)
    try {
      const result = await onSubmit(buildPayload(fields, values))
      if (result?.ok) {
        onSuccess?.(result.data ?? null)
      } else if (result?.error) {
        setServerError(result.error)
      }
    } catch (error) {
      setServerError(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit} noValidate>
      {fields.map((field) => {
        const id = `entity-form-${field.name}`
        return (
          <div key={field.name} className="entity-form__field">
            {field.type === 'checkbox' ? (
              <label className="entity-form__checkbox" htmlFor={id}>
                {renderControl(field, id, values, errors, handleChange)}
                {field.label}
              </label>
            ) : (
              <>
                <label className="entity-form__label" htmlFor={id}>
                  {field.label}
                </label>
                {renderControl(field, id, values, errors, handleChange)}
              </>
            )}
            {errors[field.name] && (
              <p className="entity-form__error" id={`${id}-error`}>
                {errors[field.name]}
              </p>
            )}
          </div>
        )
      })}

      {serverError && (
        <p className="entity-form__server-error" role="alert">
          {serverError.message}
          {serverError.code ? ` (${serverError.code})` : ''}
        </p>
      )}

      <div className="entity-form__actions">
        {onCancel && (
          <button
            type="button"
            className="entity-form__cancel"
            onClick={onCancel}
            disabled={isSaving}
          >
            {cancelLabel}
          </button>
        )}
        <button type="submit" className="entity-form__submit" disabled={isSaving}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default EntityForm
