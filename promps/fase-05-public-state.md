# Fase 5: Estado Público + Biografía (15 min)

## Resultado Final
La aplicación tiene estado global de contenido público y muestra HomeHero, el slider de colecciones de Pintura,
el slider de subcategorías de Diseño, galerías, exposiciones y la biografía con foto.

## Paso 1: TDD - usePortfolio

**Prompt RED:**
```
Genera usePortfolio.test.js.
Usa vi.stubGlobal('fetch', ...) para mockear la red (NUNCA MSW ni la API real) y probar:
- carga inicial de featured paintings, collections, exhibitions y biography
- estado loading
- error de una petición
- refresh del contenido
- biografía ausente (404) tratada como "sin biografía", no como error
No inventes datos fuera de los modelos de server/docs.
```

**Prompt GREEN:**
```
Implementa src/hooks/usePortfolio.js.
Expón featuredPaintings, collections, exhibitions, biography, loading, error y refresh.
Usa AbortController para evitar actualizaciones después de desmontar.
```

## Paso 2: Contexto de Portfolio

**Prompt para la IA:**
```
Crea PortfolioProvider y usePortfolioContext en src/context/.
El contexto debe compartir el estado público sin duplicar fetches entre Home, Painting, Biography y Exhibitions.
Divide archivos si ayuda a react-refresh/only-export-components.
```

## Paso 3: Biografía

**Prompt RED:**
```
Genera BiographySection.test.jsx.
Verifica que muestra content como texto plano, imageUrl como fotografía del artista,
loading, error y estado sin contenido.
```

**Prompt GREEN:**
```
Implementa BiographySection.jsx usando el contexto y Sass.
La sección Biografía debe mostrar el texto y la fotografía del artista en una composición responsive.
No interpretes content como HTML; debe renderizarse como texto plano.
Si GET /biography devuelve 404 (aún no creada), muestra "sin biografía" sin estado de error.
```

## Paso 4: Layout

**Prompt para la IA:**
```
Integra PortfolioProvider en main.jsx y crea un layout con navegación, main y footer.
Usa rutas o navegación local para Home, Pintura, Diseño, Ilustración, Biografía y Contacto.
Conserva los estados de carga y error en cada vista.
```

## Verificación
```bash
pnpm test:run
pnpm build
```
