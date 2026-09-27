export class IllustrationPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/ilustracion')
  }

  image(alt) {
    return this.page.getByRole('img', { name: alt })
  }
}
