# Fase 2: Modelos + Galería Pública 

## Resultado Final
La Home contiene el menú superpuesto sobre una única imagen grande de fondo que cubre toda la pantalla.

## Paso 1: Modelos de Datos

**Prompt para la IA:**
```
Crea modelos JavaScript documentados con JSDoc en src/models/ para los recursos de la API:
- Collection: id, title, description, coverImage, position, isPublished, paintingsCount
- Painting: id, title, imageUrl, dimensions, technique, year, isFeatured, collection
- Exhibition: id, title, date, location, description, position
- DesignProject e Illustration
- Biography

Documenta los modelos con JSDoc. Exporta constantes de ejemplo o funciones de normalización solo si son necesarias.
```

## Paso 2: Cliente HTTP

**Prompt para la IA:**
```
Crea src/services/api.js con un cliente fetch reutilizable.

Requisitos:
- Base URL configurable con import.meta.env.VITE_API_URL
- Métodos get, post, put y delete
- Parsear respuestas { data, meta }
- Convertir errores de API a un Error con status y code (leer `code` del body de error del server)
- Timeout generoso (el server en Render tiene cold start de ~50 s) y soporte de AbortController
- Permitir enviar JSON y FormData sin forzar Content-Type para FormData
- No añadir todavía lógica de autenticación
```

## Paso 3: TDD - HomeHero

**Prompt RED:**
```
Genera SOLO src/features/home/HomeHero.test.jsx.
Mockea una imagen de portada configurable para la Home.
Verifica que existe una única sección hero con imagen de fondo, que ocupa toda la pantalla,
que mantiene el menú visible y que los enlaces Pintura, Ilustración, Diseño, Biografía y Contacto
son accesibles.
```

**Prompt GREEN:**
```
Implementa src/features/home/HomeHero.jsx.
Muestra una única imagen grande usando background-image o una imagen semántica equivalente.
El hero debe ocupar como mínimo 100svh, cubrir todo el viewport con background-size: cover,
mantener el menú superpuesto y ofrecer contraste suficiente para leerlo.
Usa Sass/SCSS, diseño responsive y clases semánticas. No uses sliders en esta pantalla.
```

## Paso 4: Integrar la Home

**Prompt para la IA:**
```
Actualiza App.jsx para que la pantalla principal contenga:
- menú con Pintura, Ilustración, Diseño, Biografía y Contacto
- identidad visual de Antonio Tello
- HomeHero como contenido principal
- enlaces a las rutas públicas de cada disciplina
No muestres sliders ni una cuadrícula de obras en la Home.
```

## Verificación
```bash
pnpm test:run
pnpm build
```
