# Fase 18: Quality Gates y Build Final

## Resultado Final
Gates de calidad (CI con coverage) y build listo para desplegar el portfolio y el panel admin.

> Requisito previo: fases 10–15 completadas (el panel ya está construido, refactorizado y probado). Esta fase NO añade funcionalidad: el antiguo "Paso 1: Panel Admin" vive ahora en las fases 10–15.

## Paso 1: Calidad continua (CI)

El CI (`.github/workflows/ci.yml`) ya ejecuta lint + `pnpm test:run` + build.
En esta fase se añade el **gate de coverage**:

**Prompt para la IA:**
```
Añade al workflow ci.yml un paso de cobertura que ejecute pnpm test:coverage
y falle si no se alcanzan los umbrales configurados en el Paso 3.
No se añaden git hooks locales (Husky).
```

## Paso 2: Scripts

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

## Paso 3: Coverage y contrato API

**Prompt para la IA:**
```
Configura cobertura V8 con umbral global 90% y 100% en src/services/, src/hooks/ y src/utils/.
Excluye tests, setup, mocks y main.jsx.
Antes de cerrar cualquier HU, compara el cliente con server/docs/openapi.yaml.
No inventes rutas, nombres de campos ni códigos de error.
```

## Paso 4: Verificación final

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
