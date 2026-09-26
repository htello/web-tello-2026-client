import { expect } from '@playwright/test'
import { AdminCrudPage } from './AdminCrudPage.js'

export class AdminDesignPage extends AdminCrudPage {
  constructor(page) {
    super(page, {
      path: '/admin/design',
      root: 'admin-design',
      newLabel: 'Nuevo proyecto',
    })
    this.subcategoryFilter = page.getByLabel('Filtrar por subcategoría')
  }

  /**
   * @param {{ title: string, subcategory: string, description?: string, imagePath?: string, published?: boolean }} project
   */
  async create({ title, subcategory, description, imagePath, published }) {
    await this.openCreate()
    await this.fillText('Título', title)
    await this.selectOptionByLabel('Subcategoría', subcategory)
    if (description) await this.fillText('Descripción', description)
    if (imagePath) await this.uploadImage('Imagen', imagePath)
    if (published) await this.check('Publicado')
    await this.save()
    await expect(this.cell(title)).toBeVisible()
  }

  async update(title, { nextTitle, subcategory }) {
    await this.openEdit(title)
    if (nextTitle) await this.fillText('Título', nextTitle)
    if (subcategory) await this.selectOptionByLabel('Subcategoría', subcategory)
    await this.save()
    if (nextTitle) await expect(this.cell(nextTitle)).toBeVisible()
  }

  async filterBySubcategory(label) {
    await this.subcategoryFilter.selectOption({ label })
  }
}
