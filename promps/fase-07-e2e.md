# Fase 7: E2E del Recorrido del Portfolio 

## Resultado Final
Playwright cubre el hero de Home, el menú, el recorrido de Pintura, Diseño, Ilustración, Contacto y estados de API.

## Paso 1: Instalar y configurar

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

**Prompt para la IA:**
```
Configura playwright.config.js.
- tests en e2e/
- solo Chromium
- webServer con pnpm dev en el puerto 5173
- screenshots en fallos
- reporter HTML
- baseURL http://127.0.0.1:5173
```

## Paso 2: Page Objects

Crea:
- `e2e/pages/PortfolioHomePage.js`: hero de fondo, menú y navegación.
- `e2e/pages/PaintingPage.js`: sliders por colección, enlace de Exhibiciones, galería de colección y lightbox.
- `e2e/pages/DesignPage.js`: sliders por subcategoría y galería seleccionada.
- `e2e/pages/IllustrationPage.js`: galería directa de ilustraciones.
- `e2e/pages/ContactPage.js`: campos, submit y alertas.

Usa `getByRole`, `getByLabel` y `data-testid` solo cuando no exista un selector semántico.

## Paso 3: Tests E2E

**Prompt para la IA:**
```
Crea e2e/portfolio-journey.spec.js con estos escenarios:
1. La portada muestra una única imagen de fondo a pantalla completa y el menú.
2. El visitante entra en Pintura y ve un slider por cada colección, uno debajo del otro.
3. Al seleccionar una colección ve únicamente su galería.
4. El enlace Exhibiciones abre la página de exposiciones.
5. El visitante entra en Diseño, selecciona una subcategoría y ve su galería.
6. Ilustración abre directamente la galería completa.
7. Biografía muestra texto y fotografía del artista.
8. Contacto valida campos y muestra éxito tras POST 201.
9. Un error de API muestra un estado recuperable.
10. Contacto con error de envío (502 EMAIL_ERROR) muestra error, no éxito.
11. Biografía ausente (404) muestra el estado "sin biografía".

Mockea la API cuando el test deba ser determinista y limpia el estado entre tests.
```

## Paso 4: Ejecutar
```bash
pnpm test:e2e
pnpm exec playwright show-report
```

## Verificación
```bash
pnpm test:run
pnpm test:e2e
pnpm build
```
