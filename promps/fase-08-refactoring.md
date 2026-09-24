# Fase 8: Refactoring del Portfolio 

## Resultado Final
Código organizado por dominio, sin duplicación de fetch/UI, con ESLint y SonarJS.

## Paso 1: Calidad

```bash
pnpm add -D eslint-plugin-sonarjs
```

**Prompt para la IA:**
```
Actualiza eslint.config.js para JavaScript/JSX y SonarJS.
Configura reglas de complejidad cognitiva, strings duplicados y funciones idénticas.
Mantén Sass/SCSS y JavaScript/JSX en todos los módulos.
Ignora dist, coverage y reportes de Playwright.
```

## Paso 2: Refactorizar cliente API

**Prompt para la IA:**
```
Revisa llamadas repetidas a fetch.
Extrae una única abstracción en src/services/api.js con:
- manejo de { data, meta }
- errores con status/code
- JSON y FormData
- token opcional mediante un interceptor o función authFetch
No cambies los endpoints documentados.
```

## Paso 3: Refactorizar estados de UI

Busca y extrae componentes compartidos:
- `LoadingState.jsx`
- `ErrorState.jsx`
- `EmptyState.jsx`
- `SectionHeader.jsx`

No mezcles estado admin con contenido público.

## Paso 4: Refactorizar protección de imágenes

**Prompt para la IA:**
```
Centraliza la protección visual de imágenes en ProtectedArtworkImage.jsx.
Debe gestionar alt, draggable=false, contextmenu y overlay transparente.
Aclara en el código que esto no sustituye controles de derechos de autor.
```

## Paso 5: Verificación
```bash
pnpm test:run
pnpm lint
pnpm build
```
