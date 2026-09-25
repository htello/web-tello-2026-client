import { expect, test } from '@playwright/test'
import { ContactPage } from './pages/ContactPage.js'

/**
 * Contacto contra el server real (sin mocks): verifica el payload enviado, el
 * 201 del contrato y que el éxito se muestra en la UI. El server local envía el
 * email de verdad (SMTP configurado), por eso el asunto va marcado como E2E.
 */
test.describe('contacto contra el server real', () => {
  test('envía el mensaje y muestra el éxito real del server', async ({ page }) => {
    const contact = new ContactPage(page)
    const payload = {
      name: 'E2E Playwright',
      email: 'e2e-contacto@test.com',
      subject: `E2E contacto ${Date.now()}`,
      message: 'Mensaje automático generado por el test E2E de contacto.',
    }

    await contact.goto()

    await test.step('la validación cliente bloquea el envío sin llamar a la red', async () => {
      let contacted = false
      page.on('request', (request) => {
        if (request.url().includes('/api/v1/contact')) contacted = true
      })

      await contact.submit()

      await expect(page.getByText(/nombre es obligatorio/i)).toBeVisible()
      expect(contacted).toBe(false)
    })

    await contact.fill(payload.name, payload.email, payload.subject, payload.message)

    const [response] = await Promise.all([
      page.waitForResponse(
        (candidate) => candidate.url().includes('/api/v1/contact') && candidate.request().method() === 'POST',
      ),
      contact.submit(),
    ])

    await test.step('el payload enviado coincide con el contrato', async () => {
      expect(response.request().postDataJSON()).toEqual(payload)
    })

    await test.step('el server responde 201 y la UI muestra el éxito', async () => {
      expect(response.status()).toBe(201)
      expect(await response.json()).toEqual({
        data: { message: 'Mensaje enviado correctamente' },
      })
      await expect(page.getByText(/mensaje enviado/i)).toBeVisible()
      await expect(page.getByText(/no se pudo enviar/i)).toHaveCount(0)
    })
  })
})
