# Fase 1: Setup + Primera Obra (15 min)

## Resultado Final
Base del portfolio lista: Sass/SCSS con parciales, Vitest + Testing Library configurados, plantilla Vite limpia y una `PaintingCard` testeada.

> El proyecto ya está scaffolded (Vite 8 + React 19 + React Compiler, ESLint 10 flat, pnpm, CI lint+build). Esta fase configura lo que falta y elimina la plantilla de ejemplo.

## Paso 1: Instalar dependencias

```bash
pnpm add -D sass vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

## Paso 2: Configurar Sass

**Prompt para la IA:**
```
Configura Sass/SCSS como única solución de estilos (sin frameworks de utilidades).

Requisitos:
- Crear src/styles/_variables.scss (colores, tipografías, espaciado, breakpoints)
- Crear src/styles/_mixins.scss (breakpoints responsive mobile-first)
- Crear src/styles/_base.scss (reset básico, tipografía, foco visible)
- Crear src/index.scss importando los parciales con @use (no @import, está deprecado)
- Importar src/index.scss desde src/main.jsx
- Eliminar src/App.css y src/index.css
- Metodología BEM y variables centralizadas (nada de valores mágicos repetidos)
```

## Paso 3: Configurar Vitest

**Prompt para la IA:**
```
Configura Vitest para el portfolio:

- Crear vitest.config.js con environment jsdom, globals true y setupFiles ['src/test/setup.js']
- Crear src/test/setup.js importando @testing-library/jest-dom
- Configurar el alias @/ -> src/ en vite.config.js y vitest.config.js
- Excluir e2e/ y los reportes de Playwright del runner de Vitest
- Mantener todo en JavaScript/JSX
```

## Paso 4: Variables de entorno

**Prompt para la IA:**
```
Crea .env.example con VITE_API_URL=http://localhost:3000/api/v1 y documenta en comentario
que en producción es https://portfolio-api-u5sx.onrender.com/api/v1.
No pongas secretos en variables VITE_* (todo VITE_* es público en el bundle).
```

## Paso 5: Limpiar plantilla Vite

**Prompt para la IA:**
```
Limpia la plantilla de ejemplo de Vite:
- Sustituye src/App.jsx por una raíz mínima (componente function con estructura base)
- Elimina los assets demo (react.svg, vite.svg) conservando src/assets/hero.png
- Asegura que main.jsx importa src/index.scss (no index.css)
```

Verificar:
```bash
pnpm lint
pnpm build
```

## Paso 6: Scripts

Agrega a package.json:
```json
"test": "vitest",
"test:run": "vitest --run",
"test:coverage": "vitest --coverage",
"quality": "pnpm lint && pnpm test:run",
"verify": "pnpm quality && pnpm test:e2e && pnpm build"
```

## Paso 7: TDD - PaintingCard

**Prompt RED:**
```
Voy a crear PaintingCard con TDD. El componente no existe todavía.
Genera SOLO el test en src/features/painting/components/PaintingCard.test.jsx.

El componente recibirá una obra con id, title, imageUrl, dimensions, technique y year.
Debe mostrar la imagen, el título y solo los datos técnicos que existan.
Debe llamar onOpen al hacer click y usar un botón o elemento accesible.
```

Ejecutar en RED:
```bash
pnpm test PaintingCard
```

**Prompt GREEN:**
```
Implementa src/features/painting/components/PaintingCard.jsx para pasar el test.
Usa Sass/SCSS con una clase semántica painting-card y mantén el código en JavaScript/JSX.
```

## Paso 8: Verificación

```bash
pnpm test:run
pnpm lint
pnpm build
```

Checkpoint: Sass, Vitest y la primera tarjeta de obra funcionando; plantilla Vite eliminada.
