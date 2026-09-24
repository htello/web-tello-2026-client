export class PaintingPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/painting')
  }

  collectionHeading(name) {
    return this.page.getByRole('heading', { name })
  }

  async selectCollection(name) {
    await this.page.getByRole('link', { name }).click()
  }

  exhibitionsLink() {
    return this.page.getByRole('link', { name: 'Exhibiciones' })
  }

  lightbox() {
    return this.page.getByRole('dialog')
  }
}
