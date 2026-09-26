import { expect } from '@playwright/test'

/**
 * Page Object base de las secciones CRUD del panel admin.
 *
 * Expone las primitivas compartidas (formulario basado en EntityForm, tabla
 * AdminTable, ConfirmDialog, campos de imagen simple y múltiple) para que cada
 * vista componga sus propios flujos de alta/edición.
 */
export class AdminCrudPage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {{ path: string, root: string, newLabel: string }} options
   */
  constructor(page, { path, root, newLabel }) {
    this.page = page
    this.path = path
    this.form = page.locator(`.${root}__form`)
    this.newButton = page.getByRole('button', { name: newLabel, exact: true })
    this.titleCells = page.locator('.admin-table__row .admin-table__cell:first-child')
    this.alert = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto(this.path)
    await expect(this.newButton).toBeVisible()
  }

  cell(title) {
    return this.page.getByRole('cell', { name: title, exact: true })
  }

  /** Fila completa de la tabla que contiene la celda `title`. */
  row(title) {
    return this.page.locator('.admin-table__row', {
      has: this.page.getByRole('cell', { name: title, exact: true }),
    })
  }

  action(name) {
    return this.page.getByRole('button', { name, exact: true })
  }

  async titles() {
    return this.titleCells.allInnerTexts()
  }

  async openCreate() {
    await this.newButton.click()
  }

  async openEdit(title) {
    await this.action(`Editar ${title}`).click()
  }

  async fillText(label, value) {
    await this.form.getByLabel(label, { exact: true }).fill(value)
  }

  async selectOptionByLabel(label, optionLabel) {
    await this.form.getByLabel(label, { exact: true }).selectOption({ label: optionLabel })
  }

  async check(label) {
    await this.form.getByRole('checkbox', { name: label, exact: true }).check()
  }

  /** Sube una imagen (ImageUploadField) y espera su previsualización. */
  async uploadImage(label, imagePath) {
    await this.form.getByLabel(label, { exact: true }).setInputFiles(imagePath)
    await expect(this.form.getByRole('img', { name: `${label} subida` })).toBeVisible()
  }

  /** Sube varias imágenes (ImageUploadListField) y espera todas las miniaturas. */
  async uploadImages(imagePaths) {
    await this.form.getByLabel('Añadir imagen').setInputFiles(imagePaths)
    for (let index = 0; index < imagePaths.length; index += 1) {
      await expect(this.form.getByRole('img', { name: `Imagen ${index + 1}` })).toBeVisible()
    }
  }

  async removeListImage(position) {
    await this.form.getByRole('button', { name: `Quitar imagen ${position}` }).click()
    await expect(this.form.getByRole('img', { name: `Imagen ${position}` })).toHaveCount(0)
  }

  /** La imagen ya guardada en el server se precarga en el formulario de edición. */
  async expectPersistedImage(label) {
    await expect(this.form.getByRole('img', { name: `${label} actual` })).toBeVisible()
  }

  async cancel() {
    await this.form.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(this.form).toBeHidden()
  }

  async save(label = 'Guardar') {
    await this.form.getByRole('button', { name: label, exact: true }).click()
    await expect(this.form).toBeHidden()
  }

  async confirmDeletion(title) {
    const dialog = this.page.getByRole('dialog')
    await expect(dialog).toContainText(title)
    await dialog.getByRole('button', { name: 'Borrar', exact: true }).click()
    await expect(dialog).toBeHidden()
  }

  async remove(title) {
    await this.action(`Borrar ${title}`).click()
    await this.confirmDeletion(title)
    await expect(this.cell(title)).toBeHidden()
  }

  async rename(title, nextTitle) {
    await this.openEdit(title)
    await this.fillText('Título', nextTitle)
    await this.save()
    await expect(this.cell(nextTitle)).toBeVisible()
  }

  async move(title, direction) {
    await this.action(`${direction === 'up' ? 'Subir' : 'Bajar'} ${title}`).click()
  }

  /** Espera a que `first` aparezca antes que `second` en la tabla. */
  async expectOrder(first, second) {
    await expect
      .poll(async () => {
        const titles = await this.titles()
        return titles.indexOf(first) - titles.indexOf(second)
      })
      .toBeLessThan(0)
  }

  /** Alterna un checkbox de la tabla y devuelve su nuevo estado. */
  async toggle(title, ariaLabel) {
    const checkbox = this.page.getByRole('checkbox', { name: `${ariaLabel} ${title}`, exact: true })
    const next = !(await checkbox.isChecked())
    await checkbox.click()
    if (next) await expect(checkbox).toBeChecked()
    else await expect(checkbox).not.toBeChecked()
    return next
  }
}
