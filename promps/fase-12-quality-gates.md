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
Imágenes en 2 pasos: POST /api/v1/admin/upload (FormData, campo file, opcional section)
devuelve { url, thumbnail, width, height, format }; envía la `url` como imageUrl/coverImage
en el JSON del create/update. NUNCA uses los campos multipart `image` de los endpoints de entidades.
Particularidades del contrato:
- POST /api/v1/admin/paintings requiere `year` (1900-2100) y `collectionId`
- PUT de entidades es actualización parcial (mínimo 1 campo)
- reorder: enviar solo { orderedIds } (en paintings el server ignora collectionId)
- GET /api/v1/admin/... devuelve TODO (publicado y no publicado), ordenado por position asc
Todas las peticiones requieren Authorization Bearer mediante el cliente autenticado.
```

## Paso 2: Calidad continua (CI)

La calidad se valida en CI (GitHub Actions: lint + build, y tests cuando estén instalados).
No se añaden git hooks locales (Husky).

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
    "verify": "pnpm quality && pnpm test:e2e && pnpm build"
  }
}
```

## Paso 4: Coverage y contrato API

**Prompt para la IA:**
```
Configura cobertura V8 con umbral global 90% y 100% en src/services/, src/hooks/ y src/utils/.
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
- Contacto maneja éxito, 429 y 502 EMAIL_ERROR.
- El front usa `VITE_API_URL` y no expone secretos.
- Sass/SCSS compila como única solución de estilos.
- El deploy sigue `server/docs/DEPLOY.md`.

Checkpoint final: portfolio público, panel de administración, tests, accesibilidad, observabilidad y build de producción.
