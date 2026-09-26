# Preguntas de Validación del Portfolio

Usa estas preguntas después de completar el proyecto. Las respuestas deben contrastarse con `server/docs/openapi.yaml`, `server/docs/0003-HU-PORTFOLIO.md` y el código real.

## 1. Dominio y API

1. ¿Qué secciones públicas tiene el portfolio?
2. ¿Qué endpoint devuelve las colecciones publicadas?
3. ¿Qué endpoint devuelve una colección con sus pinturas?
4. ¿Cómo se obtienen las obras destacadas?
5. ¿Qué datos técnicos puede mostrar una pintura?
6. ¿Qué subcategorías acepta `/api/v1/design`?
7. ¿Qué endpoint devuelve la biografía y qué pasa si aún no existe?
8. ¿Qué campos requiere `POST /api/v1/contact`?
9. ¿El contacto almacena mensajes en la base de datos?
10. ¿Qué endpoint se usa para subir imágenes y qué campo multipart recibe?

Respuestas esperadas:

- Pintura (con acceso a Exhibiciones), Ilustración, Diseño, Biografía y Contacto.
- `GET /api/v1/collections`.
- `GET /api/v1/collections/:id`.
- `GET /api/v1/paintings/featured`.
- `dimensions`, `technique` y `year`, omitiendo los campos ausentes.
- `imagen-corporativa`, `packaging-expositores`, `carteleria` y `editorial`.
- `GET /api/v1/biography`; responde 404 si aún no existe y el front lo trata como "sin biografía".
- `name`, `email`, `subject` y `message`.
- No; el backend envía el email directamente con Nodemailer.
- `POST /api/v1/admin/upload`, campo `file` (opcional `section`: pintura|ilustracion|diseno|general).

## 2. TDD

11. ¿Qué se crea primero, el test o `PaintingCard`?
12. ¿Qué utilidades puras tienen tests?
13. ¿Lightbox prueba cierre por Escape y foco?
14. ¿ContactForm prueba el error 429?
15. ¿AuthContext prueba restauración y logout?
16. ¿Qué umbrales de cobertura exige el proyecto?

Respuesta esperada: cada feature sigue Red → Green → Refactor y cubre sus estados de éxito, carga, vacío y error. Cobertura: 100% en `src/services/`, `src/hooks/` y `src/utils/`; global ≥90%.

## 3. Autenticación y autorización

17. ¿Qué endpoint inicia sesión?
18. ¿Dónde se guarda y cómo se envía el JWT?
19. ¿Qué diferencia hay entre una respuesta 401 y 403?
20. ¿Qué debe hacer el panel admin ante un 401/403?
21. ¿Qué rol puede acceder al panel admin?
22. ¿Las operaciones POST, PUT y DELETE admin envían Bearer token?
23. ¿Se muestran passwords o tokens en la UI o en Sentry?

Respuestas esperadas:

- `POST /api/v1/auth/login`.
- El mecanismo de sesión elegido debe documentarse; las peticiones admin usan `Authorization: Bearer <token>`.
- 401 `UNAUTHORIZED`: petición sin token. 403 `FORBIDDEN`: token inválido o expirado, o sin rol ADMIN.
- Limpiar la sesión y redirigir a `/admin/login`.
- `ADMIN`.
- Sí, mediante el cliente autenticado.
- Nunca.

## 4. Panel admin

24. ¿Qué significan los PUT de entidades del admin?
25. ¿Qué devuelven los listados `GET /api/v1/admin/...`?
26. ¿Qué campos exige `POST /api/v1/admin/paintings` además de los habituales?
27. ¿Cómo funciona la reordenación de entidades?
28. ¿Cómo se gestiona la biografía desde el admin?
29. ¿Cómo se pagina el listado de usuarios?
30. ¿Quién puede crear un nuevo administrador y con qué endpoint?

Respuestas esperadas:

