import { expect } from '@playwright/test'
import { AdminCrudPage } from './AdminCrudPage.js'

export class AdminPaintingsPage extends AdminCrudPage {
  constructor(page) {
    super(page, {
      path: '/admin/paintings',
      root: 'admin-paintings',
      newLabel: 'Nueva pintura',
    })
    this.collectionFilter = page.getByLabel('Filtrar por colección')
  }

  /**
   * @param {{ title: string, collection: string, year: number, imagePath?: string, published?: boolean }} painting
   */
  async create({ title, collection, year, imagePath, published }) {
    await this.openCreate()
    await this.fillText('Título', title)
    await this.selectOptionByLabel('Colección', collection)
    await this.fillText('Año', String(year))
    if (imagePath) await this.uploadImage('Imagen', imagePath)
    if (published) await this.check('Publicada')
    await this.save()
    await expect(this.cell(title)).toBeVisible()
  }

  async filterByCollection(label) {
    await this.collectionFilter.selectOption({ label })
  }
}
