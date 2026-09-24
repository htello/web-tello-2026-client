# AGENTS.md — Client (Frontend)

## Estado

- Runtime: Node.js >= 22
- Frontend: React 19 + JavaScript (JSX) — **sin TypeScript**
- Bundler: Vite 8 (con React Compiler vía Babel)
- Estilos: **SASS/SCSS** (pendiente de instalar en Fase 01; hoy existen `App.css`/`index.css` de ejemplo de la plantilla Vite)
- Lint: ESLint 10 (flat config, `eslint.config.js`)
- Testing: Vitest + React Testing Library (**planificados, aún no instalados**; ver `promps/fase-01-setup.md`). E2E con Playwright en Fase 07
- Package Manager: pnpm
- CI/CD: GitHub Actions (hoy: lint + build; añadir tests cuando se instale Vitest)
- Planificación por fases: carpeta `promps/` (fase-01 → fase-07)
- Historias: **HU17 Galería Pública** y **HU18 Panel Admin** (Fase 7 del proyecto global)
- **Backend**: repositorio hermano `../server` — API desplegada y verificada en producción

## API del Backend (FUENTE DE VERDAD)

> **La especificación OpenAPI 3.0.3 del server es la fuente de verdad del contrato.**
> Ruta: `../server/docs/openapi.yaml` — leer SIEMPRE a través de su índice `../server/docs/openapi-INDEX.md` (mapa ruta→línea); NUNCA leer el yaml completo (2142 líneas).

### Bases

| Entorno | Base URL |
|---|---|
| Local (server en `../server` con `pnpm dev`) | `http://localhost:3000/api/v1` |
| Producción (Render free, Frankfurt) | `https://portfolio-api-u5sx.onrender.com/api/v1` |

Configurar vía `VITE_API_URL` en `.env` (crear `.env.example` en Fase 01). Las variables `VITE_*` se embeben en el bundle: **nunca poner secretos en ellas**.

### Convenciones de respuesta (todos los endpoints)

- Éxito: `{ "data": ... }` (listados admin de usuarios: `{ "data": [...], "meta": { total, page, limit, pages } }`).
- Error: `{ "error": "mensaje en español", "code": "CODIGO" }`.
- Códigos de error: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401, sin token), `FORBIDDEN` (403, token inválido/expirado o sin rol ADMIN), `NOT_FOUND` (404), `DUPLICATE_ERROR` (400), `RATE_LIMITED` (429), `EMAIL_ERROR` (502), `INTERNAL_ERROR` (500), `SERVICE_UNAVAILABLE` (503 en `/health/db`).
- Auth: header `Authorization: Bearer <token>` (JWT, expira a las 24 h). Rutas `/admin/**` exigen rol `ADMIN`.

### Convención de imágenes (OBLIGATORIA, acordada con el server)

- El front usa **siempre raw JSON** (`Content-Type: application/json`) en todos los endpoints.
- Subida de imágenes en 2 pasos: `POST /admin/upload` (multipart, campo `file`, opcional `section`: pintura|ilustracion|diseno|general) → devuelve `{ url, thumbnail, width, height, format }` → la `url` se envía como `imageUrl`/`coverImage` en el JSON del create/update.
- NUNCA usar los campos multipart (`image`) de los endpoints de entidades desde el front (existen como capacidad extra del back, no para el front).

### Endpoints y particularidades del contrato

**Públicos (sin auth):**
- `GET /collections`, `GET /collections/:id` (incluye pinturas), `GET /paintings`, `GET /paintings/featured`, `GET /paintings/:id`
- `GET /design?subcategory=<obligatoria>` — **sin `subcategory` devuelve 400**; valores: `imagen-corporativa`, `packaging-expositores`, `carteleria`, `editorial`. Inválida → 404.
- `GET /design/featured`, `GET /illustrations`, `GET /illustrations/featured`, `GET /exhibitions`
- `GET /biography` → **404 si aún no existe** (el admin la crea con `POST /admin/biography`); el front debe tratar ese 404 como "sin biografía".
- `POST /contact` → 201; **502 `EMAIL_ERROR` si falla el envío** (mostrar error, no éxito); rate limit 5/min.
- `GET /health`, `GET /health/db` (monitorización).

