# Fase 4: Componentes de Galería, Ficha y Lightbox (15 min)

## Resultado Final
Pintura muestra un slider por colección, cada colección abre su galería y existe un acceso independiente a Exhibiciones.

## Paso 1: TDD - CollectionsSlider

**Prompt RED:**
```
Genera SOLO CollectionsSlider.test.jsx.
Mockea GET /api/v1/collections con varias colecciones públicas ordenadas por position
y GET /api/v1/collections/:id con las pinturas de cada colección.
Verifica que muestra un slider por colección con coverImage, title, description opcional
e imágenes destacadas de las pinturas de esa colección.
Al seleccionar una colección debe navegar a /painting/collections/:id.
Debe incluir controles accesibles y estado vacío.
Usa queries accesibles.
```

**Prompt GREEN:**
```
Implementa CollectionsSlider.jsx y CollectionCard.jsx con clases Sass collection-slider y collection-card.
Cada colección es una entrada del slider y debe mostrar sus pinturas destacadas.
Usa `isFeatured` para seleccionar esas imágenes; si no hay destacadas, usa la portada de la colección.
No conviertas el slider en una única galería plana.
```

## Paso 2: TDD - PaintingDetail

**Prompt RED:**
```
Genera PaintingDetail.test.jsx.
Mockea una pintura completa y otra con datos técnicos ausentes.
Verifica que no se renderizan filas vacías y que existe un botón para volver a la colección.
```

**Prompt GREEN:**
```
Implementa PaintingDetail.jsx consumiendo GET /api/v1/paintings/:id.
Usa getTechnicalDetails y muestra loading, error y not found.
```

## Paso 3: TDD - Lightbox

**Prompt RED:**
```
Genera Lightbox.test.jsx.
Casos: no renderiza cerrado, renderiza imagen abierta, botón close, Escape y foco inicial.
La imagen debe tener draggable false y bloquear contextmenu.
```

**Prompt GREEN:**
```
Implementa Lightbox.jsx como diálogo accesible con role dialog, aria-modal, cierre por Escape y foco controlado.
Usa Sass con clases semánticas y estados visuales claros.
```

## Paso 4: Galería de una colección

**Prompt para la IA:**
```
Crea CollectionGallery.jsx y su test.
Al entrar en /painting/collections/:id consume GET /api/v1/collections/:id.
Muestra únicamente las pinturas de esa colección en una galería responsive,
ordenadas por position y usando PaintingCard.
Cada pintura puede abrir el Lightbox.
```

## Paso 5: Exposiciones

**Prompt para la IA:**
```
Crea ExhibitionLink y ExhibitionList.jsx con sus tests.
En la sección Pintura, un enlace visible "Exhibiciones" debe navegar a /painting/exhibitions.
La página consume GET /api/v1/exhibitions, ordena por position y muestra title, date, location y description opcional.
Incluye estados loading, error y vacío.
```

## Verificación
```bash
pnpm test:run
pnpm build
```
