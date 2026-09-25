import { useState } from 'react'
import ErrorState from '@/components/ErrorState.jsx'
import LoadingState from '@/components/LoadingState.jsx'
import { isNotFound } from '@/constants/businessRules.js'
import { useAsyncData } from '@/hooks/useAsyncData.js'
import { adminApi } from '@/services/adminApi.js'
import { api } from '@/services/api.js'
import { getChangedFields, stripEmptyFields } from '@/utils/formPayload.js'
import EntityForm from './components/EntityForm.jsx'
import './AdminBiography.scss'

/** Mínimo de caracteres de `content` exigido por el server (biographySchema). */
const MIN_CONTENT_LENGTH = 10

/** Campos del formulario según el schema BiographyRequest del openapi. */
const BIOGRAPHY_FIELDS = [
  {
    name: 'content',
    label: 'Contenido',
    type: 'textarea',
    required: true,
    validate: (value) =>
      String(value).trim().length >= MIN_CONTENT_LENGTH
        ? ''
        : `El contenido debe tener al menos ${MIN_CONTENT_LENGTH} caracteres`,
  },
  // Foto del artista como URL de texto; ImageUploadField llega en la fase 13.
  { name: 'imageUrl', label: 'Foto del artista (URL)', type: 'text' },
]

/**
 * Gestión de la biografía (recurso único, sin delete ni reorder).
 *
 * - GET /biography: si responde 404 → formulario de creación
 *   (POST /admin/biography); si existe → edición precargada
 *   (PUT /admin/biography, actualización parcial).
 * - Feedback de guardado accesible (role=status) y errores del server
 *   visibles dentro del EntityForm.
 */
const AdminBiography = () => {
  const { data: biography, loading, error, reload } = useAsyncData(async (signal) => {
    try {
      const res = await api.get('/biography', { signal })
      return res.data
    } catch (fetchError) {
      if (isNotFound(fetchError)) return null
      throw fetchError
    }
  })
  const [saved, setSaved] = useState(false)

  if (loading) return <LoadingState message="Cargando biografía…" />
  if (error) return <ErrorState message="No se pudo cargar la biografía." />

  const isEditing = biography !== null

  /**
   * @param {Record<string, unknown>} values payload tipado del EntityForm
   * @returns {Promise<{ ok: boolean, data?: unknown, error?: Error }>}
   */
  const handleSubmit = async (values) => {
    if (!isEditing) {
      const result = await adminApi.createBiography(stripEmptyFields(values))
      return { ok: true, data: result?.data ?? null }
    }
    const changed = getChangedFields(biography, values)
    if (Object.keys(changed).length === 0) return { ok: true, data: biography }
    const result = await adminApi.updateBiography(changed)
    return { ok: true, data: result?.data ?? null }
  }

  const handleSuccess = () => {
    setSaved(true)
    reload()
  }

  return (
    <section className="admin-biography">
      <header className="admin-biography__header">
        <h1 className="admin-biography__title">Biografía</h1>
      </header>

      {saved && (
        <p className="admin-biography__saved" role="status">
          Biografía guardada.
        </p>
      )}

      <section className="admin-biography__form" aria-labelledby="biography-form-title">
        <h2 id="biography-form-title" className="admin-biography__form-title">
          {isEditing ? 'Editar biografía' : 'Crear biografía'}
        </h2>
        <EntityForm
          key={biography?.id ?? 'new'}
          fields={BIOGRAPHY_FIELDS}
          initialValues={biography ?? undefined}
          onSubmit={handleSubmit}
          onSuccess={handleSuccess}
        />
      </section>
    </section>
  )
}

export default AdminBiography
