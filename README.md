# Portfolio de Antonio Tello

Frontend para el portfolio artístico de Antonio Tello. El repositorio está en una fase inicial: por ahora conserva la aplicación de ejemplo de React y Vite; las secciones del portfolio descritas en `promps/` son objetivos planificados, no funcionalidades disponibles.

## Estado

- **Implementado:** plantilla inicial de React 19 y Vite, estilos CSS de ejemplo y configuración de ESLint.
- **En progreso:** preparación del repositorio para construir el portfolio.
- **Planificado:** secciones públicas de pintura, diseño, ilustración, biografía y contacto; autenticación y administración; integración con API; accesibilidad y pruebas automatizadas. Los detalles por fase están en `promps/`.

## Stack y requisitos

- React 19 y JavaScript/JSX.
- Vite 8 para desarrollo y build.
- ESLint 10.
- Node.js compatible con la versión de Vite instalada y pnpm.

Sass, Vitest, Testing Library y Playwright aparecen en los prompts de fases, pero todavía no están configurados como dependencias del proyecto.

## Instalación y uso

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Vite muestra en la terminal la dirección local para abrir en el navegador. Para generar y previsualizar el build:

```bash
pnpm build
pnpm preview
```

## Variables de entorno

Actualmente la aplicación no consume variables de entorno y no hay un archivo `.env.example`. `VITE_API_URL` está previsto para una futura integración; no se debe tratar como configuración implementada ni poner secretos en variables `VITE_*`.

## Scripts disponibles

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo. |
| `pnpm lint` | Ejecuta ESLint sobre el proyecto. |
| `pnpm build` | Genera el build de producción en `dist/`. |
| `pnpm preview` | Sirve localmente el build generado. |

No hay scripts `test`, `test:run`, `test:e2e`, `quality` o `verify` en `package.json`. `src/App.test.jsx` contiene un test de ejemplo que importa Vitest y Testing Library, pero esas dependencias y la configuración para ejecutarlo aún no están presentes.

## Estructura actual

```text
src/
├── App.jsx          # Aplicación de ejemplo de Vite/React
├── App.css          # Estilos de la aplicación de ejemplo
├── App.test.jsx     # Test de ejemplo, aún no ejecutable con los scripts actuales
├── index.css        # Estilos globales de ejemplo
├── main.jsx         # Punto de entrada React
└── assets/          # Recursos de ejemplo
promps/              # Especificación y fases planificadas del proyecto
public/              # Recursos públicos de ejemplo
```

## Integración API

El backend no está incluido y `server/docs/openapi.yaml` no está disponible en este workspace. La aplicación actual no realiza integración API. Antes de implementar peticiones, rutas, esquemas, errores o uploads, hay que contrastarlos con el OpenAPI real; no se deben inferir contratos a partir de los prompts.

## Testing y validación

Hoy están disponibles `pnpm lint` y `pnpm build`. El test de ejemplo no se puede ejecutar hasta configurar sus dependencias y un script de test. Los comandos de fases futuras solo deben documentarse como disponibles cuando existan en `package.json`.

## Despliegue

No hay proveedor ni flujo de despliegue configurado en el repositorio. `pnpm build` genera los archivos estáticos en `dist/`, que podrán publicarse en un servicio de hosting estático cuando se defina el proceso de despliegue.

## Troubleshooting

- **No se encuentra `pnpm`:** instala o habilita pnpm en el entorno y vuelve a ejecutar `pnpm install --frozen-lockfile`.
- **Falla la instalación por versión de Node:** usa una versión de Node.js compatible con la versión de Vite declarada en `package.json`.
- **No aparece el portfolio esperado:** las páginas del portfolio están planificadas; la aplicación actual sigue siendo la plantilla inicial.
- **No se pueden ejecutar los tests:** faltan las dependencias y scripts de test en la configuración actual.
