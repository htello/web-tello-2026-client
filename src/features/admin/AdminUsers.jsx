import { useState } from 'react'
import ErrorState from '@/components/ErrorState.jsx'
import { EMAIL_REGEX } from '@/constants/businessRules.js'
import { useAdminResource } from '@/hooks/useAdminResource.js'
import { useAuth } from '@/hooks/useAuth.js'
import { adminApi } from '@/services/adminApi.js'
import { getChangedFields, stripEmptyFields } from '@/utils/formPayload.js'
import { validatePassword } from '@/utils/validatePassword.js'
import AdminTable from './components/AdminTable.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import EntityForm from './components/EntityForm.jsx'
import './AdminUsers.scss'

/** Usuarios por página de GET /admin/users (el server admite hasta 100). */
const PAGE_LIMIT = 20

const PASSWORD_HINT = 'Mínimo 8 caracteres, una mayúscula y un símbolo.'

const validateEmail = (value) => (EMAIL_REGEX.test(value) ? null : 'Email no válido')

const passwordField = (label) => ({
  name: 'password',
  label,
  type: 'password',
  required: true,
  autoComplete: 'new-password',
  validate: validatePassword,
})

/** RegisterRequest (openapi): email y password obligatorios; name opcional. */
const REGISTER_FIELDS = [
  { name: 'name', label: 'Nombre', type: 'text' },
  { name: 'email', label: 'Email', type: 'email', required: true, validate: validateEmail },
  passwordField('Contraseña'),
]

/** UserUpdateRequest (openapi): parcial, mínimo 1 campo. */
const UPDATE_FIELDS = [
  { name: 'name', label: 'Nombre', type: 'text' },
  { name: 'email', label: 'Email', type: 'email', validate: validateEmail },
  {
    name: 'role',
    label: 'Rol',
    type: 'select',
    options: [
      { value: 'ADMIN', label: 'ADMIN' },
      { value: 'USER', label: 'USER' },
    ],
  },
]

/** PasswordResetRequest (openapi): password obligatorio. */
const PASSWORD_FIELDS = [passwordField('Nueva contraseña')]

const FORM_TITLES = {
  create: 'Crear administrador',
  edit: 'Editar usuario',
  password: 'Cambiar contraseña',
}

const FIELDS_BY_MODE = {
  create: REGISTER_FIELDS,
  edit: UPDATE_FIELDS,
  password: PASSWORD_FIELDS,
}

const MESSAGE_SELF_DELETE =
  'Vas a borrar tu propia cuenta: perderás el acceso al panel y esta acción no se puede deshacer.'

/**
 * CRUD de usuarios del panel admin: listado paginado, registro de
 * administradores, edición parcial, cambio de contraseña y borrado con
 * confirmación (aviso explícito si el objetivo es la cuenta en sesión).
 *
 * La contraseña solo viaja en el payload y se edita en un `input type=password`
 * con `autoComplete="new-password"`: nunca se renderiza como texto ni se loguea.
 */
