/* eslint-disable sonarjs/no-skipped-tests -- los saltos son condicionales (credenciales E2E del .env) */
import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { AdminBiographyPage } from './pages/AdminBiographyPage.js'
import { AdminCollectionsPage } from './pages/AdminCollectionsPage.js'
import { AdminDesignPage } from './pages/AdminDesignPage.js'
import { AdminExhibitionsPage } from './pages/AdminExhibitionsPage.js'
import { AdminIllustrationsPage } from './pages/AdminIllustrationsPage.js'
import { AdminLoginPage } from './pages/AdminLoginPage.js'
import { AdminPaintingsPage } from './pages/AdminPaintingsPage.js'
import { AdminPanelPage } from './pages/AdminPanelPage.js'
import { AdminUsersPage } from './pages/AdminUsersPage.js'
import { apiRequest, cleanupE2EData, loginAdmin } from './support/apiClient.js'

const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url))

const FIXTURE_IMAGE = fixture('pintura-e2e.png')
const FIXTURE_IMAGE_2 = fixture('obra-e2e-2.png')
const FIXTURE_EXPO_1 = fixture('expo-e2e-1.png')
const FIXTURE_EXPO_2 = fixture('expo-e2e-2.png')

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD
const hasCredentials = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)
const SKIP_REASON = 'Faltan E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD en .env (ver .env.example)'

/** Identificador único de la ejecución: evita colisiones con datos previos. */
const RUN_ID = Date.now()

/** Valor de prueba para provocar el 400 de email duplicado (nunca una credencial real). */
const CLAVE_DUPLICADA = 'Clave-Duplicada!1'

test.describe('panel admin: acceso', () => {
  test('sin sesión /admin redirige a /admin/login', async ({ page }) => {
    const login = new AdminLoginPage(page)
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin\/login$/)
    await expect(login.email).toBeVisible()
    await expect(login.password).toBeVisible()
  })
})

test.describe.serial('panel admin: journey extremo a extremo (server real)', () => {
  test.skip(!hasCredentials, SKIP_REASON)

  test('login → crear → reordenar → editar → borrar → logout', async ({ page }) => {
    const collection = `E2E Journey Col ${RUN_ID}`
    const paintingA = `E2E Journey Obra A ${RUN_ID}`
    const paintingB = `E2E Journey Obra B ${RUN_ID}`
    const paintingBEdited = `${paintingB} editada`

    const login = new AdminLoginPage(page)
    const panel = new AdminPanelPage(page)
    const collections = new AdminCollectionsPage(page)
    const paintings = new AdminPaintingsPage(page)

    await test.step('login con credenciales válidas → dashboard', async () => {
      await login.goto()
      await login.login(ADMIN_EMAIL, ADMIN_PASSWORD)

      await expect(panel.dashboardTitle).toBeVisible()
      await expect(page).toHaveURL(/\/admin$/)
    })

    await test.step('crear colección', async () => {
      await panel.goToSection('Colecciones')
      await collections.create({ title: collection })
    })

    await test.step('crear dos pinturas (year + collectionId) con imagen subida', async () => {
      await panel.goToSection('Pinturas')
      await paintings.create({ title: paintingA, collection, year: 2024, imagePath: FIXTURE_IMAGE })
      await paintings.create({ title: paintingB, collection, year: 2025, imagePath: FIXTURE_IMAGE })
    })

    await test.step('reordenar pinturas (bajar) y verificar el orden', async () => {
      await paintings.expectOrder(paintingA, paintingB)
      await paintings.move(paintingA, 'down')
      await paintings.expectOrder(paintingB, paintingA)
    })

    await test.step('editar la pintura (PUT parcial)', async () => {
      await paintings.rename(paintingB, paintingBEdited)
      await expect(paintings.cell(paintingB)).toHaveCount(0)
    })

    await test.step('la sección Usuarios lista sin exponer contraseñas', async () => {
      await panel.goToSection('Usuarios')

      await expect(page.getByRole('heading', { name: 'Usuarios', level: 1 })).toBeVisible()
      await expect(page.getByRole('cell', { name: ADMIN_EMAIL, exact: true })).toBeVisible()
      await expect(page.locator('input[type="password"]')).toHaveCount(0)
      expect(await page.locator('body').innerText()).not.toContain(ADMIN_PASSWORD)
    })

    await test.step('borrar las pinturas con confirmación', async () => {
      await panel.goToSection('Pinturas')
      await paintings.remove(paintingA)
      await paintings.remove(paintingBEdited)
    })

    await test.step('borrar la colección (limpieza del journey)', async () => {
      await panel.goToSection('Colecciones')
      await collections.remove(collection)
    })

    await test.step('logout → vuelve a /admin/login', async () => {
      await panel.logout()

      await expect(page).toHaveURL(/\/admin\/login$/)
      await expect(login.email).toBeVisible()
    })

    await test.step('tras el logout /admin vuelve a redirigir al login', async () => {
      await page.goto('/admin/users')

      await expect(page).toHaveURL(/\/admin\/login$/)
    })
  })
})

