import { test, expect } from '@playwright/test'
import { PortfolioHomePage } from './pages/PortfolioHomePage.js'
import { PaintingPage } from './pages/PaintingPage.js'
import { DesignPage } from './pages/DesignPage.js'
import { IllustrationPage } from './pages/IllustrationPage.js'
import { ContactPage } from './pages/ContactPage.js'
import { mockApi } from './support/apiMocks.js'

test.describe('recorrido del portfolio', () => {
  test('la portada muestra hero de fondo y el menú', async ({ page }) => {
    await mockApi(page)
    const home = new PortfolioHomePage(page)
    await home.goto()

    await expect(home.hero).toBeVisible()
    await expect(home.nav).toBeVisible()
    await expect(home.nav.getByRole('link', { name: 'Pintura' })).toBeVisible()
  })

  test('Pintura lista las colecciones en la columna lateral y selecciona la primera', async ({ page }) => {
    await mockApi(page)
    const painting = new PaintingPage(page)
    await painting.goto()

    await expect(painting.collectionHeading('Serie Azul')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Serie Roja' })).toBeVisible()
  })

  test('seleccionar una colección muestra sus obras y abre el lightbox', async ({ page }) => {
    await mockApi(page)
    const painting = new PaintingPage(page)
    await painting.goto()

    await painting.selectCollection('Serie Roja')

    await expect(page.getByRole('heading', { name: 'Serie Roja' })).toBeVisible()
    await page.getByRole('button', { name: 'Rojo apagado' }).click()
    await expect(painting.lightbox()).toBeVisible()
  })

  test('el enlace Exhibiciones abre la página de exposiciones', async ({ page }) => {
    await mockApi(page)
    const painting = new PaintingPage(page)
    await painting.goto()

    await painting.exhibitionsLink().click()

    await expect(page.getByRole('heading', { name: 'Expo 2023' })).toBeVisible()
    await expect(page.getByText('Valencia')).toBeVisible()
  })

  test('Diseño lista las categorías y muestra los proyectos de la seleccionada', async ({ page }) => {
    await mockApi(page)
    const design = new DesignPage(page)
    await design.goto()

    await expect(page.getByRole('button', { name: 'Packaging y Expositores' })).toBeVisible()

    await design.selectSubcategory('Imagen corporativa')

    await expect(design.image('Logo')).toBeVisible()
  })

  test('Ilustración abre la galería completa', async ({ page }) => {
    await mockApi(page)
    const illustration = new IllustrationPage(page)
    await illustration.goto()

    await expect(illustration.image('Ilustración 1')).toBeVisible()
  })

  test('Biografía muestra texto y fotografía', async ({ page }) => {
    await mockApi(page)
    await page.goto('/biography')

    await expect(page.getByText('Nací en 1970')).toBeVisible()
    await expect(page.getByRole('img', { name: 'Fotografía de Antonio Tello' })).toBeVisible()
  })

  test('Contacto valida campos y muestra éxito', async ({ page }) => {
    await mockApi(page)
    const contact = new ContactPage(page)
    await contact.goto()

    await contact.submit()
    await expect(page.getByText(/nombre es obligatorio/i)).toBeVisible()

    await contact.fill('Ana', 'ana@example.com', 'Hola', 'Quiero una obra')
    await contact.submit()

    await expect(page.getByText(/mensaje enviado/i)).toBeVisible()
  })

  test('un error de API muestra un estado recuperable', async ({ page }) => {
    await mockApi(page)
    await page.route('**/api/v1/collections', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Error', code: 'INTERNAL_ERROR' }) }),
    )

    const painting = new PaintingPage(page)
    await painting.goto()

    await expect(page.getByText(/no se pudieron cargar las colecciones/i)).toBeVisible()
  })

  test('Contacto con 502 EMAIL_ERROR muestra error, no éxito', async ({ page }) => {
    await mockApi(page, { contactStatus: 502 })
    const contact = new ContactPage(page)
    await contact.goto()

    await contact.fill('Ana', 'ana@example.com', 'Hola', 'Mensaje')
    await contact.submit()

    await expect(page.getByText(/no se pudo enviar/i)).toBeVisible()
    await expect(page.getByText(/mensaje enviado/i)).not.toBeVisible()
  })

  test('Biografía ausente (404) muestra sin biografía', async ({ page }) => {
    await mockApi(page, { biographyStatus: 404 })
    await page.goto('/biography')

    await expect(page.getByText(/sin biografía/i)).toBeVisible()
  })
})