- Actualización parcial: solo los campos a cambiar (mínimo 1 campo).
- TODO (publicado y no publicado), ordenado por `position asc`.
- `year` obligatorio (1900-2100) y `collectionId` obligatorio.
- `PUT /api/v1/admin/{collections,paintings,exhibitions,design,illustrations}/reorder` con `{ orderedIds }`; en paintings se envía solo `orderedIds` (el server ignora `collectionId`).
- Solo `POST /api/v1/admin/biography` (crear) y `PUT` (editar); no tiene delete ni reorder.
- `GET /api/v1/admin/users` responde `{ data, meta { total, page, limit, pages } }`.
- Un ADMIN existente, vía `POST /api/v1/admin/users/register` con Bearer token.

## 5. Archivos y contenido visual

31. ¿Qué tipos MIME acepta el upload?
32. ¿Cuál es el límite de tamaño?
33. ¿Qué datos devuelve el upload?
34. ¿Cómo se integra la imagen subida en la creación/edición de una entidad?
35. ¿Qué medidas de protección visual tienen las obras?
36. ¿La protección anti-descarga garantiza que una imagen no pueda copiarse?

Respuestas esperadas:

- JPEG, PNG y WebP.
- 5 MB.
- `url`, `thumbnail`, `width`, `height` y `format`.
- En 2 pasos y de forma transparente en el formulario: la `url` devuelta se envía como `imageUrl`/`coverImage` en el JSON del create/update; NUNCA se usan los campos multipart `image` de las entidades.
- `draggable=false`, bloqueo de contextmenu y overlay transparente.
- No; son medidas de interfaz, no una protección absoluta contra capturas o herramientas del navegador.

## 6. Accesibilidad, UX y SEO

37. ¿Las galerías tienen loading, error y estado vacío?
38. ¿Lightbox tiene `role="dialog"`, `aria-modal`, foco y cierre por Escape?
39. ¿Los formularios tienen labels y mensajes accesibles?
40. ¿Las imágenes tienen alt contextual y dimensiones estables?
41. ¿Qué metadatos SEO se generan para home, colección y pintura?
42. ¿El panel admin cumple los mismos criterios de accesibilidad?

Respuesta esperada (42): sí; tablas, paginador, diálogos con foco atrapado, formularios con labels y feedback de mutaciones por `aria-live`.

## 7. Calidad y despliegue

43. ¿Qué ejecuta `pnpm verify`?
44. ¿Qué pasos ejecuta el CI (`.github/workflows/ci.yml`)?
45. ¿Vitest excluye `e2e/**`?
46. ¿El frontend usa `VITE_API_URL` sin exponer secretos?
47. ¿Qué endpoint se usa para health check?
48. ¿Qué documento contiene las instrucciones de despliegue del backend?
49. ¿El cliente coincide con `server/docs/openapi.yaml`?

Respuestas esperadas:

- lint, tests unitarios, E2E y build.
- lint, `pnpm test:run` y build (la fase 18 añade el gate de coverage).
- Sí.
- Sí; los secretos permanecen en el backend.
- `GET /api/v1/health`.
- `server/docs/DEPLOY.md`.
- Sí, incluyendo rutas, métodos, campos, códigos de error y FormData.

## 8. Estructura esperada

```text
src/
├── app/
├── components/
├── constants/
├── features/
│   ├── home/
│   ├── painting/
│   ├── design/
│   ├── illustration/
│   ├── exhibitions/
│   ├── biography/
│   ├── contact/
│   └── admin/
├── context/
├── hooks/
├── models/
├── services/
├── styles/
├── utils/
├── infrastructure/
├── assets/
├── test/
├── App.jsx
├── main.jsx
└── index.scss

e2e/
├── pages/
├── support/
├── portfolio-journey.spec.js
└── admin-journey.spec.js
```

## 9. Verificación final

```bash
pnpm lint
pnpm test:run
pnpm test:e2e
pnpm build
pnpm verify
```

Resultado esperado: todos los comandos pasan, el portfolio público funciona, el login admin permite acceder al panel, las operaciones CRUD (crear, editar, borrar, reordenar, upload) respetan JWT y el frontend no usa endpoints inventados.
