export class PaintingPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/pintura')
  }

  collectionHeading(name) {
    return this.page.getByRole('heading', { name })
  }

  async selectCollection(name) {
    await this.page.getByRole('button', { name }).click()
  }

  exhibitionsLink() {
    return this.page.getByRole('link', { name: 'Ver exposiciones' })
  }

  lightbox() {
    return this.page.getByRole('dialog')
  }
}
