# Fase 16: Accesibilidad, UX y SEO

## Resultado Final
Portfolio y panel admin navegables por teclado, con hero de fondo responsive, carga progresiva, lightbox accesible, protección visual y metadatos SEO.

## Paso 1: A11y

```bash
pnpm add -D eslint-plugin-jsx-a11y
```

**Prompt para la IA:**
```
Configura eslint-plugin-jsx-a11y en eslint.config.js para flat config.
Revisa todas las vistas del portfolio Y del panel admin (fases 10-15):
tablas y paginador accesibles, diálogos con foco atrapado, formularios con labels,
feedback de mutaciones por aria-live.
- botones con icono tienen aria-label
- imágenes tienen alt contextual
- formularios tienen labels asociados
- focus-visible visible
- headings siguen una jerarquía
- no uses divs como botones
```

## Paso 2: TDD - Skeleton y Toast

**Prompt RED:**
```
Genera Skeleton.test.jsx y Toast.test.jsx.
Skeleton: variantes text, rectangular y circular, role=status y aria-hidden cuando corresponda.
Toast: variantes success/error/info, role=alert, aria-live, cierre manual y auto-cierre con fake timers.
```

**Prompt GREEN:**
```
Implementa Skeleton.jsx y Toast.jsx con Sass/SCSS.
Añade PaintingCardSkeleton, CollectionSkeleton y GallerySkeleton reutilizando Skeleton.
```

## Paso 3: UX de imágenes

**Prompt para la IA:**
```
Mejora PaintingCard, Lightbox y las galerías:
- lazy loading para imágenes fuera de viewport
- width/height o aspect-ratio estable
- fallback visual si falla una imagen
- preload solo de la obra destacada visible
- foco atrapado en Lightbox y retorno al botón que lo abrió
- overlay y contextmenu protection sin afirmar que impide capturas

Revisa también el HomeHero:
- la imagen de fondo no debe ocultar el menú ni el contenido esencial
- debe existir un contraste suficiente entre menú y fondo
- en mobile debe conservar una altura estable y evitar recortes importantes
- si la imagen es decorativa, usa background-image; si aporta contenido, proporciona texto alternativo equivalente

Ten en cuenta el cold start del server en producción (~50 s en la primera petición):
- los estados de carga (Skeleton/LoadingState) deben ser claros y no parecer un fallo
- los timeouts de las peticiones deben ser generosos
```

## Paso 4: SEO y Open Graph

**Prompt para la IA:**
```
Crea SeoMeta.jsx o una utilidad equivalente.
Define title, description, canonical, og:title, og:description, og:image y og:url para home, colección y pintura.
Usa datos reales de la API y escapa valores correctamente.
```

## Verificación
```bash
pnpm lint
pnpm test:run
pnpm test:e2e
pnpm build
```