test.describe.serial('panel admin: CRUD completo por entidad (server real)', () => {
  test.skip(!hasCredentials, SKIP_REASON)

  /** Sesión real obtenida por API e inyectada en sessionStorage antes de cada test. */
  let session = null
  /** Contenido original de la biografía, para restaurarla si el test falla a mitad. */
  let originalBiography = null

  test.beforeAll(async () => {
    session = await loginAdmin()
  })

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      (raw) => window.sessionStorage.setItem('admin_session', raw),
      JSON.stringify(session),
    )
  })

  test.afterAll(async () => {
    // Reutiliza el token de la sesión: POST /auth/login tiene rate limit 10/min.
    const token = session?.token
    if (originalBiography !== null && token) {
      await apiRequest('PUT', '/admin/biography', { token, body: { content: originalBiography } })
    }
    await cleanupE2EData({ token })
  })

  test('colecciones: crear con portada, editar, publicar, reordenar y borrar', async ({ page }) => {
    const collections = new AdminCollectionsPage(page)
    const first = `E2E Col A ${RUN_ID}`
    const second = `E2E Col B ${RUN_ID}`
    const secondEdited = `${second} editada`

    await collections.goto()
    await collections.create({
      title: first,
      description: 'Descripción de la colección E2E',
      imagePath: FIXTURE_IMAGE,
      published: true,
    })
    await collections.create({ title: second })

    await test.step('la portada subida persiste y se precarga al editar', async () => {
      await collections.openEdit(first)
      await collections.expectPersistedImage('Imagen de portada')
      await collections.cancel()
    })

    await test.step('edición parcial del título', async () => {
      await collections.rename(second, secondEdited)
      await expect(collections.cell(second)).toHaveCount(0)
    })

    await test.step('toggle inline de publicación (PUT parcial)', async () => {
      expect(await collections.toggle(secondEdited, 'Publicar')).toBe(true)
      expect(await collections.toggle(secondEdited, 'Publicar')).toBe(false)
    })

    await test.step('reorder con subir/bajar', async () => {
      await collections.expectOrder(first, secondEdited)
      await collections.move(first, 'down')
      await collections.expectOrder(secondEdited, first)
      await collections.move(first, 'up')
      await collections.expectOrder(first, secondEdited)
    })

    await test.step('borrado con confirmación', async () => {
      await collections.remove(first)
      await collections.remove(secondEdited)
    })
  })

  test('pinturas: crear con imagen, filtrar, toggles, reordenar, editar y borrar', async ({ page }) => {
    const collections = new AdminCollectionsPage(page)
    const paintings = new AdminPaintingsPage(page)
    const collection = `E2E Col Pinturas ${RUN_ID}`
    const first = `E2E Obra A ${RUN_ID}`
    const second = `E2E Obra B ${RUN_ID}`
    const secondEdited = `${second} editada`

    await collections.goto()
    await collections.create({ title: collection })

    await paintings.goto()
    await paintings.create({
      title: first,
      collection,
      year: 2024,
      imagePath: FIXTURE_IMAGE,
    })
    await paintings.create({ title: second, collection, year: 2025, imagePath: FIXTURE_IMAGE_2 })

    await test.step('el filtro por colección aísla las obras creadas', async () => {
      await paintings.filterByCollection(collection)
      await expect(paintings.titleCells).toHaveCount(2)
      await expect(paintings.cell(first)).toBeVisible()
      await expect(paintings.cell(second)).toBeVisible()

      await paintings.filterByCollection('Todas')
      expect((await paintings.titles()).length).toBeGreaterThan(2)
    })

    await test.step('toggle inline de publicada', async () => {
      expect(await paintings.toggle(second, 'Publicar')).toBe(true)
    })

    await test.step('reorder con subir/bajar', async () => {
      await paintings.expectOrder(first, second)
      await paintings.move(second, 'up')
      await paintings.expectOrder(second, first)
    })

    await test.step('edición parcial de título y año con imagen persistida', async () => {
      await paintings.openEdit(second)
      await paintings.expectPersistedImage('Imagen')
      await paintings.fillText('Título', secondEdited)
      await paintings.fillText('Año', '2026')
      await paintings.save()

      await expect(paintings.cell(secondEdited)).toBeVisible()
      await expect(paintings.row(secondEdited)).toContainText('2026')
      await expect(paintings.cell(second)).toHaveCount(0)
    })

    await test.step('borrado con confirmación y limpieza de la colección', async () => {
      await paintings.remove(first)
      await paintings.remove(secondEdited)
      await collections.goto()
      await collections.remove(collection)
    })
  })

  test('exhibiciones: crear con varias imágenes, quitar una, editar y borrar', async ({ page }) => {
    const exhibitions = new AdminExhibitionsPage(page)
    const title = `E2E Expo ${RUN_ID}`
    const edited = `${title} editada`

    await exhibitions.goto()
    await exhibitions.create({
      title,
      date: '2026-03-01',
      endDate: '2026-03-31',
      location: 'Valencia',
      description: 'Exposición de prueba E2E',
      imagePaths: [FIXTURE_EXPO_1, FIXTURE_EXPO_2],
      published: true,
    })

    await test.step('las dos imágenes persisten y se puede quitar una', async () => {
      await exhibitions.openEdit(title)
      await expect(exhibitions.form.getByRole('img', { name: 'Imagen 1' })).toBeVisible()
      await expect(exhibitions.form.getByRole('img', { name: 'Imagen 2' })).toBeVisible()

      await exhibitions.removeListImage(2)
      await exhibitions.save()

      await exhibitions.openEdit(title)
      await expect(exhibitions.form.getByRole('img', { name: 'Imagen 1' })).toBeVisible()
      await expect(exhibitions.form.getByRole('img', { name: 'Imagen 2' })).toHaveCount(0)
      await exhibitions.cancel()
    })

    await test.step('edición parcial de título y localización', async () => {
      await exhibitions.update(title, { nextTitle: edited, location: 'Madrid' })
      await expect(exhibitions.row(edited)).toContainText('Madrid')
    })

    await test.step('toggle inline de publicación', async () => {
      expect(await exhibitions.toggle(edited, 'Publicar')).toBe(false)
    })

    await test.step('borrado con confirmación', async () => {
      await exhibitions.remove(edited)
    })
  })

  test('diseño: crear con subcategoría e imagen, filtrar, editar y borrar', async ({ page }) => {
    const design = new AdminDesignPage(page)
    const title = `E2E Diseño ${RUN_ID}`
    const edited = `${title} editado`

    await design.goto()
    await design.create({
      title,
      subcategory: 'Cartelería',
      description: 'Proyecto de diseño E2E',
      imagePath: FIXTURE_IMAGE,
      published: true,
    })

    await test.step('el filtro por subcategoría aísla el proyecto', async () => {
      await design.filterBySubcategory('Cartelería')
      await expect(design.cell(title)).toBeVisible()

      await design.filterBySubcategory('Editorial')
      await expect(design.cell(title)).toHaveCount(0)

      await design.filterBySubcategory('Todas')
      await expect(design.cell(title)).toBeVisible()
    })

    await test.step('edición parcial de título y subcategoría', async () => {
      await design.update(title, { nextTitle: edited, subcategory: 'Editorial' })
      await expect(design.row(edited)).toContainText('Editorial')
    })

    await test.step('toggle inline de publicado', async () => {
      expect(await design.toggle(edited, 'Publicar')).toBe(false)
    })

    await test.step('borrado con confirmación', async () => {
      await design.remove(edited)
    })
  })

  test('ilustración: crear con imagen, editar y borrar', async ({ page }) => {
    const illustrations = new AdminIllustrationsPage(page)
    const title = `E2E Ilustración ${RUN_ID}`
    const edited = `${title} editada`

    await illustrations.goto()
    await illustrations.create({
      title,
      description: 'Ilustración de prueba E2E',
      imagePath: FIXTURE_IMAGE_2,
      published: true,
    })

    await test.step('la imagen persiste al editar', async () => {
      await illustrations.openEdit(title)
      await illustrations.expectPersistedImage('Imagen')
      await illustrations.cancel()
    })

    await test.step('toggle inline de publicada', async () => {
      expect(await illustrations.toggle(title, 'Publicar')).toBe(false)
    })

    await test.step('edición parcial del título', async () => {
      await illustrations.rename(title, edited)
    })

    await test.step('borrado con confirmación', async () => {
      await illustrations.remove(edited)
    })
  })

  test('biografía: edición parcial con restauración del contenido original', async ({ page }) => {
    const biography = new AdminBiographyPage(page)
    await biography.goto()

    await expect(biography.heading).toContainText('Editar biografía')
    originalBiography = await biography.currentContent()
    const marked = `${originalBiography} [E2E ${RUN_ID}]`

    await biography.save(marked)
    await expect(biography.content).toHaveValue(marked)

    await biography.save(originalBiography)
    await expect(biography.content).toHaveValue(originalBiography)
    originalBiography = null
  })

  test('usuarios: registro, edición, cambio de contraseña y borrado', async ({ page }) => {
    const users = new AdminUsersPage(page)
    const email = `e2e-${RUN_ID}@test.com`
    const claveInicial = 'Clave-Inicial!23'
    const claveNueva = 'Otra-Clave!456'

    await users.goto()
    await expect(users.info).toContainText('usuarios')
    await expect(users.previousPage).toBeDisabled()

    await test.step('registro de un administrador desechable', async () => {
      await users.register({ name: `E2E Admin ${RUN_ID}`, email, password: claveInicial })
      await expect(users.row(email)).toContainText('ADMIN')
    })

    await test.step('edición parcial de nombre y rol', async () => {
      await users.edit(email, { name: `E2E Admin editado ${RUN_ID}`, role: 'USER' })
      await expect(users.row(email)).toContainText('USER')
    })

    await test.step('cambio de contraseña: la nueva permite iniciar sesión (contrato real)', async () => {
      await users.changePassword(email, claveNueva)

      const { status, body } = await apiRequest('POST', '/auth/login', {
        body: { email, password: claveNueva },
      })
      expect(status, body?.error ?? '').toBe(200)
    })

    await test.step('borrado con confirmación', async () => {
      await users.remove(email)
      await expect(users.cell(email)).toHaveCount(0)
    })

    await test.step('aviso explícito al intentar borrar la cuenta propia', async () => {
      await users.expectSelfDeleteWarning(ADMIN_EMAIL)
    })
  })

  test('usuarios: email duplicado muestra el error real del server', async ({ page }) => {
    const users = new AdminUsersPage(page)
    await users.goto()

    await users.register(
      { name: 'Duplicado', email: ADMIN_EMAIL, password: CLAVE_DUPLICADA },
      { expectSuccess: false },
    )

    await expect(users.alert).toContainText('El email ya está registrado')
    await expect(users.alert).toContainText('VALIDATION_ERROR')
    await users.cancel()
  })

  test('usuarios: contraseña débil se bloquea sin llamar al server', async ({ page }) => {
    const users = new AdminUsersPage(page)
    const registros = []
    page.on('request', (request) => {
      if (request.url().includes('/admin/users/register')) registros.push(request.url())
    })
    await users.goto()

    await users.openCreate()
    await users.fillText('Email', `e2e-debil-${RUN_ID}@test.com`)
    await users.form.getByLabel('Contraseña', { exact: true }).fill('debil')
    await users.form.getByRole('button', { name: 'Registrar', exact: true }).click()

    await expect(page.getByText(/al menos 8 caracteres/)).toBeVisible()
    await expect(users.alert).toHaveCount(0)
    expect(registros).toEqual([])
    await users.cancel()
  })
})
