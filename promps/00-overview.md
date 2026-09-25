# Curso por Fases: Portfolio Artístico con IA

## Resumen


**Proyecto final**: Portfolio de Antonio Tello con galería pública y panel de administración
**Stack**: React 19 + JavaScript + Vite + Sass + Vitest + Playwright
**API**: Express + Prisma + PostgreSQL, documentada en `server/docs/openapi.yaml`
**Metodología**: Construcción práctica con TDD donde corresponde

## Flujo Público

- Menú: Pintura, Ilustración, Diseño, Biografía y Contacto.
- Home: una única imagen grande de fondo a pantalla completa con el menú superpuesto.
- Pintura: un slider por colección (uno debajo del otro), galería de colección y acceso a Exhibiciones.
- Diseño: un slider por subcategoría (uno debajo del otro) y galería de la subcategoría seleccionada.
- Ilustración: galería directa con todas las ilustraciones.
- Biografía: texto plano y fotografía del artista.
- Contacto: formulario de nombre, email, asunto y mensaje.

## Estructura de Fases

> Mapeo de historias: **HU17 Galería Pública = fases 1–7** y **HU18 Panel Admin = fases 8–18**.

| # | Fase | Resultado | TDD | Estado |
|---|---|---|---|---|
| 1 | [Setup + Primera Obra](./fase-01-setup.md) | Vite, Sass y PaintingCard | Sí | ✅ 2026-09-24 · `f1ae02a` |
| 2 | [Modelos + Galería](./fase-02-catalog.md) | API client, colecciones y destacadas | No | ✅ 2026-09-24 · `f1ae02a` |
| 3 | [Utilidades del Portfolio](./fase-03-business-logic.md) | Fechas, campos opcionales y protección visual | Sí | ✅ 2026-09-24 · `72101f3` |
| 4 | [Galería, Ficha y Lightbox](./fase-04-gallery-components.md) | Colecciones, pinturas, exposiciones y lightbox | Sí | ✅ 2026-09-24 · `77986e1` |
| 5 | [Estado Público + Biografía](./fase-05-public-state.md) | Estado global de contenido y biografía | Sí | ✅ 2026-09-24 · `64bcd6d` |
| 6 | [Diseño, Ilustración y Contacto](./fase-06-design-illustration-contact.md) | Filtros, galería y formulario de contacto | Sí | ✅ 2026-09-24 · `f29892f` |
| 7 | [E2E del Portfolio](./fase-07-e2e.md) | Recorrido público con Playwright | No | ✅ 2026-09-24 · `9b8c4cf` |
| 8 | [Refactoring](./fase-08-refactoring.md) | Cliente API y componentes compartidos limpios | No | ✅ 2026-09-24 · `a85354d` |
| 9 | [Login Admin + Seguridad](./fase-09-auth-security.md) | JWT, AuthContext y ProtectedRoute | Sí | ✅ 2026-09-24 · `2b2aaf8` |
| 10 | [Panel Admin: Fundación](./fase-10-admin-foundation.md) | adminApi, AdminLayout, hooks/componentes compartidos y dashboard | Sí | ✅ 2026-09-24 · `03608db` |
| 11 | [Panel Admin: CRUD Pintura](./fase-11-admin-painting-crud.md) | Colecciones, pinturas, exhibiciones y reorder | Sí | ✅ 2026-09-24 · `5ebe692` |
| 12 | [Panel Admin: CRUD Contenido](./fase-12-admin-content-crud.md) | Diseño, ilustración y biografía | Sí | ✅ 2026-09-25 · `a282233` |
| 13 | [Panel Admin: Upload](./fase-13-admin-upload.md) | Imagen en 2 pasos integrada en los formularios | Sí | ✅ 2026-09-25 · `f5f0ae7` |
| 14 | [Panel Admin: Usuarios + E2E](./fase-14-admin-users-e2e.md) | Usuarios paginados y journey admin con Playwright | Parcial | ⬜ Pendiente |
| 15 | [Refactor del Admin](./fase-15-admin-refactor.md) | Panel DRY, contrato verificado y cobertura | No | ⬜ Pendiente |
| 16 | [A11y, UX y SEO](./fase-16-a11y-ux.md) | Portfolio y panel accesibles, protegidos y optimizados | Sí | ⬜ Pendiente |
| 17 | [Observabilidad con Sentry](./fase-17-sentry.md) | Errores y API monitorizados | No | ⬜ Pendiente |
| 18 | [Quality Gates + Build Final](./fase-18-quality-gates.md) | Gate de coverage, CI y build de despliegue | No | ⬜ Pendiente |