**Auth:**
- `POST /auth/login` → `{ token, user }`; rate limit 10/min.
- `POST /auth/forgot-password` → SIEMPRE 200 genérico (no revela si el email existe); el enlace llega por email.
- `POST /auth/reset-password` → `{ token, password }` (password fuerte: ≥8, mayúscula y símbolo); 400 "Token inválido o expirado"; token de un solo uso, 1 h de validez.
- Rate limits de recuperación: 5/15 min.

**Admin (Bearer ADMIN):**
- CRUD: `collections`, `paintings`, `exhibitions`, `design`, `illustrations`, `biography` (solo POST/PUT), `users` (+ `PUT /admin/users/:id/password`).
- `POST /admin/paintings` — **`year` es obligatorio** (1900-2100); `collectionId` obligatorio.
- PUT de entidades = **actualización parcial** (enviar solo campos a cambiar; mínimo 1 campo).
- Reorder: `PUT /admin/{collections,paintings,exhibitions,design,illustrations}/reorder` con `{ "orderedIds": [3,1,2] }`. IDs inexistentes → 400. (El openapi documenta `collectionId` en el reorder de paintings, pero el server lo ignora: el front debe enviar solo `orderedIds`.)
- Listados admin (`GET /admin/...`) devuelven TODO (publicado y no publicado), ordenados por `position asc`.
- `POST /admin/users/register` crea ADMIN y requiere token de admin existente.

### Consideraciones de producción (Render free)

- **Cold start**: tras ~15 min de inactividad la primera petición tarda ~50 s (mitigado con ping externo cada 10 min). El front debe tener timeouts generosos y estados de carga claros.
- Latencia normal: 70-150 ms (Frankfurt).

## Reglas Críticas (NO NEGOCIABLES)

> **NUNCA implementar código sin aprobación del usuario. NUNCA ejecutar comandos de Git (commit/push/merge/branch) sin confirmación explícita.**

1. **Aprobación de código**: proponer el código completo en la conversación antes de escribirlo en los archivos.
2. **Uso estricto de ramas**: antes de empezar cualquier HU/fase, verificar que se está en la rama `hu/XX-nombre`, `feat/descripcion` o `fix/descripcion` (creada desde `develop`). No escribir nada directamente en `develop` ni en `main`.
3. **Confirmación de Git**:
   - **NO son confirmaciones:** "ok", "vale", "perfecto", "bien", "sigue".
   - **SÍ son confirmaciones:** "haz commit", "commit", "push", "sube", "guarda", "mergea", "haz merge".
4. **Flujo de parada**: Cambios → Tests + Lint + Build (+ Coverage cuando Vitest esté instalado) → **DETENERSE Y ESPERAR CONFIRMACIÓN DEL USUARIO**.
5. **Inspección de archivos y eficiencia de tokens**:
   - **NUNCA leer el repositorio entero** por iniciativa propia; si hace falta, pedir confirmación.
   - **PROHIBIDO PRE-ESCANEAR:** no leer automáticamente `promps/` completos, `README.md`, `dist/` ni ejecutar `git log` al inicio de las peticiones. Leer de `promps/` solo la fase en curso.
   - **SOLICITUD DE CONFIRMACIÓN** antes de leer documentación del server (`../server/docs/*`) que no sea el INDEX de openapi.
   - Leer únicamente las secciones/líneas estrictamente necesarias.
6. **Bloqueo de commit por fallo de calidad**: NUNCA commitear/mergear si `pnpm lint`, `pnpm build` o los tests fallan. Detenerse, informar y arreglar primero.
7. **Respuestas concisas**: sin saludos ni rodeos; código y resultados directos; proponer diffs/funciones en vez de reimprimir archivos enteros.

## Reglas TDD (cuando Vitest esté instalado — Fase 01)

