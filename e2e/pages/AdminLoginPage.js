export class AdminLoginPage {
  constructor(page) {
    this.page = page
    this.email = page.getByLabel('Email')
    this.password = page.getByLabel('Contraseña')
    this.submit = page.getByRole('button', { name: 'Entrar' })
    this.error = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/admin/login')
  }

  async login(email, password) {
    await this.email.fill(email)
    await this.password.fill(password)
    await this.submit.click()
  }
}
