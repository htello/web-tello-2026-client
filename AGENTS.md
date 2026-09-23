# Portfolio Antonio Tello

## Contexto

Frontend de un portfolio artístico con pintura, diseño, ilustración, biografía, contacto y panel admin.

- Stack: React 19, Vite y JavaScript/JSX.
- El repositorio está en fase inicial; no asumir que las fases de `promps/` ya están implementadas.
- El backend no está incluido en este workspace.
- Nombres de variables, componentes, funciones y archivos en inglés.

## Reglas de trabajo

- El usuario proporcionará manualmente los prompts de `promps/` que guíen cada tarea. No avances otras fases por iniciativa propia.
- No escribas ni modifiques código sin aprobación explícita del usuario. Primero revisa el prompt y el contexto; espera aprobación antes de implementar.
- Mantén los cambios pequeños, localizados y compatibles con el código existente.
- Para lógica o componentes nuevos, sigue TDD cuando el entorno de tests esté configurado: Red, implementación mínima, Green y Refactor.
- Cubre éxito, carga, vacío y error cuando aplique.
- Usa HTML semántico, labels explícitos y queries accesibles; prioriza `getByRole` sobre `data-testid`.
- Usa componentes funcionales y hooks.
- Usa Sass/SCSS solo cuando esté configurado; no introduzcas una solución de estilos paralela sin necesidad.
- Código compartido: `src/shared/`. Código específico: `src/features/<feature>/`. Estado global: `src/context/`. Integraciones: `src/infrastructure/`.
- No edites archivos no relacionados ni hagas refactors oportunistas.
- Conserva los cambios locales existentes del usuario; inspecciona el estado de Git antes de editar y no los sobrescribas ni los descartes.
- No añadas dependencias, endpoints o campos sin una necesidad verificable.

## Producto

Las secciones públicas son Pintura, Ilustración, Diseño, Biografía y Contacto.

- Home: una imagen principal de fondo y navegación superpuesta.
- Pintura: colecciones, obras destacadas, galería, detalle, exposiciones y lightbox.
- Diseño: solo estas categorías: `imagen-corporativa`, `packaging-expositores`, `carteleria` y `editorial`.
- Ilustración: galería directa.
- Biografía: texto plano y fotografía; nunca renderizar HTML no confiable.
- Contacto: formulario con `name`, `email`, `subject` y `message`; manejar también `429 RATE_LIMITED`.
- Galerías y peticiones deben contemplar estados de loading, error y vacío.
- Lightbox: `role="dialog"`, `aria-modal`, cierre con Escape, foco gestionado y alt contextual.
- La protección visual (`draggable=false`, context menu y overlay) no impide capturas ni herramientas del navegador.

## API y datos

- Cuando exista, `server/docs/openapi.yaml` es la fuente de verdad para rutas, métodos, esquemas, campos, códigos de error y `multipart/form-data`.
- No inventes ni deduzcas contratos del backend ausente. Si falta información, deja la decisión explícita y solicita el contrato correspondiente.
- Usa `VITE_API_URL` para la URL pública de API. No expongas secretos en variables `VITE_*`.
- Centraliza las peticiones en un cliente API compartido; normaliza errores sin ocultar su `status` o `code`.
- Para uploads documentados, usa `FormData` con el campo `file`.
- Evita fetch duplicado y cancela peticiones obsoletas con `AbortController` cuando corresponda.

Rutas previstas por los prompts, sujetas al contrato real: `/api/v1/collections`, `/api/v1/paintings`, `/api/v1/paintings/featured`, `/api/v1/exhibitions`, `/api/v1/design`, `/api/v1/illustrations`, `/api/v1/biography`, `/api/v1/contact`, `/api/v1/auth/login`, `/api/v1/admin/*` y `/api/v1/health`.

## Seguridad y privacidad

- Las peticiones admin usan `Authorization: Bearer <JWT>` y requieren rol `ADMIN` según el contrato.
- No muestres ni registres passwords, JWT, cabeceras `Authorization`, secretos ni datos personales innecesarios.
- No persistas mensajes del formulario de contacto en `localStorage` ni `sessionStorage`.
- No envíes datos sensibles a observabilidad o analytics.
- Distingue `401` y `403` según el contrato real de la API; no los intercambies por conveniencia.

## Flujo Git

- Nunca trabajes directamente en `main`, ni hagas checkout de trabajo sobre ella.
- Usa `develop` como rama base. Si no existe, créala desde `main` antes de empezar a desarrollar.
- Crea una rama nueva para cada feature, bugfix o tarea: `feature/<nombre-corto>`, `fix/<nombre-corto>` o `chore/<nombre-corto>`, siempre partiendo de `develop` actualizado.
- No hagas `commit`, `push`, `merge`, `rebase`, `reset`, `revert`, `tag` ni borres ramas sin consentimiento explícito y previo del usuario para esa operación concreta.
- Puedes inspeccionar el estado y el historial con comandos de solo lectura, pero informa de la rama actual antes de modificar archivos.
- No mezcles tareas distintas en una misma rama ni alteres cambios existentes del usuario.

## Documentación

- Mantén `README.md` completamente alineado con el estado real del proyecto; no conserves texto genérico de Vite cuando el portfolio tenga documentación propia.
- El README debe cubrir como mínimo: propósito, funcionalidades implementadas, stack, requisitos, instalación, variables de entorno, scripts disponibles, estructura relevante, integración API, testing, despliegue y troubleshooting.
- Distingue claramente entre funcionalidades implementadas, en progreso y planificadas. No documentes como disponible ningún script, endpoint o herramienta que no exista en el repositorio.
- Actualiza `README.md` en la misma feature cuando cambien la instalación, arquitectura, API, scripts, variables de entorno, comportamiento visible o proceso de despliegue.
- Documenta con JSDoc las APIs exportadas y el código cuyo propósito, contrato o comportamiento no sea evidente.
- Incluye `@param`, `@returns`, `@throws` y ejemplos cuando aporten información útil; describe los tipos con precisión y evita comentarios que repitan el código.
- Mantén JSDoc y README sincronizados con la implementación y el contrato OpenAPI. No ocultes decisiones importantes ni errores conocidos.
- La documentación siempre debe mantenerse actualizada; antes de solicitar o realizar un commit autorizado, comprueba que `README.md` y los JSDoc afectados reflejan todos los cambios.
- Después de cada commit autorizado, revisa automáticamente la documentación modificada por ese commit y actualiza `README.md` o los JSDoc necesarios antes de continuar con otra tarea.

## Validación

Ejecuta la validación más estrecha posible después de cada cambio. En el estado actual están disponibles:

```bash
pnpm lint
pnpm build
pnpm dev
pnpm preview
```

`pnpm dev` y `pnpm preview` sirven para iniciar servidores de desarrollo y previsualización, no son comprobaciones que terminen por sí solas.

Usa `pnpm test:run`, `pnpm test:e2e`, `pnpm quality`, `pnpm verify` y coverage solo cuando sus dependencias y scripts existan en `package.json`. No declares un quality gate disponible antes de configurarlo.

Antes de cerrar una feature, comprueba que el cambio coincide con el contrato API, no rompe accesibilidad y no introduce secretos. Las guías detalladas por fase permanecen en `promps/`; no las dupliques aquí.
