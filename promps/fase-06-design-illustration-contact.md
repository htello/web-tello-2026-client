# Fase 6: Diseño, Ilustración y Contacto (15 min)

## Resultado Final
Diseño muestra un slider por cada subcategoría (uno debajo del otro) que abre la galería seleccionada; Ilustración muestra directamente todas sus obras y Contacto envía mensajes.

## Paso 1: Slider de subcategorías de Diseño

**Prompt RED:**
```
Genera DesignSubcategorySlider.test.jsx.
Mockea GET /api/v1/design?subcategory=valor para cada subcategoría.
Verifica que muestra exactamente estas subcategorías:
- imagen-corporativa
- packaging-expositores, presentada visualmente como "Packaging y Expositores"
- carteleria
- editorial
Cada subcategoría debe mostrar sus proyectos destacados y poder seleccionarse para navegar a /design/:subcategory.
```

**Prompt GREEN:**
```
Implementa DesignSubcategorySlider.jsx con Sass (sliders en scroll horizontal, uno debajo del otro).
La subcategoría packaging-expositores es una sola categoría de la API.
Para cada subcategoría consume sus proyectos y utiliza `isFeatured` para las imágenes del slider.
Si una subcategoría no tiene proyectos destacados, utiliza la primera imagen disponible como fallback.
```

## Paso 2: Galería de Diseño

**Prompt para la IA:**
```
Crea DesignGallery.jsx para /design/:subcategory.
Consume GET /api/v1/design?subcategory=valor y muestra todos los proyectos de esa subcategoría.
Para la vista general, Diseño debe mostrar el slider de subcategorías antes de cualquier galería.
Incluye estado loading, error y vacío.
```

## Paso 3: Ilustración

**Prompt RED:**
```
Genera IllustrationGallery.test.jsx.
Verifica GET /api/v1/illustrations, títulos, imágenes y protección anti-descarga.
```

**Prompt GREEN:**
```
Implementa IllustrationGallery.jsx y IllustrationCard.jsx.
La ruta /illustration muestra directamente todas las ilustraciones de GET /api/v1/illustrations.
No muestra un selector intermedio de categorías.
Permite abrir Lightbox sin duplicar su lógica.
```

## Paso 4: TDD - ContactForm

**Prompt RED:**
```
Genera ContactForm.test.jsx.
Campos: name, email, subject y message.
Casos: campos requeridos, email inválido, submit válido con POST /api/v1/contact, éxito,
error 429 RATE_LIMITED y error 502 EMAIL_ERROR (mostrar error, no éxito).
No guardes mensajes en localStorage ni en la aplicación.
```

**Prompt GREEN:**
```
Implementa ContactForm.jsx.
Envía JSON a POST /api/v1/contact, deshabilita el submit mientras envía, muestra feedback
y limpia el formulario solo tras éxito.
Trata 502 EMAIL_ERROR como error de envío (mostrar error, nunca éxito), igual que 429.
Usa Sass/SCSS.
```

## Verificación
```bash
pnpm test:run
pnpm build
```
