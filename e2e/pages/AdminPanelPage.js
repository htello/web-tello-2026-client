export class AdminPanelPage {
  constructor(page) {
    this.page = page
    this.nav = page.getByRole('navigation', { name: 'Administración' })
    this.dashboardTitle = page.getByRole('heading', { name: 'Panel de administración', level: 1 })
    this.logoutButton = page.getByRole('button', { name: 'Cerrar sesión' })
  }

  async goto(path = '/admin') {
    await this.page.goto(path)
  }

  async goToSection(label) {
    await this.nav.getByRole('link', { name: label }).click()
  }

  async logout() {
    await this.logoutButton.click()
  }
}
