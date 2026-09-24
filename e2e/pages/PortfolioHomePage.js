export class PortfolioHomePage {
  constructor(page) {
    this.page = page
    this.nav = page.getByRole('navigation', { name: 'Navegación principal' })
    this.hero = page.locator('.home-hero')
  }

  async goto() {
    await this.page.goto('/')
  }

  async clickSection(name) {
    await this.nav.getByRole('link', { name }).click()
  }
}