Resumen: RED → GREEN → REFACTOR.
- Cobertura objetivo: **100% en `src/services/`, `src/hooks/` y `src/utils/`**; componentes con tests de comportamiento (RTL). Umbral global: mantener ≥90% y no bajarlo.
- Mockear la red con `vi.stubGlobal('fetch', ...)` (patrón ya usado en `src/App.test.jsx`); NUNCA llamar a la API real en tests unitarios.
- Cada test independiente; `cleanup()` + `vi.unstubAllGlobals()` en `afterEach`.
- Queries de RTL por rol/label/texto accesible (`getByRole`, `findByText`); evitar `data-testid` salvo necesidad.

## Eficiencia de Tokens (OBLIGATORIO)

- **API**: leer `../server/docs/openapi-INDEX.md` y abrir `../server/docs/openapi.yaml` con `offset/limit` usando la línea del índice. NUNCA leer el yaml completo.
- **Fases**: leer solo el archivo de la fase en curso en `promps/` (p. ej. `promps/fase-02-catalog.md`).
- **Buscar antes que leer**: `grep`/`glob` para localizar; `read` con `offset/limit`; no releer archivos ya vistos en la sesión.
- **Prohibido en escaneos:** `node_modules/`, `dist/`, `.git/`, `pnpm-lock.yaml`.

## Comandos Útiles

```bash
pnpm install --frozen-lockfile   # dependencias
pnpm dev                         # servidor de desarrollo Vite
pnpm build                       # build de producción (dist/)
pnpm preview                     # servir el build localmente
pnpm lint                        # ESLint (flat config)
# Pendientes de instalar en Fase 01:
# pnpm test                      # Vitest watch
# pnpm test:run                  # Vitest run (una pasada)
# pnpm run test:coverage         # cobertura
```

## Estructura del Proyecto

```
client/
├── src/
│   ├── app/            # router, layout y providers (NO App.jsx)
│   ├── services/       # cliente HTTP y servicios de API
│   ├── components/     # componentes UI compartidos
│   ├── features/
│   │   ├── home/       # hero y obras destacadas
│   │   ├── painting/   # colecciones, pinturas y lightbox
│   │   ├── design/     # proyectos de diseño y filtros
│   │   ├── illustration/
│   │   ├── exhibitions/
│   │   ├── biography/
│   │   ├── contact/
│   │   └── admin/      # login y gestión protegida
│   ├── hooks/          # hooks transversales (useAuth, useFetch...)
│   ├── utils/
│   ├── infrastructure/ # Sentry y configuración externa
│   ├── styles/         # SASS: parciales _variables, _mixins, base, layout, componentes
│   ├── assets/         # imágenes estáticas
│   ├── test/           # setup y helpers de test
│   ├── index.scss      # entry SASS (importa parciales de styles/)
│   ├── App.jsx         # raíz (hoy: plantilla de ejemplo)
│   └── main.jsx        # entry point
├── promps/             # planificación por fases (fase-01 → fase-07)
├── docs/               # documentación del front (vacía por ahora)
├── .github/workflows/  # CI: lint + build (+ tests cuando existan)
├── index.html
├── vite.config.js
└── AGENTS.md
```

## Convenciones de Escritura (JavaScript/JSX)

- **Componentes**: function components con arrow functions (`const Card = ({ title }) => {...}`), nunca `class`.
- **Variables**: `const` por defecto, `let` solo si se reasigna, nunca `var`.
- **Async**: siempre `async/await`, nunca `.then()`; errores de red capturados y traducidos a estado de UI (error/loading/data).
- **Templates**: siempre template literals, nunca concatenación `+`.
- **Imports**: ES Modules; alias `@/` si se configura en Vite (decidir en Fase 01 y mantenerlo).
- **Naming**: `PascalCase` componentes y tipos; `camelCase` variables/funciones/hooks (`useXxx`); `SCREAMING_SNAKE_CASE` constantes; archivos de componentes en `PascalCase.jsx`.
- **JSDoc**: obligatorio en `src/services/`, `src/hooks/` y `src/utils/` (`@param`, `@returns`); opcional en componentes simples.
- **Props**: validar con `propTypes` o destructuración con defaults; documentar props no obvias.
- Sin `console.log` de datos sensibles (tokens, emails de usuarios) — usar solo en desarrollo y retirar antes de commitear.

