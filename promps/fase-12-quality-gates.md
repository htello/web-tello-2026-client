# Fase 12: Panel Admin, Quality Gates y Build Final (15 min)

## Resultado Final
Panel admin funcional para gestionar contenido, hooks de calidad y build listo para desplegar el portfolio.

## Paso 1: Panel Admin

**Prompt para la IA:**
```
Crea AdminLayout.jsx y estas vistas protegidas:
- AdminDashboard
- AdminUsers
- AdminCollections
- AdminPaintings
- AdminExhibitions
- AdminDesign
- AdminIllustrations
- AdminBiography

Consume únicamente los endpoints /api/v1/admin documentados.
Incluye usuarios, listar, crear, editar, eliminar, publicar/destacar y reordenar donde la API lo soporte.
AdminUsers debe consumir GET/PUT/DELETE /api/v1/admin/users y PUT /api/v1/admin/users/:id/password.
El registro de administradores usa POST /api/v1/admin/users/register y solo está disponible para un ADMIN.
Usa formularios accesibles, confirmación antes de borrar y estados loading/error.
Para imágenes usa POST /api/v1/admin/upload con FormData y el campo file.
Todas las peticiones requieren Authorization Bearer mediante el cliente autenticado.
```

## Paso 2: Husky

```bash
git init
pnpm add -D husky
pnpm exec husky init
```

Configura `.husky/pre-commit`:
```sh
pnpm lint || exit 1
pnpm test:run || exit 1
```

Configura `.husky/pre-push`:
```sh
pnpm test:run || exit 1
pnpm build || exit 1
```

## Paso 3: Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest",
    "test:run": "vitest --run",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "quality": "pnpm lint && pnpm test:run",
    "verify": "pnpm quality && pnpm test:e2e && pnpm build",
    "prepare": "husky"
  }
}
```

## Paso 4: Coverage y contrato API

**Prompt para la IA:**
```
Configura cobertura V8 con umbral 80% para src/**/*.{js,jsx}.
Excluye tests, setup, mocks y main.jsx.
Antes de cerrar cualquier HU, compara el cliente con server/docs/openapi.yaml.
No inventes rutas, nombres de campos ni códigos de error.
```

## Paso 5: Verificación final

```bash
pnpm lint
pnpm test:run
pnpm test:e2e
pnpm build
pnpm verify
```

Verificar también:
- `GET /api/v1/health` responde 200.
- Login admin y una operación CRUD funcionan.
- Upload acepta JPEG/PNG/WebP hasta 5 MB.
- Contacto maneja éxito y 429.
- El front usa `VITE_API_URL` y no expone secretos.
- Sass/SCSS compila como única solución de estilos.
- El deploy sigue `server/docs/DEPLOY.md`.

Checkpoint final: portfolio público, panel de administración, tests, accesibilidad, observabilidad y build de producción.
