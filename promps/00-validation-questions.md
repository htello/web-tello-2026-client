# Preguntas de Validación del Portfolio

Usa estas preguntas después de completar el proyecto. Las respuestas deben contrastarse con `server/docs/openapi.yaml`, `server/docs/0003-HU-PORTFOLIO.md` y el código real.

## 1. Dominio y API

1. ¿Qué secciones públicas tiene el portfolio?
2. ¿Qué endpoint devuelve las colecciones publicadas?
3. ¿Qué endpoint devuelve una colección con sus pinturas?
4. ¿Cómo se obtienen las obras destacadas?
5. ¿Qué datos técnicos puede mostrar una pintura?
6. ¿Qué subcategorías acepta `/api/v1/design`?
7. ¿Qué endpoint devuelve la biografía?
8. ¿Qué campos requiere `POST /api/v1/contact`?
9. ¿El contacto almacena mensajes en la base de datos?
10. ¿Qué endpoint se usa para subir imágenes y qué campo multipart recibe?

Respuestas esperadas:

- Pintura, exposiciones, diseño, ilustración, biografía y contacto.
- `GET /api/v1/collections`.
- `GET /api/v1/collections/:id`.
- `GET /api/v1/paintings/featured`.
- `dimensions`, `technique` y `year`, omitiendo los campos ausentes.
- `imagen-corporativa`, `packaging-expositores`, `carteleria` y `editorial`.
- `GET /api/v1/biography`.
- `name`, `email`, `subject` y `message`.
- No; el backend envía el email directamente con Nodemailer.
- `POST /api/v1/admin/upload`, campo `file`.

## 2. TDD

11. ¿Qué se crea primero, el test o `PaintingCard`?
12. ¿Qué utilidades puras tienen tests?
13. ¿Lightbox prueba cierre por Escape y foco?
14. ¿ContactForm prueba el error 429?
15. ¿AuthContext prueba restauración y logout?

Respuesta esperada: cada feature sigue Red → Green → Refactor y cubre sus estados de éxito, carga, vacío y error.

## 3. Autenticación y autorización

16. ¿Qué endpoint inicia sesión?
17. ¿Dónde se guarda y cómo se envía el JWT?
18. ¿Qué diferencia hay entre una respuesta 401 y 403?
19. ¿Qué rol puede acceder al panel admin?
20. ¿Las operaciones POST, PUT y DELETE admin envían Bearer token?
21. ¿Se muestran passwords o tokens en la UI o en Sentry?

Respuestas esperadas:

- `POST /api/v1/auth/login`.
- El mecanismo de sesión elegido debe documentarse; las peticiones admin usan `Authorization: Bearer <token>`.
- Pendiente de verificar en `server/docs/openapi.yaml`: no asignar significado a 401 o 403 ni intercambiarlos por conveniencia sin consultar el contrato real.
- `ADMIN`.
- Sí, mediante el cliente autenticado.
- Nunca.

## 4. Archivos y contenido visual

22. ¿Qué tipos MIME acepta el upload?
23. ¿Cuál es el límite de tamaño?
24. ¿Qué datos devuelve el upload?
25. ¿Qué medidas de protección visual tienen las obras?
26. ¿La protección anti-descarga garantiza que una imagen no pueda copiarse?

Respuestas esperadas:

- JPEG, PNG y WebP.
- 5 MB.
- `url`, `thumbnail`, `width`, `height` y `format`.
- `draggable=false`, bloqueo de contextmenu y overlay transparente.
- No; son medidas de interfaz, no una protección absoluta contra capturas o herramientas del navegador.

## 5. Accesibilidad, UX y SEO

27. ¿Las galerías tienen loading, error y estado vacío?
28. ¿Lightbox tiene `role="dialog"`, `aria-modal`, foco y cierre por Escape?
29. ¿Los formularios tienen labels y mensajes accesibles?
30. ¿Las imágenes tienen alt contextual y dimensiones estables?
31. ¿Qué metadatos SEO se generan para home, colección y pintura?

## 6. Calidad y despliegue

32. ¿Qué ejecuta `pnpm verify`?
33. ¿Vitest excluye `e2e/**`?
34. ¿El frontend usa `VITE_API_URL` sin exponer secretos?
35. ¿Qué endpoint se usa para health check?
36. ¿Qué documento contiene las instrucciones de despliegue del backend?
37. ¿El cliente coincide con `server/docs/openapi.yaml`?

Respuestas esperadas:

- lint, tests unitarios, E2E y build.
- Sí.
- Sí; los secretos permanecen en el backend.
- `GET /api/v1/health`.
- `server/docs/DEPLOY.md`.
- Sí, incluyendo rutas, métodos, campos, códigos de error y FormData.

## 7. Estructura esperada

```text
src/
├── app/
├── components/
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
├── utils/
├── infrastructure/
├── test/
├── App.jsx
├── main.jsx
└── index.scss

e2e/
├── pages/
└── portfolio-journey.spec.js
```

## 8. Verificación final

```bash
pnpm lint
pnpm test:run
pnpm test:e2e
pnpm build
pnpm verify
```

Resultado esperado: todos los comandos pasan, el portfolio público funciona, el login admin permite acceder al panel, las operaciones CRUD respetan JWT y el frontend no usa endpoints inventados.