const AdminUsers = () => {
  const [page, setPage] = useState(1)
  const { user } = useAuth()
  const { items, meta, loading, error, update, remove, saveError, reload } = useAdminResource(
    'users',
    { params: { page, limit: PAGE_LIMIT } },
  )
  const [formMode, setFormMode] = useState(null)
  const [target, setTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const closeForm = () => {
    setFormMode(null)
    setTarget(null)
  }

  const openCreate = () => {
    setTarget(null)
    setFormMode('create')
  }

  const openEdit = (row) => {
    setTarget(row)
    setFormMode('edit')
  }

  const openPassword = (row) => {
    setTarget(row)
    setFormMode('password')
  }

  /**
   * POST /admin/users/register: crea un ADMIN con el token de la sesión.
   * @param {Record<string, unknown>} values
   * @returns {Promise<{ ok: boolean, data?: unknown, error?: Error }>}
   */
  const handleRegister = async (values) => {
    try {
      const result = await adminApi.registerUser(stripEmptyFields(values))
      reload()
      return { ok: true, data: result.data }
    } catch (registerError) {
      return { ok: false, error: registerError }
    }
  }

  /**
   * PUT /admin/users/:id parcial: solo los campos modificados (mínimo 1).
   * @param {Record<string, unknown>} values
   * @returns {Promise<{ ok: boolean, data?: unknown, error?: Error }>}
   */
  const handleUpdate = (values) => {
    const changed = getChangedFields(target, values)
    if (Object.keys(changed).length === 0) return Promise.resolve({ ok: true, data: target })
    return update(target.id, changed)
  }

  /**
   * PUT /admin/users/:id/password.
   * @param {Record<string, unknown>} values
   * @returns {Promise<{ ok: boolean, error?: Error }>}
   */
  const handleChangePassword = async (values) => {
    try {
      await adminApi.updateUserPassword(target.id, { password: values.password })
      return { ok: true }
    } catch (passwordError) {
      return { ok: false, error: passwordError }
    }
  }

  const handleSubmit = (values) => {
    if (formMode === 'create') return handleRegister(values)
    if (formMode === 'password') return handleChangePassword(values)
    return handleUpdate(values)
  }

  const handleDelete = async () => {
    const row = deleteTarget
    setDeleteTarget(null)
    await remove(row.id)
  }

  const isSelf = (row) => row.id === user?.id

  const columns = [
    { key: 'email', header: 'Email' },
    { key: 'name', header: 'Nombre' },
    { key: 'role', header: 'Rol' },
    {
      key: 'password',
      header: 'Contraseña',
      render: (row) => (
        <button
          type="button"
          className="admin-users__password"
          aria-label={`Cambiar contraseña de ${row.email}`}
          onClick={() => openPassword(row)}
        >
          Cambiar
        </button>
      ),
    },
  ]

  return (
    <section className="admin-users">
      <header className="admin-users__header">
        <h1 className="admin-users__title">Usuarios</h1>
        <button type="button" className="admin-users__new" onClick={openCreate}>
          Nuevo administrador
        </button>
      </header>

      {error && <ErrorState message={error.message} />}
      {saveError && !formMode && <ErrorState message={saveError.message} />}

      {formMode && (
        <section className="admin-users__form" aria-labelledby="users-form-title">
          <h2 id="users-form-title" className="admin-users__form-title">
            {FORM_TITLES[formMode]}
          </h2>
          {formMode !== 'edit' && <p className="admin-users__hint">{PASSWORD_HINT}</p>}
          <EntityForm
            key={`${formMode}-${target?.id ?? 'new'}`}
            fields={FIELDS_BY_MODE[formMode]}
            initialValues={formMode === 'edit' ? target : undefined}
            onSubmit={handleSubmit}
            onSuccess={closeForm}
            onCancel={closeForm}
            submitLabel={formMode === 'create' ? 'Registrar' : 'Guardar'}
          />
        </section>
      )}

      <AdminTable
        columns={columns}
        rows={items}
        loading={loading}
        emptyMessage="No hay usuarios."
        rowLabel={(row) => row.email}
        onEdit={openEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {meta && (
        <nav className="admin-users__pagination" aria-label="Paginación de usuarios">
          <button
            type="button"
            className="admin-users__page"
            disabled={meta.page <= 1}
            onClick={() => setPage(meta.page - 1)}
          >
            Página anterior
          </button>
          <p className="admin-users__info">
            Página {meta.page} de {meta.pages} · {meta.total} usuarios
          </p>
          <button
            type="button"
            className="admin-users__page"
            disabled={meta.page >= meta.pages}
            onClick={() => setPage(meta.page + 1)}
          >
            Página siguiente
          </button>
        </nav>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`¿Borrar el usuario «${deleteTarget?.email ?? ''}»?`}
        message={
          deleteTarget && isSelf(deleteTarget) ? MESSAGE_SELF_DELETE : 'Esta acción no se puede deshacer.'
        }
        confirmLabel="Borrar"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}

export default AdminUsers
