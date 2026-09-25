import { expect } from '@playwright/test'

/**
 * Biografía: recurso único (POST si no existe, PUT parcial si existe).
 * No tiene borrado ni reorder, así que no extiende AdminCrudPage.
 */
export class AdminBiographyPage {
  constructor(page) {
    this.page = page
    this.form = page.locator('.admin-biography__form')
    this.heading = this.form.getByRole('heading')
    this.content = page.getByLabel('Contenido', { exact: true })
    this.photo = page.getByLabel('Foto del artista', { exact: true })
    this.saved = page.locator('.admin-biography__saved')
  }

  async goto() {
    await this.page.goto('/admin/biography')
    await expect(this.heading).toBeVisible()
  }

  async currentContent() {
    return this.content.inputValue()
  }

  /**
   * Guarda un contenido nuevo y espera el feedback accesible.
   * @param {string} content
   * @param {{ imagePath?: string }} [options]
   */
  async save(content, { imagePath } = {}) {
    await this.content.fill(content)
    if (imagePath) {
      await this.photo.setInputFiles(imagePath)
      await expect(this.form.getByRole('img', { name: 'Foto del artista subida' })).toBeVisible()
    }
    await this.form.getByRole('button', { name: 'Guardar', exact: true }).click()
    await expect(this.saved).toHaveText('Biografía guardada.')
  }
}
