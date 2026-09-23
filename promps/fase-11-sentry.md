# Fase 11: Observabilidad con Sentry (15 min)

## Resultado Final
Errores del cliente, fallos de API y acciones importantes llegan a Sentry sin filtrar secretos.

## Paso 1: Instalar

```bash
pnpm add @sentry/react
```

## Paso 2: Configuración

**Prompt para la IA:**
```
Crea src/infrastructure/sentry.js.
- leer VITE_SENTRY_DSN
- no inicializar si falta DSN
- environment según VITE_ENV
- browserTracingIntegration y replayIntegration
- sample rates conservadores en producción
- no enviar password, Authorization, JWT ni contenido privado de formularios
```

Usa `.env.example` con `VITE_SENTRY_DSN=` y nunca subas `.env.local`.

## Paso 3: Error Boundary

**Prompt para la IA:**
```
Crea SentryErrorBoundary.jsx con @sentry/react.
Muestra una pantalla de recuperación accesible con reintentar y reportar feedback.
Usa clases semánticas Sass, no clases de utilidades.
El fallback no debe mostrar tokens ni datos sensibles del error.
```

## Paso 4: API breadcrumbs

**Prompt para la IA:**
```
Añade breadcrumbs para navegación, apertura de colección, apertura de pintura, submit de contacto y errores HTTP.
Incluye endpoint y status, pero nunca Authorization, password, message completo del contacto o datos personales.
Captura excepciones inesperadas del cliente y conserva errores recuperables como estado de UI.
```

## Paso 5: Integración

Inicializa Sentry antes de renderizar React y envuelve la aplicación con `SentryErrorBoundary`.

## Paso 6: Verificación
```bash
pnpm test:run
pnpm lint
pnpm build
```
Prueba manualmente un error controlado solo en desarrollo y verifica el dashboard.
