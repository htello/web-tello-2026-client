import { expect } from '@playwright/test'
import { AdminCrudPage } from './AdminCrudPage.js'

export class AdminExhibitionsPage extends AdminCrudPage {
  constructor(page) {
    super(page, {
      path: '/admin/exhibitions',
      root: 'admin-exhibitions',
      newLabel: 'Nueva exhibición',
    })
  }

  /**
   * @param {{ title: string, date: string, endDate?: string, location?: string, description?: string, imagePaths?: string[], published?: boolean }} exhibition
   */
  async create({ title, date, endDate, location, description, imagePaths = [], published }) {
    await this.openCreate()
    await this.fillText('Título', title)
    await this.fillText('Fecha', date)
    if (endDate) await this.fillText('Fecha de fin', endDate)
    if (location) await this.fillText('Localización', location)
    if (description) await this.fillText('Descripción', description)
    if (imagePaths.length > 0) await this.uploadImages(imagePaths)
    if (published) await this.check('Publicada')
    await this.save()
    await expect(this.cell(title)).toBeVisible()
  }

  async update(title, { nextTitle, location }) {
    await this.openEdit(title)
    if (nextTitle) await this.fillText('Título', nextTitle)
    if (location) await this.fillText('Localización', location)
    await this.save()
    if (nextTitle) await expect(this.cell(nextTitle)).toBeVisible()
  }
}
