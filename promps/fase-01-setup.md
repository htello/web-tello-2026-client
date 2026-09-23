# Fase 1: Setup + Primera Obra (15 min)

## Resultado Final
Aplicación React del portfolio de Antonio Tello funcionando con Sass, Vitest y una `PaintingCard` testeada.

## Paso 1: Crear Proyecto

```bash
pnpm create vite@latest antonio-tello-portfolio --template react
cd antonio-tello-portfolio
pnpm install
pnpm install -D sass vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

## Paso 2: Configurar Sass y Vitest

**Prompt para la IA:**
```
Configura un proyecto Vite + React + JavaScript para el portfolio artístico de Antonio Tello.

Requisitos:
- Usar Sass/SCSS, sin frameworks de utilidades
- Crear src/index.scss e importarlo desde src/main.jsx
- Crear vitest.config.js con environment jsdom y setupFiles
- Crear src/test/setup.js con @testing-library/jest-dom
- Agregar scripts test, test:run y test:coverage
- Mantener todos los archivos en JavaScript/JSX
```

Verificar:
```bash
pnpm test
```

## Paso 3: Estructura del Portfolio

**Prompt para la IA:**
```
Crea esta estructura para un portfolio artístico:

src/
├── app/                 # Router, layout y configuración de la aplicación
├── components/         # Componentes UI compartidos
├── features/
│   ├── home/            # Hero y obras destacadas
│   ├── painting/        # Colecciones, pinturas y lightbox
│   ├── design/          # Proyectos de diseño y filtros
│   ├── illustration/    # Galería de ilustración
│   ├── exhibitions/     # Historial de exposiciones
│   ├── biography/       # Biografía del artista
│   ├── contact/         # Formulario de contacto
│   └── admin/           # Login y gestión protegida
├── hooks/
├── services/            # Cliente HTTP y servicios de API
├── utils/
├── infrastructure/      # Sentry y configuración externa
└── test/

Usa archivos .js/.jsx y .scss. Crea índices solo donde simplifiquen imports.
```

## Paso 4: TDD - PaintingCard

**Prompt para la IA:**
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

## Paso 5: Verificación

```bash
pnpm test:run
pnpm build
```

Checkpoint: Vite, Sass, Vitest y la primera tarjeta de obra funcionando.