## Convenciones de Estilos (SASS)

- **SCSS** (sintaxis de llaves), un archivo por componente/vista + parciales globales.
- Parciales con prefijo `_` (`_variables.scss`, `_mixins.scss`); importar vía `@use` (no `@import`, que está deprecado en Sass).
- Metodología **BEM**: `.card`, `.card__title`, `.card--featured`.
- Variables de diseño (colores, tipografías, espaciado, breakpoints) centralizadas en `src/styles/_variables.scss` — usarlas SIEMPRE, nada de valores mágicos repetidos.
- Responsive mobile-first; breakpoints definidos como mixins.
- Accesibilidad: contraste AA, foco visible, HTML semántico (`nav`, `main`, `article`, `figure`), atributos `aria-*` cuando corresponda.

## Convenciones de Git y Workflow

**Branches:** `hu/XX-nombre`, `feat/descripcion`, `fix/descripcion`, `chore/descripcion`, `refactor/descripcion` (desde `develop`).

**Commits:** Conventional Commits (ej. `feat(hu-17): add public gallery grid`).

**Pasos obligatorios por HU/fase:**

1. **Verificar rama** antes de escribir código.
2. **TDD** cuando aplique (RED → GREEN → REFACTOR).
3. **Verificación de calidad (OBLIGATORIA)**: `pnpm lint && pnpm build` (+ `pnpm test` cuando exista). Si algo falla, CORREGIR antes de avanzar.
4. **PAUSA OBLIGATORIA**: presentar resultados y solicitar confirmación explícita antes del flujo de Git.
5. **Git (solo tras confirmación explícita)**: commit + push en la rama de trabajo → merge `--no-ff` a `develop` + push → borrado de rama. `main` solo para releases (merge `develop` → `main` con confirmación).
6. Al terminar una fase, actualizar el check correspondiente en `promps/` si aplica y el `README.md` si cambia el estado del proyecto.

## Seguridad (Frontend / OWASP)

- **Secretos**: NUNCA en el repo ni en variables `VITE_*` (todo `VITE_*` es público en el bundle). La única config pública esperada es `VITE_API_URL`.
- **Token JWT**: guardar en memoria (contexto/estado) y, si se requiere persistencia entre recargas, `sessionStorage` (nunca `localStorage` si hay riesgo XSS asumido); limpiar en logout; no loguearlo.
- **XSS**: React escapa por defecto; **prohibido `dangerouslySetInnerHTML`** salvo justificación explícita y saneado previo (p. ej. biografía si viniera en HTML).
- **Validación**: la validación authoritative es la del server (Joi); el front valida para UX (formatos, requeridos) y SIEMPRE maneja los 400/422 mostrando `error` de la respuesta.
- **Enlaces externos**: `rel="noopener noreferrer"`.
- **CORS**: el server acepta un único origen (`CORS_ORIGIN`); al desplegar el front, avisar para actualizar esa variable (y `FRONTEND_URL`, usada en los emails de recuperación) en Render.

## Despliegue del Front (planificado)

- Hosting gratuito previsto: Vercel o Netlify (build Vite → `dist/`).
- Variables: `VITE_API_URL=https://portfolio-api-u5sx.onrender.com/api/v1`.
- Checklist al desplegar: actualizar en Render `CORS_ORIGIN` y `FRONTEND_URL` con el dominio del front; probar flujo completo (login admin, galerías, contacto, recuperación de contraseña).

## Documentación y Fuente de Verdad

- Contrato de API: `../server/docs/openapi.yaml` (índice: `../server/docs/openapi-INDEX.md`). Si el front necesita un cambio de contrato, se propone en el server (nunca adaptar el front a comportamientos no documentados).
- Planificación de fases: `promps/` (leer solo la fase en curso).
- Estado global del proyecto: `../server/SESION.md` (acta de cierre del backend y pendientes que hereda el front).
