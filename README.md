# Portfolio de Antonio Tello

Frontend del portfolio artístico de Antonio Tello. Proyecto completado: galería pública y panel de administración con las fases 1-18 cerradas, E2E Playwright en verde y despliegue en Vercel. Los detalles por fase están en `promps/`.

## Estado

- **Implementado:** secciones públicas de pintura (colecciones, galería master-detail, lightbox), ilustración, diseño (por subcategorías), exposiciones, biografía y contacto; cliente HTTP con gestión de errores y timeout; login admin con sesión JWT (`sessionStorage`), recuperación/restablecimiento de contraseña y rutas `/admin` protegidas por rol; CRUD admin completo de colecciones, pinturas, exposiciones, diseño, ilustraciones, biografía y usuarios, con subida de imágenes vía `POST /admin/upload`, filtro server-side y reordenación por colección/subcategoría; SEO con canonical y Open Graph y URLs públicas en español (`/pintura`, `/pintura/exposiciones`, `/ilustracion`, `/diseno`, `/biografia`, `/contacto`); observabilidad con Sentry (errores, tracing, replay y widget de feedback).
- **Desplegado:** front en Vercel — https://web-tello-2026-client.vercel.app/ (build Vite → `dist/`, rewrites SPA en `vercel.json`, variables sincronizadas con la API de Render).

## Stack y requisitos

- React 19 y JavaScript/JSX (sin TypeScript), con React Compiler vía Babel.
- Vite 8 para desarrollo y build; alias `@/` → `src/`.
- SASS/SCSS con metodología BEM y variables centralizadas en `src/styles/_variables.scss`.
- ESLint 10 (flat config, incluye reglas de React Compiler y Sonar).
- Vitest 5 + React Testing Library + `user-event` (unitarios) y Playwright (E2E en `e2e/`).
- Node.js >= 22 y pnpm.

## Instalación y uso

```bash
# 1. Clona el repositorio
git clone https://github.com/htello/web-tello-2026-client.git
cd web-tello-2026-client

# 2. Instala dependencias (Node.js >= 22 y pnpm)
pnpm install --frozen-lockfile

# 3. Configura las variables de entorno
cp .env.example .env

# 4. Inicia el servidor de desarrollo
pnpm dev
```

Vite muestra en la terminal la dirección local para abrir en el navegador. Para generar y previsualizar el build:

```bash
pnpm build
pnpm preview
```

## Variables de entorno

Copiar `.env.example` a `.env`. La única variable pública es `VITE_API_URL` (base de la API; por defecto `http://localhost:3000/api/v1`). En producción: `https://portfolio-api-u5sx.onrender.com/api/v1`. Nunca poner secretos en variables `VITE_*` (se embeben en el bundle).

## Scripts disponibles

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo. |
| `pnpm lint` | Ejecuta ESLint sobre el proyecto. |
| `pnpm build` | Genera el build de producción en `dist/`. |
| `pnpm preview` | Sirve localmente el build generado. |
| `pnpm test` | Vitest en modo watch. |
| `pnpm test:run` | Vitest una pasada. |
| `pnpm run test:coverage` | Cobertura (100% en `services/`, `hooks/` y `utils/`; global ≥90%). |
| `pnpm test:e2e` | Playwright (requiere `pnpm exec playwright install` la primera vez). |
| `pnpm quality` | `lint` + `test:run`. |
| `pnpm verify` | `quality` + E2E + `build`. |

## CI en GitHub

GitHub Actions (`.github/workflows/ci.yml`) ejecuta `pnpm lint`, `pnpm test:coverage` (gate de umbrales) y `pnpm build` en pushes a `main`/`develop` y en pull requests dirigidos a esas ramas (Node.js 22, pnpm, `--frozen-lockfile`).

## Estructura actual

