export class ContactPage {
  constructor(page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/contact')
  }

  async fill(name, email, subject, message) {
    await this.page.getByLabel('Nombre').fill(name)
    await this.page.getByLabel('Email').fill(email)
    await this.page.getByLabel('Asunto').fill(subject)
    await this.page.getByLabel('Mensaje').fill(message)
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Enviar' }).click()
  }
}
