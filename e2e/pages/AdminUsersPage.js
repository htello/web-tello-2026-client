import { expect } from '@playwright/test'
import { AdminCrudPage } from './AdminCrudPage.js'

export class AdminUsersPage extends AdminCrudPage {
  constructor(page) {
    super(page, {
      path: '/admin/users',
      root: 'admin-users',
      newLabel: 'Nuevo administrador',
    })
    this.pagination = page.getByRole('navigation', { name: 'Paginación de usuarios' })
    this.info = this.pagination.locator('.admin-users__info')
    this.previousPage = this.pagination.getByRole('button', { name: 'Página anterior' })
    this.nextPage = this.pagination.getByRole('button', { name: 'Página siguiente' })
  }

  /** POST /admin/users/register. Con `expectSuccess: false` el form sigue abierto. */
  async register({ name, email, password }, { expectSuccess = true } = {}) {
    await this.openCreate()
    if (name) await this.fillText('Nombre', name)
    await this.fillText('Email', email)
    await this.form.getByLabel('Contraseña', { exact: true }).fill(password)
    await this.form.getByRole('button', { name: 'Registrar', exact: true }).click()
    if (expectSuccess) {
      await expect(this.form).toBeHidden()
      await expect(this.cell(email)).toBeVisible()
    }
  }

  /** PUT /admin/users/:id parcial. */
  async edit(email, { name, role }) {
    await this.openEdit(email)
    if (name) await this.fillText('Nombre', name)
    if (role) await this.selectOptionByLabel('Rol', role)
    await this.save()
    if (name) await expect(this.cell(name)).toBeVisible()
  }

  /** PUT /admin/users/:id/password. */
  async changePassword(email, password) {
    await this.action(`Cambiar contraseña de ${email}`).click()
    await this.form.getByLabel('Nueva contraseña', { exact: true }).fill(password)
    await this.save()
  }

  async expectSelfDeleteWarning(email) {
    await this.action(`Borrar ${email}`).click()
    const dialog = this.page.getByRole('dialog')
    await expect(dialog).toContainText('Vas a borrar tu propia cuenta')
    await dialog.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(dialog).toBeHidden()
  }
}