```text
src/
├── app/            # Layout público
├── components/     # UI compartida (LoadingState, ErrorState, EmptyState, imágenes protegidas)
├── constants/      # Reglas de negocio y constantes (regex email, timeouts, subcategorías)
├── context/        # AuthContext (sesión admin)
├── features/
│   ├── home/       # Hero
│   ├── painting/   # Vista de pintura, colecciones, exposiciones, lightbox
│   ├── design/     # Slider de subcategorías y galería
│   ├── illustration/
│   ├── biography/
│   ├── contact/    # Formulario de contacto
│   └── admin/      # Login, recuperación de contraseña, ruta protegida y panel
├── hooks/          # useAsyncData, useAuth, useAdminCrud, useReorder...
├── infrastructure/ # Sentry (errores, tracing, replay, feedback)
├── services/       # Cliente HTTP (api.js) con ApiError, Bearer token y handler 401/403; adminApi.js
├── styles/         # Parciales SASS (_variables, _mixins, _base)
├── test/           # Setup de Vitest
├── utils/          # Validaciones, ordenación, formatos
├── App.jsx         # Rutas (públicas + /admin/*) bajo AuthProvider
└── main.jsx        # Punto de entrada con BrowserRouter
e2e/                # Tests E2E de Playwright
promps/             # Planificación por fases (fase-01 → fase-18)
```

## Integración API

El backend vive en el repositorio hermano `../server` (API desplegada en Render, Frankfurt). La fuente de verdad del contrato es `../server/docs/openapi.yaml`, consultado siempre a través de `../server/docs/openapi-INDEX.md`. Convenciones: éxito `{ data, meta? }`; error `{ error, code }`; auth con `Authorization: Bearer <token>` (JWT, 24 h); rutas `/admin/**` exigen rol `ADMIN`. La API en Render free tiene cold start de ~50 s tras inactividad: el cliente usa timeout de 90 s.

## Acceso admin

- `/admin/login` — login contra `POST /auth/login` (rate limit 10/min).
- `/admin` — panel protegido por `ProtectedRoute` (token + rol `ADMIN`); un 401/403 en cualquier petición `/admin` cierra la sesión y redirige al login.
- `/admin/forgot-password` — solicitud de enlace (respuesta siempre genérica; rate limit 5/15 min).
- `/reset-password?token=...` — restablecimiento (ruta pública: es el enlace que genera el server con `FRONTEND_URL`); contraseña nueva ≥8 caracteres, una mayúscula y un símbolo.

La sesión se persiste en `sessionStorage` (nunca `localStorage`); el token y las contraseñas no se exponen en el DOM ni se registran en consola.

## Testing y validación

Unitarios con Vitest + React Testing Library (red mockeada con `vi.stubGlobal('fetch', ...)`) y E2E con Playwright (`pnpm test:e2e`, server real o mocks en `e2e/support/`). Verificación obligatoria por fase: `pnpm verify` (`lint` + `test:run` + E2E + `build`, con cobertura en el CI).

## Despliegue

Desplegado en Vercel: **https://web-tello-2026-client.vercel.app/** (build Vite → `dist/`). `vercel.json` incluye rewrites SPA para que los deep links (`/pintura`, etc.) sirvan `index.html`. `scripts/vercel-env.sh` sincroniza las variables de entorno (`VITE_API_URL` de producción). El server debe tener `CORS_ORIGIN` y `FRONTEND_URL` apuntando al dominio del front en Vercel.

## Troubleshooting

- **No se encuentra `pnpm`:** instala o habilita pnpm y vuelve a ejecutar `pnpm install --frozen-lockfile`.
- **La API no responde o tarda ~50 s:** cold start de Render free; espera o comprueba `GET /health`.
- **CORS en desarrollo:** el server solo acepta el origen configurado en `CORS_ORIGIN`; revisa el puerto de `pnpm dev`.
- **`/admin` redirige al login:** sesión ausente/expirada (JWT 24 h) o usuario sin rol `ADMIN`.
- **No se pueden ejecutar los E2E:** instala los navegadores con `pnpm exec playwright install`.
