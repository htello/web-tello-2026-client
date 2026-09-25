import { expect } from '@playwright/test'
import { AdminCrudPage } from './AdminCrudPage.js'

export class AdminCollectionsPage extends AdminCrudPage {
  constructor(page) {
    super(page, {
      path: '/admin/collections',
      root: 'admin-collections',
      newLabel: 'Nueva colección',
    })
  }

  /**
   * @param {{ title: string, description?: string, imagePath?: string, published?: boolean }} collection
   */
  async create({ title, description, imagePath, published }) {
    await this.openCreate()
    await this.fillText('Título', title)
    if (description) await this.fillText('Descripción', description)
    if (imagePath) await this.uploadImage('Imagen de portada', imagePath)
    if (published) await this.check('Publicada')
    await this.save()
    await expect(this.cell(title)).toBeVisible()
  }
}
