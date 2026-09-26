import { expect } from '@playwright/test'
import { AdminCrudPage } from './AdminCrudPage.js'

export class AdminIllustrationsPage extends AdminCrudPage {
  constructor(page) {
    super(page, {
      path: '/admin/illustrations',
      root: 'admin-illustrations',
      newLabel: 'Nueva ilustración',
    })
  }

  /**
   * @param {{ title: string, description?: string, imagePath?: string, published?: boolean }} illustration
   */
  async create({ title, description, imagePath, published }) {
    await this.openCreate()
    await this.fillText('Título', title)
    if (description) await this.fillText('Descripción', description)
    if (imagePath) await this.uploadImage('Imagen', imagePath)
    if (published) await this.check('Publicada')
    await this.save()
    await expect(this.cell(title)).toBeVisible()
  }
}
