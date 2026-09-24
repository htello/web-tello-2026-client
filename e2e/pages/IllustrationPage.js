export class IllustrationPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/illustration')
  }

  image(alt) {
    return this.page.getByRole('img', { name: alt })
  }
}