> Actualizar la columna Estado al cerrar cada fase (fecha + merge a develop).

## Dominios y API

- Pintura: `/api/v1/collections`, `/api/v1/paintings`, `/api/v1/exhibitions`
- Diseño: `/api/v1/design?subcategory=...`
- Ilustración: `/api/v1/illustrations`
- Biografía: `/api/v1/biography`
- Contacto: `POST /api/v1/contact`, rate limit 5 solicitudes/minuto
- Auth: `/api/v1/auth/login` y rutas admin con `Authorization: Bearer <JWT>`
- Upload: `POST /api/v1/admin/upload` con `multipart/form-data`, campo `file` (subida en 2 pasos: la `url` devuelta se envía como `imageUrl`/`coverImage` en el JSON del create/update; NUNCA campos multipart `image` en entidades)
- Salud: `/api/v1/health`

La fuente de verdad de rutas y esquemas es `server/docs/openapi.yaml`. No se deben inventar endpoints ni campos.

## Convenciones de calidad (resumen)

- Cobertura: **100% en `src/services/`, `src/hooks/` y `src/utils/`**; umbral global ≥90%.
- Mocking: `vi.stubGlobal('fetch', ...)`; NUNCA MSW ni llamar a la API real en tests unitarios.

## Comandos Frecuentes

```bash
pnpm dev
pnpm build
pnpm test
pnpm test:run
pnpm test:coverage
pnpm test:e2e
pnpm lint
pnpm quality
pnpm verify
```

## Estructura Final del Frontend

```text
src/
├── app/                 # Router, layout y configuración
├── components/          # LoadingState, ErrorState, Toast, Lightbox
├── features/
│   ├── home/            # Hero y obras destacadas
│   ├── painting/        # Colecciones, fichas y galerías
│   ├── design/          # Proyectos y filtros
│   ├── illustration/    # Galería de ilustración
│   ├── exhibitions/     # Exposiciones
│   ├── biography/       # Biografía
│   ├── contact/         # Formulario
│   └── admin/           # Login, layout y CRUD
├── context/             # PortfolioContext y AuthContext
├── hooks/               # usePortfolio, useAuth
├── models/              # Modelos documentados con JSDoc
├── services/            # api.js y authApi.js
├── utils/               # formatDate, filtros y protección visual
├── infrastructure/      # Sentry
├── styles/              # SASS: _variables, _mixins, _base y parciales
├── assets/              # imágenes estáticas
├── test/                # setup y mocks
├── App.jsx
├── main.jsx
└── index.scss

e2e/                     # Page Objects y specs
└── portfolio-journey.spec.js

playwright.config.js
```

## Checklist Final

- [x] Home con obras destacadas
- [x] Colecciones y ficha de pintura
- [x] Lightbox accesible y protección visual
- [x] Exposiciones
- [x] Diseño con filtro por subcategoría
- [x] Galería de ilustración
- [x] Biografía en texto plano
- [x] Contacto con feedback y rate limit 429
- [x] Login admin con JWT
- [x] Panel CRUD y upload de imágenes
- [x] Sass/SCSS como solución de estilos
- [x] Vitest + Playwright
- [ ] ESLint + a11y + Sentry (ESLint activo; a11y fase 16, Sentry fase 17)
- [ ] pnpm verify pasando (fase 18)
