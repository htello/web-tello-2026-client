export class DesignPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/design')
  }

  async selectSubcategory(label) {
    await this.page.getByRole('button', { name: label }).click()
  }

  image(alt) {
    return this.page.getByRole('img', { name: alt })
  }
}
