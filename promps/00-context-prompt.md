# Prompt de Contexto del Proyecto

> **Usa este prompt al inicio de cada sesión para dar contexto a la IA**

---

## El Prompt

```
Vamos a construir juntos una aplicación de portfolio de "Antonio Tello".

SOBRE EL PROYECTO:
- Portfolio artístico de Antonio Tello con pintura, diseño, ilustración, biografía y contacto.
- Stack: React + JavaScript + Vite + Sass
- Testing: Vitest + Testing Library + Playwright (E2E)

FLUJO PÚBLICO DEFINITIVO:
- El menú principal contiene Pintura, Ilustración, Diseño, Biografía y Contacto.
- La Home muestra una única imagen grande de fondo que cubre toda la pantalla, con el menú superpuesto.
- La imagen de fondo debe funcionar como la pieza visual principal de la portada, con una composición responsive y legible.
- Pintura muestra un slider por cada colección con imágenes destacadas de esa colección y un acceso a Exhibiciones.
- Al seleccionar una colección se abre la galería completa de esa colección.
- Al seleccionar Exhibiciones se abre la página de exposiciones.
- Diseño muestra un slider de subcategorías; al seleccionar una subcategoría se abre su galería.
- Ilustración abre directamente una galería con todas las ilustraciones.
- Biografía muestra el texto de la biografía y una fotografía del artista.
- Contacto muestra un formulario con nombre, email, asunto y mensaje.
- Admin es una zona protegida para gestionar todos los contenidos.

METODOLOGÍA DE TRABAJO:

1. TDD (Test-Driven Development): 
   - Siempre escribir el test PRIMERO
   - Verificar que FALLA (Red)
   - Implementar código MÍNIMO para pasar (Green)
   - Refactorizar si es necesario

2. Scope Rule para organización de carpetas:
   - GLOBAL SCOPE (src/shared/): Código usado en múltiples features
   → models/, utils/, constants/, components/, strategies/, hooks/
   - LOCAL SCOPE (src/features/X/): Código específico de una feature
     → home/, painting/, design/, illustration/, exhibitions/, biography/, contact/, admin/
   - Context global: src/context/
   - Infraestructura: src/infrastructure/

3. Verificación continua:
   - Después de cada feature: pnpm test:run && pnpm build
   - Después de E2E (fase 7+): agregar pnpm test:e2e
   - Al final: pnpm verify (lint + tests + e2e + build)

MI ROL COMO DESARROLLADOR:
- Te daré los REQUISITOS de lo que necesito
- Tú generas el código basándote en esos requisitos
- Yo ejecuto, verifico que funciona, y continuamos

TU ROL COMO ASISTENTE:
- NO me des código que no te pida
- Cuando pida un TEST, genera SOLO el test
- Cuando pida la IMPLEMENTACIÓN, genera SOLO la implementación
- Sigue las convenciones del proyecto (Scope Rule, TDD, etc.)
- Si algo no está claro, pregunta antes de generar

REGLAS DE CÓDIGO:
- JavaScript moderno con ESLint
- Sass/SCSS para estilos
- Testing Library con queries accesibles (getByRole > getByTestId)
- Componentes funcionales con hooks
- Nombres descriptivos en inglés

¿Entendido? Cuando confirmes, comenzamos con el primer paso.
```

---

## Versión Corta (para recordar en medio de la sesión)

```
Recuerda:
- TDD: test primero, implementación después
- Scope Rule: shared/ = global, features/X/ = local
- Solo genera lo que te pido (test O implementación, no ambos)
- Verificar con: pnpm test:run && pnpm build
```

---

## Para Retomar una Sesión

```
Continuamos con el proyecto Antonio Tello.

Estado actual:
- Fase [X] completada
- Tests pasando: [N] unit + [M] e2e
- Último componente creado: [nombre]

Vamos a continuar con [siguiente paso].

Recuerda:
- TDD: test primero, implementación después  
- Scope Rule: shared/ = global, features/X/ = local
- Solo genera lo que te pido
```

---

## Notas para el Instructor

Este prompt establece:

1. **Contexto del proyecto** - Qué estamos construyendo y con qué tecnologías
2. **Metodología TDD** - El usuario entiende el ciclo Red-Green-Refactor
3. **Scope Rule** - Organización clara de carpetas
4. **Roles definidos** - El usuario da requisitos, la IA genera código
5. **Límites claros** - La IA no genera más de lo pedido
6. **Verificación** - Siempre correr tests después de cada paso

El usuario aprende a:
- Comunicar requisitos claramente
- Trabajar en pasos pequeños e incrementales
- Verificar antes de continuar
- Usar la IA como herramienta, no como muleta
